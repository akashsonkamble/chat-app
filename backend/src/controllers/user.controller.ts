import * as bcrypt from "bcryptjs";
import { Request as ExpressRequest, NextFunction, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import { Types } from "mongoose";
import { NEW_REQUEST, REFETCH_CHATS } from "../constants/event";
import { getOtherMember } from "../lib/helper";
import Chat from "../models/chat.model";
import Request from "../models/request.model";
import User from "../models/user.model";
import ApiError from "../utils/ApiError";
import asyncHandler from "../utils/asyncHandler";
import { uploadToCloudinary } from "../utils/cloudinary";
import emitEvent from "../utils/emitEvent";
import generateToken, { cookieOptions } from "../utils/generateToken";

interface AuthenticatedRequest extends ExpressRequest {
    user: {
        _id: string;
    } & JwtPayload;
}
// #region signup
const signup = asyncHandler(
    async (req: ExpressRequest, res: Response, next: NextFunction) => {
        const { fullName, username, email, password } = req.body;

        const file = req.file as Express.Multer.File;

        if (!file) {
            return next(new ApiError(400, "Avatar is required"));
        }

        if (
            [fullName, email, username, password].some(
                (field) => field?.trim() === ""
            )
        ) {
            return next(new ApiError(400, "All fields are required"));
        }

        const existedUser = await User.findOne({ username });

        if (existedUser) {
            return next(new ApiError(400, "User already exists"));
        }

        const result = await uploadToCloudinary([file]);

        const avatar = {
            public_id: result[0].public_id,
            url: result[0].url,
        };

        const user = await User.create({
            fullName,
            username: username.toLowerCase(),
            email,
            avatar,
            password,
        });

        const createdUser = await User.findById({ _id: user._id });

        if (!createdUser) {
            return next(new ApiError(500, "Failed to create user"));
        }

        await createdUser.save();

        generateToken(res, createdUser, 201, "User created successfully");
    }
);
// #region login
const login = asyncHandler(
    async (req: ExpressRequest, res: Response, next: NextFunction) => {
        const { username, password } = req.body;

        if ([username, password].some((field) => field?.trim() === "")) {
            return next(new ApiError(400, "All fields are required"));
        }

        if (!username || !password) {
            return next(
                new ApiError(400, "Username and password are required")
            );
        }

        const user = await User.findOne({ username }).select("+password");

        if (!user) {
            return next(new ApiError(404, "Invalid Username or Password"));
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return next(new ApiError(401, "Invalid credentials"));
        }

        generateToken(res, user, 200, `Welcome back, ${user.fullName}!`);
    }
);
// #region logout
const logout = asyncHandler(
    async (req: ExpressRequest, res: Response, next: NextFunction) => {
        const token = req.cookies.jwt;

        return res
            .status(200)
            .cookie("jwt", "", {
                ...cookieOptions,
                maxAge: 0,
            })
            .json({
                success: true,
                message: "You have been logged out successfully",
            });
    }
);
// #region getProfile
const getProfile = asyncHandler(
    async (req: ExpressRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return next(new ApiError(401, "Unauthorized"));
        }

        const user = await User.findById(req.user);

        if (!user) {
            return next(new ApiError(404, "User not found"));
        }
        res.status(200).json({
            success: true,
            user,
        });
    }
);
// #region searchUser
const searchUser = asyncHandler(
    async (req: ExpressRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return next(new ApiError(401, "Unauthorized"));
        }

        const { name = "" } = req.query;

        const myChats = await Chat.find({
            isGroupChat: false,
            members: req.user,
        });

        const allUsersFromMyChats = myChats.map((chat) => chat.members).flat();

        const allRegisteredUsers = await User.find({
            _id: { $nin: [...allUsersFromMyChats, req.user] },
            fullName: { $regex: name, $options: "i" },
        });

        const users = allRegisteredUsers.map(({ _id, fullName, avatar }) => ({
            _id,
            fullName,
            avatar: avatar,
        }));

        return res.status(200).json({
            success: true,
            users: users,
        });
    }
);
// #region sendFriendRequest
const sendFriendRequest = asyncHandler(
    async (req: ExpressRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return next(new ApiError(401, "Unauthorized"));
        }

        const { userId } = req.body;

        if (!userId) {
            return next(new ApiError(400, "User ID is required"));
        }

        const user = await User.findById(userId);

        if (!user) {
            return next(new ApiError(404, "User not found"));
        }

        if (user._id.toString() === req.user.toString()) {
            return next(
                new ApiError(400, "You cannot send friend request to yourself")
            );
        }

        const senderId = Types.ObjectId.createFromHexString(
            req.user.toString()
        );

        const receiverId = Types.ObjectId.createFromHexString(userId);

        const request = await Request.findOne({
            $or: [
                { sender: senderId, receiver: receiverId },
                { sender: receiverId, receiver: senderId },
            ],
        });

        if (request) {
            return next(new ApiError(400, "Request already sent"));
        }

        await Request.create({
            sender: senderId,
            receiver: receiverId,
        });

        emitEvent(req, NEW_REQUEST, [userId], {
            sender: req.user,
            message: "sent you a friend request",
        });

        return res.status(200).json({
            success: true,
            message: "Friend request sent successfully",
        });
    }
);
// #region acceptFriendRequest
const acceptFriendRequest = asyncHandler(
    async (req: ExpressRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return next(new ApiError(401, "Unauthorized"));
        }

        const { requestId, accept } = req.body;

        if (!requestId) {
            return next(new ApiError(400, "Receiver ID is required"));
        }

        const request = await Request.findById(requestId)
            .populate("sender", "fullName")
            .populate("receiver", "fullName");

        if (!request) {
            return next(new ApiError(404, "Request not found"));
        }

        if (request.receiver._id.toString() !== req.user.toString()) {
            return next(new ApiError(401, "You cannot accept this request"));
        }

        if (!accept) {
            await request.deleteOne();

            return res.status(200).json({
                success: true,
                message: "Friend request rejected successfully",
            });
        }

        const members = [request.sender._id, request.receiver._id];

        await Promise.all([
            Chat.create({
                isGroupChat: false,
                chatName: `${request.sender.fullName}-${request.receiver.fullName}`,
                members,
            }),
            request.deleteOne(),
        ]);

        emitEvent(req, REFETCH_CHATS, members, {
            message: "has added you as a friend",
        });

        emitEvent(
            req,
            REFETCH_CHATS,
            members,
            `${request.sender.fullName} has added you as a friend`
        );

        return res.status(200).json({
            success: true,
            message: "Friend request accepted successfully",
            senderId: request.sender._id,
        });
    }
);
// #region getMyNotifications
const getMyNotifications = asyncHandler(
    async (req: ExpressRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return next(new ApiError(401, "Unauthorized"));
        }

        const request = await Request.find({
            receiver: req.user,
        }).populate("sender", "fullName avatar");

        const notifications = request.map(({ _id, sender }) => ({
            _id,
            sender: {
                _id: sender._id,
                fullName: sender.fullName,
                avatar: sender.avatar,
            },
        }));

        return res.status(200).json({
            success: true,
            notifications,
        });
    }
);
// #region getMyFriends
const getMyFriends = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return next(new ApiError(401, "Unauthorized"));
        }

        const chatId = req.query.id;

        const chats = await Chat.find({
            members: req.user,
            isGroupChat: false,
        }).populate("members", "fullName avatar");

        const friends = chats.map(({ members }) => {
            const otherMember = getOtherMember(members, req.user);

            return {
                _id: otherMember?._id,
                fullName: otherMember?.fullName,
                avatar: otherMember?.avatar,
            };
        });

        if (chatId) {
            const chat = await Chat.findById(chatId);

            const availableFriends = friends.filter(
                (friend) =>
                    !chat?.members.some((member) => member._id === friend._id)
            );

            return res.status(200).json({
                success: true,
                friends: availableFriends,
            });
        } else {
            return res.status(200).json({
                success: true,
                friends,
            });
        }
    }
);

export {
    acceptFriendRequest,
    getMyFriends,
    getMyNotifications,
    getProfile,
    login,
    logout,
    searchUser,
    sendFriendRequest,
    signup,
};
