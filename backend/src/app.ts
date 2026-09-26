import express from "express";
import cors from "cors";
import authRouter from "./routes/auth.route.js";
import cookieParser from "cookie-parser";

const app = express();
app.use(express.json());
app.use(cors({
    origin: process.env.FRONTEND_URL! || "http://localhost:3000",
    credentials: true
}));
app.use(cookieParser())

app.use('/api/auth', authRouter);

export default app;