import { Box, Typography } from "@mui/material";
import moment from "moment";
import React, { memo } from "react";
import { blue, gray } from "../../constants/colors";
import { fileFormat } from "../../lib/features";
import { MessageProps, UserProps } from "../../types";
import Attachment from "./Attachment";

type MessageComponentProps = {
    message: MessageProps;
    user: UserProps;
};

const Message: React.FC<MessageComponentProps> = ({ message, user }) => {
    const { sender, content, attachments = [], createdAt } = message;

    const isSameSender = sender?._id === user?._id;

    const timeAgo = moment(createdAt).fromNow();

    return (
        <div
            style={{
                alignSelf: isSameSender ? "flex-end" : "flex-start",
                backgroundColor: "whitesmoke",
                color: gray,
                borderRadius: "5px",
                padding: "0.5rem",
                width: "fit-content",
            }}
        >
            {!isSameSender && (
                <Typography color={blue} fontWeight={"600"} variant="caption">
                    {sender?.fullName}
                </Typography>
            )}
            {content && <Typography>{content}</Typography>}

            {attachments.length > 0 &&
                attachments.map((attachment) => {
                    const { _id, public_id, url } = attachment;
                    const file = fileFormat(url);

                    return (
                        <Box key={_id}>
                            <a
                                href={url}
                                target="_blank"
                                rel="noreferrer" // This attribute is used to prevent the browser from sending a HTTP Referer header to the server if the user clicks the link. This helps to protect the privacy of the user by not revealing the previous page's URL.
                                download
                                style={{
                                    // width: "100%",
                                    // height: "100%",
                                    // objectFit: "contain",
                                    color: "black",
                                }}
                            >
                                <Attachment
                                    _id={_id}
                                    public_id={public_id}
                                    url={url}
                                    file={file}
                                />
                            </a>
                        </Box>
                    );
                })}
            <Typography
                // color={blue}
                variant="caption"
                color={"text.secondary"}
                // sx={{
                //     display: "flex",
                //     gap: "0.5rem",
                //     alignItems: "center",
                // }}
            >
                {timeAgo}
            </Typography>
        </div>
    );
};

export default memo(Message);