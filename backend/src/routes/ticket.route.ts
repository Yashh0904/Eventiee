import express from "express";
import { authMiddleWare } from "../middlewares/authMiddleware.js";
import {
  checkIn,
  getMyTickets,
  getTicketDetails,
} from "../controllers/ticket.controller.js";

const ticketRouter = express.Router();

// Gate check-in: verifies that the scanner is the creator of the event inside controller
ticketRouter.post("/checkin", authMiddleWare, checkIn);

ticketRouter.get("/me", authMiddleWare, getMyTickets);

ticketRouter.get("/:ticketId", authMiddleWare, getTicketDetails);

export default ticketRouter;