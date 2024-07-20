import { JwtPayload } from "jsonwebtoken";
import { userSocketIDs } from "../app";
import { IUser } from "../types/user.type";

const getOtherMember = (
    members: IUser[],
    userId: JwtPayload & { _id: string }
) => {
    return members.find(
        (member: IUser) => member._id.toString() !== userId.toString()
    );
};

const getSockets = (users: IUser[] = []) => {
    const sockets = users
        .map((user) => userSocketIDs.get(user.toString()))
        .filter((socketId): socketId is string => !!socketId);

    return sockets;
};

export { getOtherMember, getSockets };
