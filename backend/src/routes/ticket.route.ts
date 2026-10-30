import express from "express";
import { authMiddleWare } from "../middlewares/authMiddleware.js";
import {
  checkIn,
  getMyTickets,
  getTicketDetails,
} from "../controllers/ticket.controller.js";
import { checkInLimiter } from "../middlewares/rateLimiter.js";

const ticketRouter = express.Router();

ticketRouter.post("/checkin", checkInLimiter, authMiddleWare, checkIn);

ticketRouter.get("/me", authMiddleWare, getMyTickets);

ticketRouter.get("/:ticketId", authMiddleWare, getTicketDetails);

export default ticketRouter;