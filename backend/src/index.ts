import * as dotenv from "dotenv";
import * as path from "path";

import connectDB from "./db/db";
import { logger } from "./logs/index";
import { app, server } from "./app";

dotenv.config({
    path: path.resolve(__dirname, "../.env"),
});

const PORT = process.env.PORT;

export const ENV_MODE = (process.env.NODE_ENV || "PRODUCTION").trim();

connectDB()
    .then(() => {
        server.listen(PORT, () => {
            logger.info(`⚙️ Server listening on port: ${PORT}`);
        });
    })
    .catch((err) => {
        logger.error("index :: MongoDB connection FAILED :: ", err);
    });
