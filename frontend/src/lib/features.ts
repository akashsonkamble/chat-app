const fileFormat = (url: string) => {
    const fileExtension = url.split(".").pop()?.toLowerCase();

    if (fileExtension) {
        if (
            ["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(fileExtension)
        ) {
            return "image";
        }
        if (["mp4", "webm", "ogg"].includes(fileExtension)) {
            return "video";
        }
        if (["mp3", "wav", "ogg"].includes(fileExtension)) {
            return "audio";
        }
    }
    return "file";
};

const transformImage = (url: string = "", width: number = 100) => {
    const newUrl = url.replace("upload/", `upload/dpr_auto/w_${width}/`);
    return newUrl;
};

const getOrSaveFromLocalStorage = ({
    key,
    value,
    get,
}: {
    key: string;
    value: { chatId: string; count: number }[];
    get: boolean;
}) => {
    if (get) {
        return localStorage.getItem(key)
            ? JSON.parse(localStorage.getItem(key)!)
            : null;
    } else {
        localStorage.setItem(key, JSON.stringify(value));
    }
};

export { fileFormat, getOrSaveFromLocalStorage, transformImage };