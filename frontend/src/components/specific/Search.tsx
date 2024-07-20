import { useInputValidation } from "6pp";
import { Search as SearchIcon } from "@mui/icons-material";
import {
    Dialog,
    DialogTitle,
    InputAdornment,
    List,
    Stack,
    TextField,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useAsyncMutation } from "../../hooks/Hooks";
import {
    useLazySearchUserQuery,
    useSendFriendRequestMutation,
} from "../../redux/api/api";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { setIsSearch } from "../../redux/reducers/misc";
import { UserProps } from "../../types";
import UserItem from "../shared/UserItem";
import toast from "react-hot-toast";

const Search: React.FC = () => {
    const dispatch = useAppDispatch();
    const { isSearch } = useAppSelector((state) => state.misc);

    const [searchUser] = useLazySearchUserQuery();

    const [sendFriendRequest, isLoadingSendFriendRequest] = useAsyncMutation(
        useSendFriendRequestMutation
    );

    const search = useInputValidation<string>("");

    const [users, setUsers] = useState<UserProps[]>([]);

    const addFriendHandler = async (id: UserProps["_id"]) => {
        await sendFriendRequest("Sending friend request", { userId: id });
    };

    const closeSearchHandler = () => dispatch(setIsSearch(false));

    useEffect(() => {
        const timeOut = setTimeout(() => {
            searchUser(search.value)
                .unwrap()
                .then((data) => {
                    if (data && data.users) {
                        setUsers(data.users);
                    }
                })
                .catch((error) => {
                    toast.error(error);
                });
        }, 1000);

        return () => clearTimeout(timeOut);
    }, [search.value, searchUser]);

    return (
        <Dialog open={isSearch} onClose={closeSearchHandler}>
            <Stack p={"2rem"} direction={"column"} width={"25rem"}>
                <DialogTitle textAlign={"center"}>Find People</DialogTitle>
                <TextField
                    value={search.value}
                    onChange={search.changeHandler}
                    variant="outlined"
                    size="small"
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                    }}
                />
                <List>
                    {users.map((user: UserProps) => (
                        <UserItem
                            key={user._id}
                            user={user}
                            handler={addFriendHandler}
                            isLoadingHandler={isLoadingSendFriendRequest}
                        />
                    ))}
                </List>
            </Stack>
        </Dialog>
    );
};

export default Search;