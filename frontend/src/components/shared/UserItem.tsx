import { Add as AddIcon, Remove as RemoveIcon } from "@mui/icons-material";
import { Avatar, IconButton, ListItem, Stack, Typography } from "@mui/material";
import React, { memo } from "react";
import { transformImage } from "../../lib/features";
import { UserItemProps } from "../../types";

const UserItem: React.FC<UserItemProps> = ({
    user,
    handler,
    isAdded = false,
    isLoadingHandler = false,
    styling = {},
}) => {
    const { _id, fullName, avatar } = user;

    return (
        <ListItem>
            <Stack
                direction={"row"}
                alignItems={"center"}
                spacing={"1rem"}
                width={"100%"}
                {...styling}
            >
                <Avatar src={transformImage(avatar.url)} alt="avatar" />
                <Typography
                    sx={{
                        flexGrow: 1,
                        display: "-webkit-box",
                        WebkitLineClamp: 1,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        width: "100%",
                    }}
                    variant="body1"
                >
                    {fullName}
                </Typography>
                <IconButton
                    size="small"
                    sx={{
                        backgroundColor: isAdded
                            ? "error.main"
                            : "primary.main",
                        color: "whitesmoke",
                        "&:hover": {
                            backgroundColor: isAdded
                                ? "error.dark"
                                : "primary.dark",
                        },
                    }}
                    onClick={() => handler(_id)}
                    disabled={isLoadingHandler}
                >
                    {isAdded ? <RemoveIcon /> : <AddIcon />}
                </IconButton>
            </Stack>
        </ListItem>
    );
};

export default memo(UserItem);