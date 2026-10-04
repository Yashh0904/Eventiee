import express from "express"
import { authMiddleWare } from "../middlewares/authMiddleware.js";
import { initiatePayment, verifyPayment } from "../controllers/payment.controller.js";

const paymentRouter = express.Router();

paymentRouter.post('/', authMiddleWare, initiatePayment)

paymentRouter.post('/verify', authMiddleWare, verifyPayment)

export default paymentRouter;