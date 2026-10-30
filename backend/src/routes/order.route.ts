import express from "express"
import { authMiddleWare } from "../middlewares/authMiddleware.js";
import { createOrder, getOrderDetails, getOrders } from "../controllers/order.controller.js";
import { orderLimiter } from "../middlewares/rateLimiter.js";

const orderRouter = express.Router();

orderRouter.post('/', orderLimiter, authMiddleWare, createOrder);

orderRouter.get('/me', authMiddleWare, getOrders);

orderRouter.get('/:orderId', authMiddleWare, getOrderDetails);

export default orderRouter;