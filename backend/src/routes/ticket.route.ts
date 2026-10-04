import express from "express";
import { authMiddleWare, requireRole } from "../middlewares/authMiddleware.js";
import {
  checkIn,
  getMyTickets,
  getTicketDetails,
} from "../controllers/ticket.controller.js";

const ticketRouter = express.Router();

ticketRouter.post("/checkin", authMiddleWare, requireRole('ORGANIZER'), checkIn);

ticketRouter.get("/me", authMiddleWare, getMyTickets);

ticketRouter.get("/:ticketId", authMiddleWare, getTicketDetails);

export default ticketRouter;