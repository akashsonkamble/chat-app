import { Document, Types } from "mongoose";
import { IUser } from "./user.type";

export interface IChat extends Document {
    _id: Types.ObjectId;
    chatName: string;
    isGroupChat: boolean;
    groupAdmin: IUser;
    members: IUser[];
}
