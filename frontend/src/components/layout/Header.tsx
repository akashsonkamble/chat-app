import {
    Add as AddIcon,
    Group as GroupIcon,
    Logout as LogoutIcon,
    Menu as MenuIcon,
    Notifications as NotificationsIcon,
    Search as SearchIcon,
} from "@mui/icons-material";
import {
    AppBar,
    Backdrop,
    Badge,
    Box,
    IconButton,
    Toolbar,
    Tooltip,
    Typography,
} from "@mui/material";
import axios from "axios";
import React, { Suspense, lazy } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import Logo from "../../assets/logo.png";
import { ultraDarkBlue } from "../../constants/colors";
import { server } from "../../constants/config";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { logout } from "../../redux/reducers/auth";
import { resetNotification } from "../../redux/reducers/chat";
import {
    setIsMobileMenu,
    setIsNewGroup,
    setIsNotification,
    setIsSearch,
} from "../../redux/reducers/misc";
import { IconBtnProps } from "../../types";

const SearchDialog = lazy(() => import("../specific/Search"));
const NewGroupDialog = lazy(() => import("../specific/NewGroup"));
const NotificationDialog = lazy(() => import("../specific/Notifications"));

const Header: React.FC = () => {
    const navigate = useNavigate();

    const dispatch = useAppDispatch();
    const { isSearch, isNotification, isNewGroup } = useAppSelector(
        (state) => state.misc
    );
    const { notifications } = useAppSelector((state) => state.chat);

    const mobileMenuHandler = () => dispatch(setIsMobileMenu(true));

    const openSearchHandler = () => dispatch(setIsSearch(true));

    const openNewGroupHandler = () => dispatch(setIsNewGroup(true));

    const openNotificationHandler = () => {
        dispatch(setIsNotification(true));
        dispatch(resetNotification());
    };

    const navigateGroupHandler = () => navigate("/groups");

    const logoutHandler = async () => {
        try {
            const { data } = await axios.post(
                `${server}/api/v1/users/logout`,
                {},
                {
                    withCredentials: true,
                }
            );
            dispatch(logout());
            toast.success(data.message);
        } catch (error: any) {
            toast.error(
                error?.response?.data?.message || "Something went wrong"
            );
        }
    };

    return (
        <>
            <Box sx={{ flexGrow: 1, height: "4rem" }}>
                <AppBar
                    position="static"
                    sx={{
                        bgcolor: ultraDarkBlue,
                    }}
                >
                    <Toolbar>
                        <Typography
                            variant="h6"
                            sx={{ display: { xs: "none", sm: "block" } }}
                        >
                            <img src={Logo} alt="logo" width={150} />
                        </Typography>
                        <Box
                            sx={{
                                display: { xs: "block", sm: "none" },
                            }}
                        >
                            <IconButton
                                color="inherit"
                                onClick={mobileMenuHandler}
                            >
                                <MenuIcon />
                            </IconButton>
                        </Box>
                        <Box sx={{ flexGrow: 1 }} />
                        <Box>
                            <IconBtn
                                icon={<SearchIcon />}
                                title="Search"
                                onClick={openSearchHandler}
                            />
                            <IconBtn
                                icon={<AddIcon />}
                                title="New Group"
                                onClick={openNewGroupHandler}
                            />
                            <IconBtn
                                icon={<GroupIcon />}
                                title="Manage Groups"
                                onClick={navigateGroupHandler}
                            />
                            <IconBtn
                                icon={<NotificationsIcon />}
                                title="Notifications"
                                onClick={openNotificationHandler}
                                value={notifications}
                            />
                            <IconBtn
                                icon={<LogoutIcon />}
                                title="Logout"
                                onClick={logoutHandler}
                            />
                        </Box>
                    </Toolbar>
                </AppBar>
            </Box>
            {isSearch && (
                <Suspense fallback={<Backdrop open />}>
                    <SearchDialog />
                </Suspense>
            )}

            {isNewGroup && (
                <Suspense fallback={<Backdrop open />}>
                    <NewGroupDialog />
                </Suspense>
            )}

            {isNotification && (
                <Suspense fallback={<Backdrop open />}>
                    <NotificationDialog />
                </Suspense>
            )}
        </>
    );
};

const IconBtn: React.FC<IconBtnProps> = ({ icon, title, onClick, value }) => {
    return (
        <Tooltip title={title}>
            <IconButton color="inherit" size="large" onClick={onClick}>
                {value ? (
                    <Badge badgeContent={value} color="error">
                        {icon}
                    </Badge>
                ) : (
                    icon
                )}
            </IconButton>
        </Tooltip>
    );
};
export default Header;