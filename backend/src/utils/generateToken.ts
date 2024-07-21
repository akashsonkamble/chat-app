import { Response } from "express";
import * as jwt from "jsonwebtoken";
import { IUser } from "../types/user.type";

export const cookieOptions = {
    maxAge: 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite:
        process.env.NODE_ENV === "production"
            ? ("None" as "none")
            : ("Lax" as "lax"),
};

const generateToken = (
    res: Response,
    user: IUser,
    statusCode: number,
    message: string
) => {
    const token = jwt.sign(
        {
            _id: user._id,
        },
        process.env.JWT_TOKEN_SECRET as string,
        {
            expiresIn: process.env.JWT_TOKEN_EXPIRES_IN as string,
        }
    );

    return res
        .status(statusCode)
        .cookie("jwt", token, cookieOptions)
        .json({ sucess: true, user, message });
};

export default generateToken;
