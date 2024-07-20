import { Document } from "mongoose";
import { IUser } from "./user.type";

export interface IRequest extends Document {
    status: string;
    sender: IUser;
    receiver: IUser;
}
