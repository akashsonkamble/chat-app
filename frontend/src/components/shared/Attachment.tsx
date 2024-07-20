import { FileOpen as FileOpenIcon } from "@mui/icons-material";
import React from "react";
import { transformImage } from "../../lib/features";
import { AttachmentProps } from "../../types";

type File = "video" | "audio" | "image" | "file";

const Attachment: React.FC<AttachmentProps & { file: File }> = ({
    file,
    url,
}) => {
    switch (file) {
        case "video":
            return (
                <video
                    src={url}
                    preload="none"
                    width={"200px"}
                    autoPlay={false}
                    controls
                />
            );
        case "audio":
            return <audio src={url} preload="none" controls />;
        case "image":
            return (
                <img
                    src={transformImage(url, 200)}
                    alt="attachment"
                    width={"200px"}
                    height={"150px"}
                    style={{ objectFit: "contain" }}
                />
            );
        default:
            return <FileOpenIcon />;
    }
};

export default Attachment;