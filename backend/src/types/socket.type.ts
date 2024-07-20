import { Socket } from "socket.io";
import { IUser } from "./user.type";

export interface CustomSocket extends Socket {
    user?: IUser;
}
