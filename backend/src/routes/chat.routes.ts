import { Router } from "express";
import {
    addMembers,
    createGroup,
    deleteChat,
    getChatDetails,
    getMessages,
    getMyChats,
    getMyGroups,
    leaveGroup,
    removeMember,
    renameGroup,
    sendAttachments,
} from "../controllers/chat.controller";
import { isAuthenticated } from "../middlewares/auth.middleware";
import { uploadFiles } from "../middlewares/multer.middleware";

const router = Router();

router.use(isAuthenticated);

router.route("/new/group").post(createGroup);
router.route("/my-chats").get(getMyChats);
router.route("/my-groups").get(getMyGroups);
router.route("/add-members").put(addMembers);
router.route("/remove-member").put(removeMember);
router.route("/leave-group/:chatId").delete(leaveGroup);

// send attachment
router.route("/messages").post(uploadFiles, sendAttachments);

router.route("/messages/:id").get(getMessages);

router.route("/:id").get(getChatDetails).put(renameGroup).delete(deleteChat);

export default router;
