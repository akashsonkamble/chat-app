const corsOptions = {
    origin: [process.env.FRONTEND_URL || "http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
};

const CHAT_FUSION_TOKEN = "jwt";

export { CHAT_FUSION_TOKEN, corsOptions };
