import {
    Add as AddIcon,
    Delete as DeleteIcon,
    Done as DoneIcon,
    Edit as EditIcon,
    KeyboardBackspace as KeyboardBackspaceIcon,
    Menu as MenuIcon,
} from "@mui/icons-material";
import {
    Backdrop,
    Box,
    Button,
    CircularProgress,
    Drawer,
    Grid,
    IconButton,
    Stack,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";
import { Suspense, lazy, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { LayoutLoaders } from "../components/layout/Loaders";
import UserItem from "../components/shared/UserItem";
import GroupList from "../components/specific/GroupList";
import { lightBlue, lightGray, matteBlack } from "../constants/colors";
import { useAsyncMutation, useErrors } from "../hooks/Hooks";
import {
    useChatDetailsQuery,
    useDeleteChatMutation,
    useGetMyGroupQuery,
    useRemoveGroupMemberMutation,
    useRenameGroupMutation,
} from "../redux/api/api";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { setIsAddMember } from "../redux/reducers/misc";
import { UserProps } from "../types";

const ConfirmDeleteDialog = lazy(
    () => import("../components/dialogs/ConfirmDeleteDialog")
);

const AddMemberDialog = lazy(
    () => import("../components/dialogs/AddMemberDialog")
);

const Groups: React.FC = () => {
    const chatId = useSearchParams()[0].get("group") as string;

    const navigate = useNavigate();

    const dispatch = useAppDispatch();
    const { isAddMember } = useAppSelector((state) => state.misc);

    const myGroups = useGetMyGroupQuery();

    const groupDetails = useChatDetailsQuery(
        { chatId, populate: true },
        { skip: !chatId }
    );

    const [updateGroup, isLoadingGroupName] = useAsyncMutation(
        useRenameGroupMutation
    );

    const [removeMember, isLoadingRemoveMember] = useAsyncMutation(
        useRemoveGroupMemberMutation
    );

    const [deleteGroup, isLoadingDeleteGroup] = useAsyncMutation(
        useDeleteChatMutation
    );

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
    const [isEdit, setIsEdit] = useState<boolean>(false);
    const [confirmDeleteDialog, setConfirmDeleteDialog] =
        useState<boolean>(false);

    const [groupName, setGroupName] = useState<string>("");
    const [groupNameUpdateValue, setGroupNameUpdateValue] =
        useState<string>("");
    const [members, setMembers] = useState<UserProps[]>([]);

    const chatName = groupDetails?.data?.chat?.chatName;

    const errors = [
        {
            isError: myGroups.isError,
            error: myGroups.error,
        },
        {
            isError: groupDetails.isError,
            error: groupDetails.error,
        },
    ];

    const navigateBackHandler = () => {
        navigate("/");
    };

    const mobileMenuHandler = () => {
        setIsMobileMenuOpen((prev) => !prev);
    };

    const updateGroupNameHandler = () => {
        setIsEdit(false);
        updateGroup("Updating Group Name...", {
            chatId,
            chatName: groupNameUpdateValue,
        });
    };

    const openConfirmDeleteHandler = () => {
        setConfirmDeleteDialog(true);
    };

    const closeConfirmDeleteHandler = () => {
        setConfirmDeleteDialog(false);
    };

    const openAddMemberHandler = () => {
        dispatch(setIsAddMember(true));
    };

    const deleteHandler = () => {
        deleteGroup("Deleting Group...", chatId);
        closeConfirmDeleteHandler();
        navigate("/groups");
    };

    const removeMemberHandler = (id: string) => {
        removeMember("Removing Member...", { chatId, userId: id });
    };

    useErrors(errors);

    useEffect(() => {
        const groupData = groupDetails?.data;

        if (groupData) {
            setGroupName(groupData.chat.chatName);
            setGroupNameUpdateValue(groupData.chat.chatName);
            setMembers(groupData.chat.members as unknown as UserProps[]);
        }

        return () => {
            setGroupName("");
            setGroupNameUpdateValue("");
            setMembers([]);
            setIsEdit(false);
        };
    }, [groupDetails.data]);

    useEffect(() => {
        if (chatId) {
            setGroupName(chatName as string);
            setGroupNameUpdateValue(chatName as string);
        }

        return () => {
            setGroupName("");
            setGroupNameUpdateValue("");

            setIsEdit(false);
        };
    }, [chatId, chatName]);

    const IconBtns = (
        <>
            <Box
                sx={{
                    display: {
                        xs: "block",
                        sm: "none",
                        position: "fixed",
                        right: "1rem",
                        top: "1rem",
                    },
                }}
            >
                <IconButton onClick={mobileMenuHandler}>
                    <MenuIcon />
                </IconButton>
            </Box>
            <Tooltip title="Back">
                <IconButton
                    sx={{
                        position: "absolute",
                        left: "1rem",
                        top: "1rem",
                        bgcolor: matteBlack,
                        color: "whitesmoke",
                        "&:hover": { bgcolor: lightGray, color: matteBlack },
                    }}
                    onClick={navigateBackHandler}
                >
                    <KeyboardBackspaceIcon />
                </IconButton>
            </Tooltip>
        </>
    );

    const GroupName = (
        <Stack
            direction={"row"}
            alignItems={"center"}
            justifyContent={"center"}
            spacing={"1rem"}
            padding={"3rem"}
        >
            {isEdit ? (
                <>
                    <TextField
                        value={groupNameUpdateValue}
                        onChange={(e) =>
                            setGroupNameUpdateValue(e.target.value)
                        }
                    />
                    <IconButton
                        onClick={updateGroupNameHandler}
                        disabled={isLoadingGroupName}
                    >
                        <DoneIcon />
                    </IconButton>
                </>
            ) : (
                <>
                    <Typography variant="h4">{groupName}</Typography>
                    <IconButton
                        disabled={isLoadingGroupName}
                        onClick={() => setIsEdit(true)}
                    >
                        <EditIcon />
                    </IconButton>
                </>
            )}
        </Stack>
    );

    const ButtonGroup = (
        <Stack
            direction={{
                xs: "column-reverse",
                md: "row",
            }}
            spacing={"1rem"}
            p={{
                xs: "0",
                sm: "1rem",
                md: "1rem 3rem",
            }}
        >
            <Button
                size="large"
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={openConfirmDeleteHandler}
                disabled={isLoadingDeleteGroup}
            >
                Delete Group
            </Button>
            <Button
                size="large"
                variant="contained"
                startIcon={<AddIcon />}
                onClick={openAddMemberHandler}
            >
                Add Member
            </Button>
        </Stack>
    );
    //#region Return
    return myGroups.isLoading ? (
        <LayoutLoaders />
    ) : (
        <Grid container height={"100vh"}>
            <Grid
                item
                sx={{
                    display: {
                        xs: "none",
                        sm: "block",
                    },
                }}
                sm={4}
            >
                <GroupList
                    groups={myGroups?.data?.groups || []}
                    chatId={chatId}
                />
            </Grid>
            <Grid
                item
                xs={12}
                sm={8}
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    position: "relative",
                    padding: "1rem 3rem",
                }}
            >
                {IconBtns}

                {groupName && (
                    <>
                        {GroupName}
                        <Typography
                            margin={"2rem"}
                            alignSelf={"flex-start"}
                            variant="body1"
                        >
                            Members
                        </Typography>
                        <Stack
                            maxWidth={"45rem"}
                            width={"100%"}
                            boxSizing={"border-box"}
                            padding={{
                                xs: "0",
                                sm: "1rem",
                                md: "1rem 4rem",
                            }}
                            spacing={"2rem"}
                            bgcolor={lightBlue}
                            height={"50vh"}
                            overflow={"auto"}
                        >
                            {isLoadingRemoveMember ? (
                                <CircularProgress />
                            ) : (
                                members.map((user) => (
                                    <UserItem
                                        key={user._id}
                                        user={user}
                                        isAdded
                                        handler={removeMemberHandler}
                                        styling={{
                                            boxShadow:
                                                "0 0 0.5rem rgba(0, 0, 0, 0.2)",
                                            padding: "1rem 2rem",
                                            borderRadius: "1rem",
                                        }}
                                    />
                                ))
                            )}
                        </Stack>

                        {ButtonGroup}
                    </>
                )}
            </Grid>
            {isAddMember && (
                <Suspense fallback={<Backdrop open />}>
                    <AddMemberDialog chatId={chatId} />
                </Suspense>
            )}
            {confirmDeleteDialog && (
                <Suspense fallback={<Backdrop open />}>
                    <ConfirmDeleteDialog
                        open={confirmDeleteDialog}
                        closeHandler={closeConfirmDeleteHandler}
                        deleteHandler={deleteHandler}
                    />
                </Suspense>
            )}
            <Drawer
                open={isMobileMenuOpen}
                onClose={mobileMenuHandler}
                sx={{
                    display: { xs: "block", sm: "none" },
                }}
            >
                <GroupList
                    w={"70vw"}
                    groups={myGroups?.data?.groups || []}
                    chatId={chatId}
                />
            </Drawer>
        </Grid>
    );
};

export default Groups;