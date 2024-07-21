import * as cookieParser from "cookie-parser";
import * as cors from "cors";
import * as express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { v4 as uuid } from "uuid";
import { corsOptions } from "./constants/config";
import {
    CHAT_JOINED,
    CHAT_LEFT,
    NEW_MESSAGE,
    NEW_MESSAGE_ALERT,
    ONLINE_USERS,
    START_TYPING,
    STOP_TYPING,
} from "./constants/event";
import { getSockets } from "./lib/helper";
import { logger } from "./logs/index";
import { isSocketAuthenticated } from "./middlewares/auth.middleware";
import errorMiddleware from "./middlewares/error.middleware";
import Message from "./models/message.model";
import { CustomSocket } from "./types/socket.type";
import { IUser } from "./types/user.type";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({
    path: path.resolve(__dirname, "../.env"),
});

const app = express();
const server = createServer(app);
const io = new Server(server, { cors: corsOptions });
app.use(cors(corsOptions));

app.set("io", io);

app.use(cookieParser());
app.use(express.json({ limit: "16kb" })); // specifically for parsing JSON payloads (req.body)
app.use(express.urlencoded({ extended: true, limit: "16kb" })); // for parsing URL-encoded payloads.
app.use(express.static("public")); // for static files like css and images

//routes import

import chatRoutes from "./routes/chat.routes";
import userRoutes from "./routes/user.routes";

//routes declaration

app.use("/api/v1/users", userRoutes);
app.use("/api/v1/chats", chatRoutes);

export const userSocketIDs = new Map<string, string>();
const onlineUsers = new Set<string>();

io.use((socket: CustomSocket, next) => {
    const req = socket.request as express.Request & { res?: express.Response };
    const res = req.res || ({} as express.Response);

    if (!socket.request) {
        return next(new Error("Socket request not available"));
    }

    cookieParser()(req, res, async (error: any) => {
        await isSocketAuthenticated(error, socket, next);
    });
});

io.on("connection", (socket: CustomSocket) => {
    const user = socket.user;

    if (!user) {
        logger.info("No user found, disconnecting socket");
        return socket.disconnect();
    }

    userSocketIDs.set(user._id.toString(), socket.id);

    socket.on(NEW_MESSAGE, async ({ chatId, members, message }) => {
        if (!members) {
            logger.error("Members array is undefined or empty");
            return;
        }
        const messageForRealTime = {
            _id: uuid(),
            content: message,
            sender: {
                _id: user._id,
                fullName: user.fullName,
            },
            chat: chatId,
            createdAt: new Date().toString(),
        };

        const messageForDB = {
            content: message,
            sender: user._id,
            chat: chatId,
        };

        const membersSocket = getSockets(members as IUser[]);

        io.to(membersSocket).emit(NEW_MESSAGE, {
            chatId,
            message: messageForRealTime,
        });

        io.to(membersSocket).emit(NEW_MESSAGE_ALERT, { chatId });

        try {
            await Message.create(messageForDB);
            logger.info("Message saved to database");
        } catch (error: any) {
            logger.error("Error saving message to database: ", error);
            throw new Error(error);
        }
    });

    socket.on(START_TYPING, ({ chatId, members }) => {
        const membersSocket = getSockets(members as IUser[]);
        socket.to(membersSocket).emit(START_TYPING, { chatId });
    });

    socket.on(STOP_TYPING, ({ chatId, members }) => {
        const membersSocket = getSockets(members as IUser[]);
        socket.to(membersSocket).emit(STOP_TYPING, { chatId });
    });

    socket.on(CHAT_JOINED, ({ userId, members }) => {
        onlineUsers.add(userId.toString());

        const membersSocket = getSockets(members);
        io.to(membersSocket).emit(ONLINE_USERS, Array.from(onlineUsers));
    });

    socket.on(CHAT_LEFT, ({ userId, members }) => {
        onlineUsers.delete(userId.toString());

        const membersSocket = getSockets(members as IUser[]);
        io.to(membersSocket).emit(ONLINE_USERS, Array.from(onlineUsers));
    });

    socket.on("disconnect", () => {
        userSocketIDs.delete(user._id.toString());
        onlineUsers.delete(user._id.toString());
        socket.broadcast.emit(ONLINE_USERS, Array.from(onlineUsers));
        logger.info("user disconnected: ", userSocketIDs);
    });
});

app.use(errorMiddleware);

export { app, server };
