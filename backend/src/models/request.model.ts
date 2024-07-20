import mongoose, { Model, Schema, model } from "mongoose";
import { IRequest } from "../types/request.type";

const requestSchema = new Schema<IRequest>(
    {
        status: {
            type: String,
            default: "pending",
            enum: ["pending", "accepted", "rejected"],
        },
        sender: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        receiver: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const Request: Model<IRequest> =
    (mongoose.models.Request as Model<IRequest>) ||
    model<IRequest>("Request", requestSchema);

export default Request;
