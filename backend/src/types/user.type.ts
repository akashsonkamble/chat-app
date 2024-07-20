import { Document, Types } from "mongoose";

export interface IAvatar {
    public_id: string;
    url: string;
}
export interface IUser extends Document {
    _id: Types.ObjectId;
    fullName: string;
    username: string;
    email: string;
    avatar: IAvatar;
    password: string;
}
