import mongoose from "mongoose";
import { logger } from "../logs/index";

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(
            `${process.env.MONGODB_URI}/${process.env.DB_NAME}`
        );
        logger.info(
            `MongoDB Database connected !! DB HOST: ${connectionInstance.connection.host}`
        );
    } catch (err) {
        logger.error("MongoDB database connection failed :: ", err);
        process.exit(1);
    }
};

export default connectDB;
