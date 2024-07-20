import { Stack, Typography } from "@mui/material";
import React, { memo } from "react";
import { GroupItemProps } from "../../types";
import { Link } from "../styles/StyledComponents";
import AvatarCard from "./AvatarCard";

const GroupItem: React.FC<GroupItemProps> = ({ group, chatId }) => {
    const { _id, chatName: groupName, avatar } = group;

    return (
        <Link
            to={`?group=${_id}`}
            onClick={(e) => {
                if (chatId === _id) e.preventDefault();
            }}
        >
            <Stack direction={"row"} spacing={"2rem"} alignItems={"center"}>
                <AvatarCard key={_id} avatar={avatar} />
                <Typography>{groupName}</Typography>
            </Stack>
        </Link>
    );
};

export default memo(GroupItem);