import { Box, Stack, Typography } from "@mui/material";
import { memo } from "react";
import { darkBlue } from "../../constants/colors";
import { ChatItemProps } from "../../types";
import { Link } from "../styles/StyledComponents";
import AvatarCard from "./AvatarCard";

const ChatItem: React.FC<ChatItemProps> = ({
    avatar = [],
    chatName,
    _id,
    isGroupChat = false,
    sameSender,
    isOnline,
    newMessageAlert,
    chatDeleteHandler,
}) => {
    return (
        <Link
            sx={{
                padding: "0",
            }}
            to={`/chat/${_id}`}
            onContextMenu={(e) => chatDeleteHandler(e, _id, isGroupChat)}
        >
            <div
                style={{
                    display: "flex",
                    gap: "1rem",
                    alignItems: "center",
                    padding: "1rem",
                    backgroundColor: sameSender ? darkBlue : "unset",
                    color: sameSender ? "whitesmoke" : "unset",
                    position: "relative",
                }}
            >
                <AvatarCard avatar={avatar} />
                <Stack>
                    <Typography>{chatName}</Typography>
                    {newMessageAlert && newMessageAlert.count > 0 && (
                        <Typography
                        // sx={{
                        //     position: "absolute",
                        //     right: "1rem",
                        //     top: "1rem",
                        // }}
                        >
                            {newMessageAlert.count === 1
                                ? "1 new message"
                                : `${newMessageAlert.count} new messages`}
                            {/* {newMessageAlert[index].count}{" "}
                            {newMessageAlert[index].count === 1
                                ? "new message"
                                : "new messages"} */}
                            {/* {newMessageAlert?.count ?? 0}{" "}
                            {newMessageAlert?.count === 1
                                ? "new message"
                                : "new messages"} */}
                        </Typography>
                    )}
                </Stack>

                {isOnline && !isGroupChat && (
                    <Box
                        sx={{
                            width: "10px",
                            height: "10px",
                            borderRadius: "50%",
                            backgroundColor: "green",
                            position: "absolute",
                            top: "50%",
                            right: "1rem",
                            transform: "translateY(-50%)",
                        }}
                    />
                )}
            </div>
        </Link>
    );
};

export default memo(ChatItem);