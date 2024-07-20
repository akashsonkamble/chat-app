import { v2 as cloudinary } from "cloudinary";
import { v4 as uuid } from "uuid";
import { ICloudinary } from "../types/cloudinary.type";
import { logger } from "../logs/index";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});

const uploadToCloudinary = async (files: Express.Multer.File[] = []) => {
    const uploadPromises = files.map((file) => {
        return new Promise<ICloudinary>((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    public_id: uuid(),
                    resource_type: "auto",
                    overwrite: true,
                    invalidate: true,
                    folder: "chat-fusion",
                },
                (error, result) => {
                    if (error) {
                        return reject(error);
                    }
                    resolve(result as ICloudinary);
                }
            );

            uploadStream.end(file.buffer);
        });
    });

    try {
        const results: ICloudinary[] = await Promise.all(uploadPromises);
        return results.map((result) => ({
            public_id: result.public_id,
            url: result.url,
        }));
    } catch (error: any) {
        logger.error("Error uploading to Cloudinary:", error.message);
        throw new Error("Error uploading files to Cloudinary");
    }
};

const deleteFromCloudinary = async (publicIds: string[]) => {
    if (!publicIds || publicIds.length === 0) {
        return;
    }

    publicIds.forEach((publicId) => {
        cloudinary.uploader.destroy(publicId, (error, result) => {
            if (error) {
                logger.error(error);
            }
        });
    });
};

export { deleteFromCloudinary, uploadToCloudinary };
