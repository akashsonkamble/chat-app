import { Stack, Typography } from "@mui/material";
import React from "react";
import { bgGradient } from "../../constants/colors";
import { GroupListProps } from "../../types";
import GroupItem from "../shared/GroupItem";

const GroupList: React.FC<GroupListProps> = ({
    w = "100%",
    groups = [],
    chatId,
}) => {
    return (
        <Stack
            width={w}
            sx={{
                backgroundImage: bgGradient,
                height: "100vh",
                overflow: "auto",
            }}
        >
            {groups.length > 0 ? (
                groups.map((group) => (
                    <GroupItem key={group._id} group={group} chatId={chatId} />
                ))
            ) : (
                <Stack textAlign={"center"} padding={"1rem"}>
                    <Typography variant="h5" color="gray">
                        No groups
                    </Typography>
                    <Typography variant="body1" color="gray">
                        Create a new group
                    </Typography>
                </Stack>
            )}
        </Stack>
    );
};

export default GroupList;