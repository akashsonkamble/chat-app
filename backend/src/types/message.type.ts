import { Document } from "mongoose";
import { IChat } from "./chat.type";
import { IUser } from "./user.type";

export interface IAttachment {
    public_id: string;
    url: string;
}

export interface IMessage extends Document {
    content: string;
    attachments: IAttachment[];
    sender: IUser;
    chat: IChat;
}
