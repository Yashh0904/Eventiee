import express from "express"
import { authMiddleWare } from "../middlewares/authMiddleware.js";
import { simulatePayment, initiatePayment, verifyPayment } from "../controllers/payment.controller.js";

const paymentRouter = express.Router();

paymentRouter.post('/', authMiddleWare, initiatePayment)

paymentRouter.post('/simulate', authMiddleWare, simulatePayment)

paymentRouter.post('/verify', authMiddleWare, verifyPayment)

export default paymentRouter;