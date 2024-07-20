import {
    Avatar,
    Button,
    Dialog,
    DialogTitle,
    ListItem,
    Skeleton,
    Stack,
    Typography,
} from "@mui/material";
import React, { memo } from "react";
import { useAsyncMutation, useErrors } from "../../hooks/Hooks";
import { transformImage } from "../../lib/features";
import {
    useAcceptFrientRequestMutation,
    useGetNotificationsQuery,
} from "../../redux/api/api";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { setIsNotification } from "../../redux/reducers/misc";
import { AvatarProps, RequestProps } from "../../types";

const Notifications: React.FC = () => {
    const dispatch = useAppDispatch();
    const { isNotification } = useAppSelector((state) => state.misc);

    const { isLoading, data, isError, error } = useGetNotificationsQuery();
    const [acceptRequest] = useAsyncMutation(useAcceptFrientRequestMutation);

    const friendRequestHandler = async ({
        _id,
        accept,
    }: {
        _id: RequestProps["_id"];
        accept: boolean;
    }) => {
        dispatch(setIsNotification(false));
        await acceptRequest("Accepting...", { requestId: _id, accept });
    };

    const closeHandler = () => dispatch(setIsNotification(false));

    useErrors([{ isError, error }]);

    return (
        <Dialog open={isNotification} onClose={closeHandler}>
            <Stack
                p={{ xs: "1rem", sm: "2rem" }}
                direction={"column"}
                maxWidth={"25rem"}
            >
                <DialogTitle textAlign={"center"}>Notifications</DialogTitle>
                {isLoading ? (
                    <Skeleton />
                ) : (
                    <>
                        {data?.notifications?.length ? (
                            data?.notifications?.map(({ sender, _id }) => (
                                <NotificationItem
                                    key={_id}
                                    sender={sender}
                                    _id={_id}
                                    handler={friendRequestHandler}
                                />
                            ))
                        ) : (
                            <Typography textAlign={"center"}>
                                No Notifications
                            </Typography>
                        )}
                    </>
                )}
            </Stack>
        </Dialog>
    );
};

type NotificationItemProps = {
    sender: {
        _id: string;
        fullName: string;
        avatar: AvatarProps;
    };
    _id: RequestProps["_id"];
    handler: ({
        _id,
        accept,
    }: {
        _id: RequestProps["_id"];
        accept: boolean;
    }) => void;
};

const NotificationItem: React.FC<NotificationItemProps> = memo(
    ({ _id, sender, handler }) => {
        const { fullName, avatar } = sender;

        return (
            <ListItem disableGutters>
                <Stack
                    direction={"row"}
                    alignItems={"center"}
                    spacing={"1rem"}
                    width={"100%"}
                >
                    <Avatar src={transformImage(avatar.url)} alt="avatar" />
                    <Typography
                        variant="body1"
                        sx={{
                            flexGrow: 1,
                            display: "-webkit-box",
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            width: "100%",
                        }}
                    >
                        {`${fullName} sent you a friend request`}
                    </Typography>
                    <Stack
                        direction={{ xs: "column", sm: "row" }}
                        spacing={"0.5rem"}
                    >
                        <Button
                            size="small"
                            color="success"
                            variant="outlined"
                            onClick={() => handler({ _id, accept: true })}
                        >
                            Accept
                        </Button>
                        <Button
                            size="small"
                            color="error"
                            variant="outlined"
                            onClick={() => handler({ _id, accept: false })}
                        >
                            Decline
                        </Button>
                    </Stack>
                </Stack>
            </ListItem>
        );
    }
);

export default Notifications;