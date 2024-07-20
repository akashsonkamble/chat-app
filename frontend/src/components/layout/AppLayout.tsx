import { Drawer, Grid, Skeleton } from "@mui/material";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMyChatsQuery } from "../../redux/api/api";
import {
    setIsDeleteMenu,
    setIsMobileMenu,
    setSelectedDeleteChat,
} from "../../redux/reducers/misc";
import { ChatListProps, UserProps } from "../../types";
import Title from "../shared/Title";
import ChatList from "../specific/ChatList";
import Profile from "../specific/Profile";
import Header from "./Header";

import { getSocket } from "../../Socket";
import {
    NEW_MESSAGE_ALERT,
    NEW_REQUEST,
    ONLINE_USERS,
    REFETCH_CHATS,
} from "../../constants/event";
import { useErrors, useSocketEvents } from "../../hooks/Hooks";
import { getOrSaveFromLocalStorage } from "../../lib/features";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import {
    incrementNotification,
    setNewMessagesAlert,
} from "../../redux/reducers/chat";
import DeleteChatMenu from "../dialogs/DeleteChatMenu";

const AppLayout = <P extends object>(
    WrappedComponent: React.ComponentType<P>
): React.FC<P> => {
    return (props: P) => {
        const params = useParams();

        const chatId = params.chatId as string;
        const deleteMenuAnchor = useRef<
            (EventTarget & HTMLAnchorElement) | null
        >(null);

        const navigate = useNavigate();

        const socket = getSocket();

        const dispatch = useAppDispatch();
        const { user } = useAppSelector((state) => state.auth);
        const { isMobileMenu } = useAppSelector((state) => state.misc);
        const { newMessagesAlert } = useAppSelector((state) => state.chat);

        const [onlineUsers, setOnlineUsers] = useState<UserProps["_id"][]>([]);

        const { isLoading, data, isError, error, refetch } =
            useMyChatsQuery("");

        useErrors([{ isError, error }]);

        const chatDeleteHandler: ChatListProps["chatDeleteHandler"] = (
            e,
            chatId,
            isGroupChat
        ) => {
            dispatch(setIsDeleteMenu(true));
            dispatch(setSelectedDeleteChat({ chatId, isGroupChat }));
            deleteMenuAnchor.current = e.currentTarget;
        };

        const closeMobileMenuHandler = () => dispatch(setIsMobileMenu(false));

        const newMessageAlertListener = useCallback(
            (data: { chatId: string; count: number }) => {
                if (data.chatId === chatId) return;

                dispatch(setNewMessagesAlert(data));
            },
            [chatId]
        );

        const newRequestListener = useCallback(() => {
            dispatch(incrementNotification());
        }, [dispatch]);

        const refetchListener = useCallback(() => {
            refetch();
            navigate("/");
        }, [refetch, navigate]);

        const onlineUsersListener = useCallback(
            (data: UserProps["_id"][]) => {
                setOnlineUsers(data);
            },
            [chatId]
        );

        const eventsHandler = {
            [NEW_MESSAGE_ALERT]: newMessageAlertListener,
            [NEW_REQUEST]: newRequestListener,
            [REFETCH_CHATS]: refetchListener,
            [ONLINE_USERS]: onlineUsersListener,
        };

        useSocketEvents(socket, eventsHandler);

        useEffect(() => {
            getOrSaveFromLocalStorage({
                key: NEW_MESSAGE_ALERT,
                value: newMessagesAlert,
                get: true,
            });
        }, [newMessagesAlert]);

        return (
            <>
                <Title />
                <Header />
                <DeleteChatMenu
                    dispatch={dispatch}
                    deleteMenuAnchor={deleteMenuAnchor}
                />

                {isLoading ? (
                    <Skeleton />
                ) : (
                    <Drawer
                        open={isMobileMenu}
                        onClose={closeMobileMenuHandler}
                    >
                        <ChatList
                            w="70vw"
                            chats={data?.chats as ChatListProps["chats"]}
                            chatId={chatId}
                            newMessagesAlert={newMessagesAlert}
                            onlineUsers={onlineUsers}
                            chatDeleteHandler={chatDeleteHandler}
                        />
                    </Drawer>
                )}
                <Grid container height={"calc(100vh - 4rem)"}>
                    <Grid
                        item
                        sm={4}
                        md={3}
                        sx={{ display: { xs: "none", sm: "block" } }}
                        height={"100%"}
                    >
                        {isLoading ? (
                            <Skeleton />
                        ) : (
                            <ChatList
                                chats={data?.chats as ChatListProps["chats"]}
                                chatId={chatId}
                                newMessagesAlert={newMessagesAlert}
                                onlineUsers={onlineUsers}
                                chatDeleteHandler={chatDeleteHandler}
                            />
                        )}
                    </Grid>
                    <Grid item xs={12} sm={8} md={5} lg={6} height={"100%"}>
                        <WrappedComponent
                            {...props}
                            chatId={chatId}
                            user={user}
                        />
                    </Grid>
                    <Grid
                        item
                        md={4}
                        lg={3}
                        height={"100%"}
                        sx={{
                            display: {
                                xs: "none",
                                md: "block",
                                padding: "2rem",
                                backgroundColor: "rgba(0, 0, 0, 0.85)",
                            },
                        }}
                    >
                        {user && <Profile user={user as UserProps} />}
                    </Grid>
                </Grid>
            </>
        );
    };
};

export default AppLayout;