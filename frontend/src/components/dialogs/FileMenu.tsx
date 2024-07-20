import {
    AudioFile as AudioFileIcon,
    Image as ImageIcon,
    UploadFile as UploadFileIcon,
    VideoFile as VideoFileIcon,
} from "@mui/icons-material";
import { ListItemText, Menu, MenuItem, MenuList, Tooltip } from "@mui/material";
import { ChangeEvent, useRef } from "react";
import toast from "react-hot-toast";
import { useSendAttachmentsMutation } from "../../redux/api/api";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { setIsFileMenu, setIsUploadingLoader } from "../../redux/reducers/misc";

const FileMenu = ({
    anchorEl,
    chatId,
}: {
    anchorEl: HTMLElement | null;
    chatId: string;
}) => {
    const dispatch = useAppDispatch();
    const { isFileMenu } = useAppSelector((state) => state.misc);

    const imageRef = useRef<HTMLInputElement>(null);
    const audioRef = useRef<HTMLInputElement>(null);
    const videoRef = useRef<HTMLInputElement>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    const [sendAttachments] = useSendAttachmentsMutation();

    const closeFileMenuHandler = () => dispatch(setIsFileMenu(false));

    const selectImage = () => imageRef.current?.click();
    const selectAudio = () => audioRef.current?.click();
    const selectVideo = () => videoRef.current?.click();
    const selectFile = () => fileRef.current?.click();

    const fileChangeHandler = async (
        e: ChangeEvent<HTMLInputElement>,
        key: string
    ) => {
        const files = Array.from(e.target.files || []);

        if (files.length <= 0) return;

        if (files.length > 5)
            return toast.error("Cannot upload more than 5 ${key} at a time");

        dispatch(setIsUploadingLoader(true));

        const toastId = toast.loading(`Uploading ${key}...`);
        closeFileMenuHandler();

        try {
            const res = await sendAttachments({ chatId, attachments: files });

            if (res.data) {
                toast.success(`Successfully sent ${key}`, { id: toastId });
                console.log(res);
            } else toast.error(`Failed to send ${key}`, { id: toastId });
        } catch (error) {
            toast.error(`Error uploading ${key}: ${error}`, { id: toastId });
        } finally {
            dispatch(setIsUploadingLoader(false));
        }
    };

    return (
        <Menu
            open={isFileMenu}
            anchorEl={anchorEl}
            onClose={closeFileMenuHandler}
        >
            <div
                style={{
                    width: "10rem",
                }}
            >
                <MenuList>
                    <MenuItem onClick={selectImage}>
                        <Tooltip title="Image">
                            <ImageIcon />
                        </Tooltip>
                        <ListItemText style={{ marginLeft: "0.5rem" }}>
                            Image
                        </ListItemText>
                        <input
                            ref={imageRef}
                            type="file"
                            multiple
                            accept="image/png, image/jpeg, image/jpg, image/gif"
                            style={{ display: "none" }}
                            onChange={(e) => fileChangeHandler(e, "Images")}
                        />
                    </MenuItem>

                    <MenuItem onClick={selectAudio}>
                        <Tooltip title="Audio">
                            <AudioFileIcon />
                        </Tooltip>
                        <ListItemText style={{ marginLeft: "0.5rem" }}>
                            Audio
                        </ListItemText>
                        <input
                            ref={audioRef}
                            type="file"
                            multiple
                            accept="audio/mpeg, audio/wav, audio/ogg"
                            style={{ display: "none" }}
                            onChange={(e) => fileChangeHandler(e, "Audios")}
                        />
                    </MenuItem>

                    <MenuItem onClick={selectVideo}>
                        <Tooltip title="Video">
                            <VideoFileIcon />
                        </Tooltip>
                        <ListItemText style={{ marginLeft: "0.5rem" }}>
                            Video
                        </ListItemText>
                        <input
                            ref={videoRef}
                            type="file"
                            multiple
                            accept="video/mp4, video/webm, video/ogg"
                            style={{ display: "none" }}
                            onChange={(e) => fileChangeHandler(e, "Videos")}
                        />
                    </MenuItem>

                    <MenuItem onClick={selectFile}>
                        <Tooltip title="File">
                            <UploadFileIcon />
                        </Tooltip>
                        <ListItemText style={{ marginLeft: "0.5rem" }}>
                            File
                        </ListItemText>
                        <input
                            ref={fileRef}
                            type="file"
                            multiple
                            accept="*"
                            style={{ display: "none" }}
                            onChange={(e) => fileChangeHandler(e, "Files")}
                        />
                    </MenuItem>
                </MenuList>
            </div>
        </Menu>
    );
};

export default FileMenu;