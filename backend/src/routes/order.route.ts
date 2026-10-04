import express from "express"
import { authMiddleWare } from "../middlewares/authMiddleware.js";
import { createOrder, getOrderDetails, getOrders } from "../controllers/order.controller.js";

const orderRouter = express.Router();

orderRouter.post('/', authMiddleWare, createOrder);

orderRouter.get('/me', authMiddleWare, getOrders);

orderRouter.get('/:orderId', authMiddleWare, getOrderDetails);

export default orderRouter;