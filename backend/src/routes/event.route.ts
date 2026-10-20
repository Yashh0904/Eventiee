import express from "express";
import { authMiddleWare } from "../middlewares/authMiddleware.js";
import { createEvent, createTicketType, getEvent, getEvents, getMyEvents } from "../controllers/event.controller.js";

const eventRouter = express.Router();

eventRouter.post('/', authMiddleWare, createEvent);

eventRouter.get('/', getEvents);

eventRouter.get('/me', authMiddleWare, getMyEvents);

eventRouter.get('/:eventId', getEvent);

eventRouter.post('/:eventId/ticket-types', authMiddleWare, createTicketType);

export default eventRouter;