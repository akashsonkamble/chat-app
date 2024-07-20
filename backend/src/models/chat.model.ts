import mongoose, { Model, Schema, model } from "mongoose";
import { IChat } from "../types/chat.type";

const chatSchema = new Schema<IChat>(
    {
        _id: {
            type: Schema.Types.ObjectId,
            required: true,
            auto: true,
        },
        chatName: {
            type: String,
            required: true,
            trim: true,
        },
        isGroupChat: {
            type: Boolean,
            default: false,
        },
        groupAdmin: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        members: [
            {
                type: Schema.Types.ObjectId,
                ref: "User",
            },
        ],
    },
    {
        timestamps: true,
    }
);

const Chat: Model<IChat> =
    (mongoose.models.Chat as Model<IChat>) || model<IChat>("Chat", chatSchema);

export default Chat;
