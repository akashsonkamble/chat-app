import { NextFunction, Response } from "express";
import * as jwt from "jsonwebtoken";
import { CHAT_FUSION_TOKEN } from "../constants/config";
import User from "../models/user.model";
import { IRequest } from "../types/jwt.type";
import { CustomSocket } from "../types/socket.type";
import ApiError from "../utils/ApiError";
import asyncHandler from "../utils/asyncHandler";

const isAuthenticated = asyncHandler(
    async (req: IRequest, res: Response, next: NextFunction) => {
        const token = req.cookies.jwt;
        // const token = req.cookies[CHAT_FUSION_TOKEN];

        if (!token) {
            return next(new ApiError(401, "Please login to access this route"));
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_TOKEN_SECRET as string,
            {
                maxAge: process.env.JWT_MAX_AGE as string,
            }
        ) as jwt.JwtPayload;

        req.user = decoded._id;

        next();
    }
);

const isSocketAuthenticated = async (
    error: any,
    socket: CustomSocket,
    next: (err?: any) => void
) => {
    try {
        if (error) return next(error);

        const req = socket.request as any;
        const authToken = req.cookies[CHAT_FUSION_TOKEN];

        if (!authToken)
            return next(new ApiError(401, "Please login to access this route"));

        const decodedData = jwt.verify(
            authToken,
            process.env.JWT_TOKEN_SECRET as string,
            {
                maxAge: process.env.JWT_MAX_AGE as string,
            }
        ) as jwt.JwtPayload;

        const user = await User.findById(decodedData._id);

        if (!user) return next(new ApiError(404, "User not found"));

        socket.user = user;

        return next();
    } catch (error) {
        return next(error);
    }
};

export { isAuthenticated, isSocketAuthenticated };
