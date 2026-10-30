import express from "express";
import cors from "cors";
import authRouter from "./routes/auth.route.js";
import cookieParser from "cookie-parser";
import eventRouter from "./routes/event.route.js";
import orderRouter from "./routes/order.route.js";
import paymentRouter from "./routes/payment.routes.js";
import ticketRouter from "./routes/ticket.route.js";
import { env } from "./config/env.js";

const app = express();
app.set("trust proxy", 1);
app.use(express.json());
app.use(cors({
    origin: env.FRONTEND_URL,
    credentials: true
}));
app.use(cookieParser())

app.use('/api/auth', authRouter);
app.use('/api/event', eventRouter);
app.use('/api/order', orderRouter);
app.use('/api/payment', paymentRouter);
app.use('/api/ticket', ticketRouter);

export default app;
