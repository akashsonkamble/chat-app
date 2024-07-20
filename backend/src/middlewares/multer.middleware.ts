import * as multer from "multer";

const storage = multer.memoryStorage();

export const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
});

export const uploadAvatar = upload.single("avatar");

export const uploadFiles = upload.array("files", 5);
