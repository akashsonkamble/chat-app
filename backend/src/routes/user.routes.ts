import { Router } from "express";
import {
    acceptFriendRequest,
    getMyFriends,
    getMyNotifications,
    getProfile,
    login,
    logout,
    searchUser,
    sendFriendRequest,
    signup,
} from "../controllers/user.controller";
import { isAuthenticated } from "../middlewares/auth.middleware";
import { uploadAvatar } from "../middlewares/multer.middleware";

const router = Router();

router.route("/signup").post(uploadAvatar, signup);

router.route("/login").post(login);

// secured routes
router.route("/logout").post(isAuthenticated, logout);

router.route("/profile").get(isAuthenticated, getProfile);

router.route("/search").get(isAuthenticated, searchUser);

router.route("/send-request").put(isAuthenticated, sendFriendRequest);
router.route("/accept-request").put(isAuthenticated, acceptFriendRequest);

router.route("/notifications").get(isAuthenticated, getMyNotifications);

router.route("/friends").get(isAuthenticated, getMyFriends);

export default router;
