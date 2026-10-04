import express from "express"
import { authMiddleWare, requireRole } from "../middlewares/authMiddleware.js";
import { createEvent, createTicketType, getEvent, getEvents } from "../controllers/event.controller.js";

const eventRouter = express.Router();

eventRouter.post('/', authMiddleWare, requireRole('ORGANIZER'), createEvent);

eventRouter.get('/', getEvents);

eventRouter.get('/:eventId', getEvent);

eventRouter.post('/:eventId/ticket-types', authMiddleWare, requireRole('ORGANIZER'), createTicketType);

export default eventRouter;