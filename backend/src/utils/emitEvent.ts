import { Request } from "express";
import { Types } from "mongoose";
import { getSockets } from "../lib/helper";
import { IUser } from "../types/user.type";

const emitEvent = (
    req: Request,
    eventName: string,
    users: IUser[] | Types.ObjectId[],
    data: string | object
) => {
    const io = req.app.get("io");
    const userSocket = getSockets(users as IUser[]);
    io.to(userSocket).emit(eventName, data);
};

export default emitEvent;
