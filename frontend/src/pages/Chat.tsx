import { useInfiniteScrollTop } from "6pp";
import {
    AttachFile as AttachFileIcon,
    Send as SendIcon,
} from "@mui/icons-material";
import { IconButton, Skeleton, Stack } from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSocket } from "../Socket";
import FileMenu from "../components/dialogs/FileMenu";
import AppLayout from "../components/layout/AppLayout";
import { TypingLoader } from "../components/layout/Loaders";
import Message from "../components/shared/Message";
import { InputBox } from "../components/styles/StyledComponents";
import { blue, ultraDarkBlue, ultraLightBlue } from "../constants/colors";
import {
    ALERT,
    CHAT_JOINED,
    CHAT_LEFT,
    NEW_MESSAGE,
    START_TYPING,
    STOP_TYPING,
} from "../constants/event";
import { useErrors, useSocketEvents } from "../hooks/Hooks";
import { useChatDetailsQuery, useGetMessagesQuery } from "../redux/api/api";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { resetNewMessagesAlert } from "../redux/reducers/chat";
import { setIsFileMenu } from "../redux/reducers/misc";
import { MessageProps, UserProps } from "../types";

const Chat: React.FC<{ chatId: string }> = ({ chatId }) => {
    const navigate = useNavigate();

    const dispatch = useAppDispatch();
    const user = useAppSelector((state) => state.auth.user) as UserProps | null;

    const containerRef = useRef<HTMLDivElement>(null);
    const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
    const bottomRef = useRef<HTMLDivElement>(null);

    const socket = getSocket();

    const [message, setMessage] = useState<string>("");
    const [messages, setMessages] = useState<MessageProps[]>([]);
    const [page, setPage] = useState<number>(1);
    const [fileMenuAnchor, setFileMenuAnchor] = useState<HTMLElement | null>(
        null
    );

    const [IamTyping, setIamTyping] = useState<boolean>(false);
    const [otherUserTyping, setOtherUserTyping] = useState<boolean>(false);

    const chatDetails = useChatDetailsQuery({
        chatId,
        skip: !chatId,
    });

    const oldMessagesChunk = useGetMessagesQuery({
        chatId,
        page,
    });

    const { data: oldMessages, setData: setOldMessages } =
        useInfiniteScrollTop<MessageProps>(
            containerRef,
            oldMessagesChunk.data?.totalPages ?? 0,
            page,
            setPage,
            oldMessagesChunk.data?.messages ?? []
        );

    const errors = [
        {
            isError: chatDetails.isError,
            error: chatDetails.error,
        },
        {
            isError: oldMessagesChunk.isError,
            error: oldMessagesChunk.error,
        },
    ];

    const members = chatDetails?.data?.chat?.members;

    const messageOnChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMessage(e.target.value);

        if (!IamTyping) {
            socket.emit(START_TYPING, { chatId, members });
            setIamTyping(true);
        }

        if (typingTimeout.current) {
            clearTimeout(typingTimeout.current);
        }

        typingTimeout.current = setTimeout(() => {
            socket.emit(STOP_TYPING, { chatId, members });
            setIamTyping(false);
        }, 2000);
    };

    const openFileHandler = (e: React.MouseEvent<HTMLElement>) => {
        dispatch(setIsFileMenu(true));
        setFileMenuAnchor(e.currentTarget);
    };

    const submitHandler = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!message.trim()) return;
        socket.emit(NEW_MESSAGE, { chatId, members, message });
        setMessage("");
    };

    useEffect(() => {
        socket.emit(CHAT_JOINED, { userId: user?._id, members });
        dispatch(resetNewMessagesAlert(chatId));

        return () => {
            setMessage("");
            setMessages([]);
            setPage(1);
            setOldMessages([]);
            socket.emit(CHAT_LEFT, { userId: user?._id, members });
        };
    }, [chatId]);

    useEffect(() => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    useEffect(() => {
        if (chatDetails.isError) return navigate("/");
    }, [chatDetails.isError]);

    const newMessagesListener = useCallback(
        (data: any) => {
            if (data.chatId !== chatId) return;

            setMessages((prev) => [...prev, data.message]);
        },
        [chatId]
    );

    const startTypingListener = useCallback(
        (data: any) => {
            if (data.chatId !== chatId) return;

            setOtherUserTyping(true);
        },
        [chatId]
    );

    const stopTypingListener = useCallback(
        (data: any) => {
            if (data.chatId !== chatId) return;

            setOtherUserTyping(false);
        },
        [chatId]
    );

    const alertListener = useCallback(
        (data: any) => {
            if (data.chatId !== chatId) return;
            const messageForAlert = {
                content: data.message,
                sender: {
                    _id: "admin",
                    fullName: "Admin",
                },
                chat: chatId,
                createdAt: new Date().toISOString(),
            };

            setMessages((prev) => [
                ...prev,
                messageForAlert as unknown as MessageProps,
            ]);
        },
        [chatId]
    );

    const eventsHandler = {
        [ALERT]: alertListener,
        [NEW_MESSAGE]: newMessagesListener,
        [START_TYPING]: startTypingListener,
        [STOP_TYPING]: stopTypingListener,
    };

    useSocketEvents(socket, eventsHandler);

    useErrors(errors);

    const allMessages = [...(oldMessages ?? []), ...messages];

    return chatDetails.isLoading ? (
        <Skeleton />
    ) : (
        <>
            <Stack
                ref={containerRef}
                boxSizing={"border-box"}
                padding={"1rem"}
                spacing={"1rem"}
                bgcolor={ultraLightBlue}
                height={"90%"}
                sx={{ overflowX: "hidden", overflowY: "auto" }}
            >
                {allMessages.map((message) => (
                    <Message
                        key={message?._id}
                        message={message}
                        user={user as UserProps}
                    />
                ))}

                {otherUserTyping && <TypingLoader />}

                <div ref={bottomRef} />
            </Stack>
            <form style={{ height: "10%" }} onSubmit={submitHandler}>
                <Stack
                    direction={"row"}
                    height={"100%"}
                    padding={"1rem"}
                    alignItems={"center"}
                    position={"relative"}
                >
                    <IconButton
                        sx={{
                            position: "absolute",
                            left: "0.5rem",
                            rotate: "30deg",
                        }}
                        onClick={openFileHandler}
                    >
                        <AttachFileIcon />
                    </IconButton>
                    <InputBox
                        placeholder="Type your message..."
                        value={message}
                        onChange={messageOnChangeHandler}
                    />
                    <IconButton
                        type="submit"
                        sx={{
                            rotate: "-30deg",
                            backgroundColor: blue,
                            color: "whitesmoke",
                            marginLeft: "1rem",
                            padding: "0.5rem",
                            "&:hover": {
                                backgroundColor: ultraDarkBlue,
                            },
                        }}
                    >
                        <SendIcon />
                    </IconButton>
                </Stack>
            </form>
            <FileMenu anchorEl={fileMenuAnchor} chatId={chatId} />
        </>
    );
};

export default AppLayout(Chat);