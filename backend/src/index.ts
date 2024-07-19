import * as express from "express";
import * as dotenv from "dotenv";

dotenv.config({
    path: "../.env"
});

const PORT = process.env.PORT || 8000;

const app = express();

app.get("/", (_, res: express.Response) => {
    res.send("Chat Fusion Backend");
});

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});