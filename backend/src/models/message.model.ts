import mongoose, { Model, Schema, model } from "mongoose";
import { IAttachment, IMessage } from "../types/message.type";

const attachmentSchema = new Schema<IAttachment>({
    public_id: {
        type: String,
        required: true,
    },
    url: {
        type: String,
        required: true,
    },
});

const messageSchema = new Schema<IMessage>(
    {
        content: String,
        attachments: [
            {
                type: attachmentSchema,
            },
        ],
        sender: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        chat: {
            type: Schema.Types.ObjectId,
            ref: "Chat",
        },
    },
    {
        timestamps: true,
    }
);

const Message: Model<IMessage> =
    (mongoose.models.Message as Model<IMessage>) ||
    model<IMessage>("Message", messageSchema);

export default Message;
