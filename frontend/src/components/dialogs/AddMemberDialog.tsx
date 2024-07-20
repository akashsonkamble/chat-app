import {
    Button,
    Dialog,
    DialogTitle,
    Skeleton,
    Stack,
    Typography,
} from "@mui/material";
import React, { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useAsyncMutation, useErrors } from "../../hooks/Hooks";
import {
    useAddGroupMembersMutation,
    useAvailableFriendsQuery,
    useChatDetailsQuery,
} from "../../redux/api/api";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { setIsAddMember } from "../../redux/reducers/misc";
import { ChatProps, UserProps } from "../../types";
import UserItem from "../shared/UserItem";

const AddMemberDialog: React.FC<{ chatId: ChatProps["_id"] }> = ({
    chatId,
}) => {
    const dispatch = useAppDispatch();
    const { isAddMember } = useAppSelector((state) => state.misc);

    const groupDetails = useChatDetailsQuery(
        { chatId, populate: true },
        { skip: !chatId }
    );

    const { isLoading, data, isError, error } =
        useAvailableFriendsQuery(chatId);

    const [addMembers, isLoadingAddMembers] = useAsyncMutation(
        useAddGroupMembersMutation
    );

    const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

    const selectMemberHandler = (id: string) => {
        setSelectedMembers((prev: string[]) =>
            prev.includes(id)
                ? prev.filter((member) => member !== id)
                : [...prev, id]
        );
    };

    const closeHandler = () => {
        dispatch(setIsAddMember(false));
    };

    const addMemberSubmitHandler = () => {
        if (!selectedMembers.length)
            return toast.error("Please select at least 1 member");
        addMembers("Adding Members...", {
            chatId,
            members: selectedMembers,
        });
        closeHandler();
    };

    useErrors([{ isError, error }]);
    const finalResults = useMemo(() => {
        const ids = groupDetails?.data?.chat?.members.map(
            (id) => (id as unknown as { _id: string })._id
        );

        return data?.friends?.filter(
            (user: UserProps) => !ids?.includes(user._id)
        );
    }, [groupDetails, data]);

    return (
        <Dialog open={isAddMember} onClose={closeHandler}>
            <Stack p={"2rem"} width={"20rem"} spacing={"2rem"}>
                <DialogTitle textAlign={"center"}>Add Member</DialogTitle>
                <Stack spacing={"1rem"}>
                    {isLoading ? (
                        <Skeleton />
                    ) : finalResults && finalResults.length > 0 ? (
                        finalResults.map((user) => (
                            <UserItem
                                key={user._id}
                                user={user}
                                handler={selectMemberHandler}
                                isAdded={selectedMembers.includes(user._id)}
                            />
                        ))
                    ) : (
                        <Typography textAlign={"center"}>No friends</Typography>
                    )}
                </Stack>
                <Stack
                    direction={"row"}
                    alignItems={"center"}
                    justifyContent={"space-evenly"}
                >
                    <Button
                        variant="outlined"
                        color="error"
                        onClick={closeHandler}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={addMemberSubmitHandler}
                        disabled={isLoadingAddMembers}
                    >
                        Add
                    </Button>
                </Stack>
            </Stack>
        </Dialog>
    );
};

export default AddMemberDialog;