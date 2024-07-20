import { Stack } from "@mui/material";
import React from "react";
import { bgGradient } from "../../constants/colors";
import { ChatListProps } from "../../types";
import ChatItem from "../shared/ChatItem";

const ChatList: React.FC<ChatListProps> = ({
    w = "100%",
    chatId,
    chats = [],
    onlineUsers = [],
    newMessagesAlert = [
        {
            chatId: "",
            count: 0,
        },
    ],
    chatDeleteHandler,
}) => {
    return (
        <Stack
            width={w}
            direction={"column"}
            overflow={"auto"}
            height={"100%"}
            sx={{
                backgroundImage: bgGradient,
            }}
        >
            {chats?.map((data) => {
                const { avatar, chatName, _id, isGroupChat, members } = data;

                const newMessageAlert = newMessagesAlert.find(
                    ({ chatId }) => chatId === _id
                );

                const isOnline = members?.some((member) =>
                    onlineUsers.includes(member)
                );
                return (
                    <ChatItem
                        key={_id}
                        newMessageAlert={newMessageAlert}
                        isOnline={isOnline}
                        avatar={avatar}
                        chatName={chatName}
                        _id={_id}
                        isGroupChat={isGroupChat}
                        sameSender={chatId === _id}
                        chatDeleteHandler={chatDeleteHandler}
                    />
                );
            })}
        </Stack>
    );
};

export default ChatList;