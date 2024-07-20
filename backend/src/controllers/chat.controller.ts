import { NextFunction, Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import { Types } from "mongoose";
import {
    ALERT,
    NEW_MESSAGE,
    NEW_MESSAGE_ALERT,
    REFETCH_CHATS,
} from "../constants/event";
import { getOtherMember } from "../lib/helper";
import Chat from "../models/chat.model";
import Message from "../models/message.model";
import User from "../models/user.model";
import { IChat } from "../types/chat.type";
import { IAttachment } from "../types/message.type";
import { IUser } from "../types/user.type";
import ApiError from "../utils/ApiError";
import asyncHandler from "../utils/asyncHandler";
import { deleteFromCloudinary, uploadToCloudinary } from "../utils/cloudinary";
import emitEvent from "../utils/emitEvent";

interface AuthenticatedRequest extends Request {
    user: {
        _id: string;
    } & JwtPayload;
}
// #region createGroup
const createGroup = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return next(new ApiError(401, "Unauthorized"));
        }

        const { chatName, members } = req.body;

        if (chatName.trim().length < 1) {
            return next(new ApiError(400, "Please enter a valid chat name"));
        }

        const existedGroupChat = await Chat.findOne({
            chatName,
        });

        if (existedGroupChat) {
            return next(new ApiError(400, "Group chat already exists"));
        }

        if (members.length < 2) {
            return next(new ApiError(400, "Please select at least 2 members"));
        }

        if (members.includes(req.user)) {
            return next(new ApiError(400, "User is already in the group"));
        }

        const allMembers = [...members, req.user];

        const groupChat = await Chat.create({
            chatName,
            isGroupChat: true,
            groupAdmin: req.user,
            members: allMembers,
        });

        if (!groupChat) {
            return next(new ApiError(500, "Failed to create group chat"));
        }

        emitEvent(
            req,
            ALERT,
            allMembers,
            `${req.user} created ${chatName} group`
        );

        emitEvent(
            req,
            REFETCH_CHATS,
            members,
            `${req.user} added ${members} to ${chatName} group`
        );

        return res.status(201).json({
            success: true,
            message: "Group created successfully",
        });
    }
);
// #region getMyChats
const getMyChats = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return next(new ApiError(401, "Unauthorized"));
        }

        const chats = await Chat.find({
            members: req.user,
        }).populate("members", "fullName avatar");

        if (!chats) {
            return next(new ApiError(500, "Failed to fetch chats"));
        }

        const transformedChats = chats.map(
            ({ _id, chatName, isGroupChat, members }: IChat) => {
                const otherMember = getOtherMember(members, req.user);

                return {
                    _id,
                    isGroupChat,
                    // groupAdmin: isGroupChat ? groupAdmin : undefined,
                    avatar: isGroupChat
                        ? members.slice(0, 3).map(({ avatar }) => avatar.url)
                        : [otherMember?.avatar.url],
                    chatName: isGroupChat ? chatName : otherMember?.fullName,
                    members: members.reduce(
                        (
                            prev: Types.ObjectId[],
                            curr: IUser,
                            index: number,
                            arr: IUser[]
                        ) => {
                            if (curr._id.toString() !== req.user.toString()) {
                                prev.push(new Types.ObjectId(curr._id));
                            }
                            return prev;
                        },
                        []
                    ),
                };
            }
        );

        return res.status(200).json({
            success: true,
            chats: transformedChats,
        });
    }
);
// #region getMyGroup
const getMyGroups = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return next(new ApiError(401, "Unauthorized"));
        }

        const chats = await Chat.find({
            members: req.user,
            isGroupChat: true,
            groupAdmin: req.user,
        }).populate("members", "fullName avatar");

        if (!chats) {
            return next(new ApiError(500, "Failed to fetch groups"));
        }

        const groups = chats.map(
            ({ _id, chatName, isGroupChat, members }: IChat) => {
                return {
                    _id,
                    chatName,
                    isGroupChat,
                    avatar: members
                        .slice(0, 3)
                        .map(({ avatar }) => avatar.url)
                        .filter((avatar) => avatar !== undefined),
                };
            }
        );

        return res.status(200).json({
            success: true,
            groups,
            message: "Groups fetched successfully",
        });
    }
);
// #region addMembers
const addMembers = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return next(new ApiError(401, "Unauthorized"));
        }

        const { chatId, members } = req.body;

        // if (!chatId || !members) {
        //     return next(new ApiError(400, "All fields are required"));
        // }

        const chat = await Chat.findById(chatId);

        if (!chat) {
            return next(new ApiError(404, "Chat not found"));
        }

        if (!chat.isGroupChat) {
            return next(new ApiError(400, "This is not a group chat"));
        }

        if (chat.members.length > 10) {
            return next(new ApiError(400, "Group members cannot exceed 10"));
        }

        if (chat.groupAdmin.toString() !== req.user.toString()) {
            return next(new ApiError(403, "Only group admin can add members"));
        }

        const allNewMembersPromise = members.map((member: IUser) =>
            User.findById(member, "fullName")
        );

        const allNewMembers = await Promise.all(allNewMembersPromise);

        const uniqueMembers = allNewMembers
            .filter((member) => !chat.members.includes(member._id.toString()))
            .map((member) => member._id);

        chat.members.push(...uniqueMembers);

        await chat.save();

        const allMembersName = allNewMembers
            .map((member: IUser) => member.fullName)
            .join(", ");

        emitEvent(
            req,
            ALERT,
            chat.members,
            `${allMembersName} has been added to the group.`
        );

        emitEvent(req, REFETCH_CHATS, chat.members, "");

        return res.status(200).json({
            success: true,
            message:
                allNewMembers.length > 1
                    ? "Group members added successfully"
                    : "Group member added successfully",
        });
    }
);
// #region removeMember
const removeMember = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return next(new ApiError(401, "Unauthorized"));
        }

        const { chatId, userId } = req.body;

        if (!chatId || !userId) {
            return next(new ApiError(400, "All fields are required"));
        }

        const [chat, user] = await Promise.all([
            Chat.findById(chatId),
            User.findById(userId, "fullName"),
        ]);

        if (!chat) {
            return next(new ApiError(404, "Chat not found"));
        }

        if (!chat.isGroupChat) {
            return next(new ApiError(400, "Not a group chat"));
        }

        if (chat.groupAdmin.toString() !== req.user.toString()) {
            return next(
                new ApiError(403, "Only group admin can remove members")
            );
        }

        if (chat.members.length <= 3) {
            return next(
                new ApiError(400, "Group must have at least 3 members")
            );
        }

        const allChatMembers = chat.members.map((member: IUser) => member);

        chat.members = chat.members.filter(
            (member: IUser) => member.toString() !== userId.toString()
        );

        await chat.save();

        emitEvent(req, ALERT, chat.members, {
            chatId,
            message: `${user?.fullName} has been removed from the group`,
        });

        emitEvent(req, REFETCH_CHATS, allChatMembers, "");

        return res.status(200).json({
            success: true,
            message: "Group member removed successfully",
        });
    }
);
// #region leaveGroup
const leaveGroup = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return next(new ApiError(401, "Unauthorized"));
        }

        const chatId = req.params.chatId;

        if (!chatId) {
            return next(new ApiError(400, "Chat ID is required"));
        }

        const chat = await Chat.findById(chatId);

        if (!chat) {
            return next(new ApiError(404, "Chat not found"));
        }

        if (!chat.isGroupChat) {
            return next(new ApiError(400, "This is not a group chat"));
        }

        const remainingMembers = chat.members.filter(
            (member: IUser) => member.toString() !== req.user?.toString()
        );

        if (remainingMembers.length < 3) {
            return next(
                new ApiError(400, "Group must have at least 3 members")
            );
        }

        if (chat.groupAdmin.toString() === req.user.toString()) {
            const randomElement = Math.floor(
                Math.random() * remainingMembers.length
            );
            const newGroupAdmin = remainingMembers[randomElement];

            chat.groupAdmin = newGroupAdmin;
        }

        chat.members = remainingMembers;

        const [user] = await Promise.all([
            User.findById(req.user, "fullName"),
            chat.save(),
        ]);

        await chat.save();

        emitEvent(req, ALERT, chat.members, {
            chatId,
            message: `${user?.fullName} has left the group`,
        });

        return res.status(200).json({
            success: true,
            message: "You have left the group",
        });
    }
);
// #region sendAttachments
const sendAttachments = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return next(new ApiError(401, "Unauthorized"));
        }

        const { chatId } = req.body;

        if (!chatId) {
            return next(new ApiError(400, "Chat ID is required"));
        }

        const [chat, me] = await Promise.all([
            Chat.findById(chatId),
            User.findById(req.user, "fullName"),
        ]);

        if (!chat) {
            return next(new ApiError(404, "Chat not found"));
        }

        const files = req?.files || [];

        if (!files || files.length === 0 || !Array.isArray(files)) {
            return next(new ApiError(400, "No files found"));
        }

        if (files.length > 5) {
            return next(new ApiError(400, "Maximum 5 files can be uploaded"));
        }

        const attachments: IAttachment[] = await uploadToCloudinary(files);

        const messageForDB = {
            content: "",
            attachments,
            sender: me?._id,
            chat: chatId,
        };

        const messageForRealTime = {
            ...messageForDB,
            sender: {
                _id: me?._id,
                fullName: me?.fullName,
            },
        };

        const message = await Message.create(messageForDB);

        emitEvent(req, NEW_MESSAGE, chat.members, {
            message: messageForRealTime,
            chatId,
        });

        emitEvent(req, NEW_MESSAGE_ALERT, chat.members, {
            chatId,
        });

        return res.status(200).json({
            success: true,
            message,
        });
    }
);
// #region getChatDetails
const getChatDetails = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return next(new ApiError(401, "Unauthorized"));
        }

        if (req.query.populate === "true") {
            const chat = await Chat.findById(req.params.id)
                .populate("members", "fullName avatar")
                .lean();

            if (!chat) {
                return next(new ApiError(400, "Chat not found"));
            }

            const simplifiedMembers = chat.members.map((member: IUser) => ({
                _id: member._id,
                fullName: member.fullName,
                avatar: member.avatar,
            }));

            const responseChat = {
                ...chat,
                members: simplifiedMembers,
            };

            return res.status(200).json({
                success: true,
                chat: responseChat,
            });
        } else {
            const chat = await Chat.findById(req.params.id);

            if (!chat) {
                return next(new ApiError(400, "Chat not found"));
            }

            return res.status(200).json({
                success: true,
                chat,
            });
        }
    }
);
// #region renameGroup
const renameGroup = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return next(new ApiError(401, "Unauthorized"));
        }

        const chatId = req.params.id;
        const { chatName } = req.body;

        const chat = await Chat.findById(chatId);

        if (!chat) {
            return next(new ApiError(404, "Chat not found"));
        }

        if (!chat.isGroupChat) {
            return next(new ApiError(400, "This is not a group chat"));
        }

        if (chat.groupAdmin.toString() !== req.user.toString()) {
            return next(new ApiError(403, "Only group admin can rename group"));
        }

        chat.chatName = chatName;

        await chat.save();

        emitEvent(
            req,
            REFETCH_CHATS,
            chat.members,
            `Group name has been changed to ${chatName}`
        );

        return res.status(200).json({
            success: true,
            message: `Group name has been changed to ${chatName}`,
        });
    }
);
// #region deleteChat
const deleteChat = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return next(new ApiError(401, "Unauthorized"));
        }

        const chatId = req.params.id;

        if (!chatId) {
            return next(new ApiError(400, "Chat ID is required"));
        }

        const chat = await Chat.findById(chatId);

        if (!chat) {
            return next(new ApiError(404, "Chat not found"));
        }

        const members = chat.members;

        if (
            chat.isGroupChat &&
            chat.groupAdmin.toString() !== req.user.toString()
        ) {
            return next(new ApiError(403, "Only group admin can delete group"));
        }

        if (
            !chat.isGroupChat &&
            !chat.members.some(
                (member) => member._id.toString() === req.user?.toString()
            )
        ) {
            return next(
                new ApiError(403, "You are not allowed to delete the chat")
            );
        }

        const messagesWithAttachments = await Message.find({
            chat: chatId,
            attachments: {
                $exists: true,
                $ne: [],
            },
        });

        const public_ids: string[] = [];

        messagesWithAttachments.forEach(
            ({ attachments }: { attachments: IAttachment[] }) => {
                attachments.forEach(({ public_id }: IAttachment) =>
                    public_ids.push(public_id)
                );
            }
        );

        await Promise.all([
            deleteFromCloudinary(public_ids),
            chat.deleteOne(),
            Message.deleteMany({ chat: chatId }),
        ]);

        emitEvent(req, REFETCH_CHATS, members, "Chat has been deleted");

        return res.status(200).json({
            success: true,
            message: "Chat deleted successfully",
        });
    }
);
// #region geetMessages
const getMessages = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return next(new ApiError(401, "Unauthorized"));
        }

        const chatId = req.params.id;
        const { page = 1 } = req.query;

        if (!chatId) {
            return next(new ApiError(400, "Chat ID is required"));
        }

        const chat = await Chat.findById(chatId);

        if (!chat) {
            return next(new ApiError(404, "Chat not found"));
        }

        const isMember = chat.members.some(
            (member: IUser) => member._id.toString() === req.user?.toString()
        );

        if (!isMember) {
            return next(
                new ApiError(403, "You are not a member of this group")
            );
        }

        const perPage = 20;
        const skip = ((page as number) - 1) * perPage;

        const [messages, totalMessages] = await Promise.all([
            Message.find({ chat: chatId })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(perPage)
                .populate("sender", "fullName")
                .lean(),
            Message.countDocuments({ chat: chatId }),
        ]);

        const totalPages = Math.ceil(totalMessages / perPage) || 0;

        return res.status(200).json({
            success: true,
            messages: messages.reverse(),
            totalPages,
        });
    }
);

export {
    addMembers,
    createGroup,
    deleteChat,
    getChatDetails,
    getMessages,
    getMyChats,
    getMyGroups,
    leaveGroup,
    removeMember,
    renameGroup,
    sendAttachments,
};
