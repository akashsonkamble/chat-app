import { useInputValidation } from "6pp";
import {
    Button,
    Dialog,
    DialogTitle,
    Skeleton,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import { useState } from "react";
import toast from "react-hot-toast";
import { useAsyncMutation, useErrors } from "../../hooks/Hooks";
import {
    useAvailableFriendsQuery,
    useNewGroupMutation,
} from "../../redux/api/api";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { setIsNewGroup } from "../../redux/reducers/misc";
import UserItem from "../shared/UserItem";
const NewGroup: React.FC = () => {
    const dispatch = useAppDispatch();
    const { isNewGroup } = useAppSelector((state) => state.misc);

    const { isLoading, data, isError, error } = useAvailableFriendsQuery();

    const [newGroup, isLoadingNewGroup] = useAsyncMutation(useNewGroupMutation);

    const groupName = useInputValidation<string>("");

    const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

    const errors = [{ isError, error }];

    useErrors(errors);

    const selectMemberHandler = (id: string) => {
        setSelectedMembers((prev: string[]) =>
            prev.includes(id)
                ? prev.filter((member) => member !== id)
                : [...prev, id]
        );
    };

    const submitHandler = () => {
        if (!groupName.value) return toast.error("Group name is required");

        if (selectedMembers.length < 2)
            return toast.error("Please select at least 2 members");

        newGroup("Creating new gorup...", {
            chatName: groupName.value,
            members: selectedMembers,
        });

        closeHandler();
    };

    const closeHandler = () => dispatch(setIsNewGroup(false));

    return (
        <Dialog open={isNewGroup} onClose={closeHandler}>
            <Stack
                p={{ xs: "1rem", sm: "3rem" }}
                width={"25rem"}
                spacing={"2rem"}
            >
                <DialogTitle textAlign={"center"} variant="h4">
                    New Group
                </DialogTitle>
                <TextField
                    label="Group Name"
                    value={groupName.value}
                    onChange={groupName.changeHandler}
                />
                <Typography variant="body1">Select Members</Typography>
                <Stack>
                    {isLoading ? (
                        <Skeleton />
                    ) : (
                        data?.friends?.map((user) => (
                            <UserItem
                                key={user._id}
                                user={user}
                                handler={selectMemberHandler}
                                isAdded={selectedMembers.includes(user._id)}
                            />
                        ))
                    )}
                </Stack>
                <Stack direction={"row"} justifyContent={"space-evenly"}>
                    <Button
                        variant="outlined"
                        color="error"
                        size="large"
                        onClick={closeHandler}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        color="success"
                        size="large"
                        onClick={submitHandler}
                        disabled={isLoadingNewGroup}
                    >
                        Create
                    </Button>
                </Stack>
            </Stack>
        </Dialog>
    );
};

export default NewGroup;