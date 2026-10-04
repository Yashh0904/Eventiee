import type { Request, Response } from "express";
import { eventCreationSchema } from "../schema/event.schema.js";
import z from "zod";
import { db } from "../db/index.js";
import { eventSchema, ticketTypeSchema } from "../db/schema.js";
import { and, eq, gt } from "drizzle-orm";
import { ticketCreationSchema } from "../schema/ticket.schema.js";

export const createEvent = async (req: Request, res: Response) => {
  try {
    const user = req.user!

    const result = eventCreationSchema.safeParse(req.body);

    if(result.error) {
      return res.status(400).json({
        errors: z.flattenError(result.error).fieldErrors
      })
    }

    const { name, venue, description, dateTime } = result.data;

    const [ event ] = await db
    .insert(eventSchema)
    .values({
      organizerId: user.id,
      name,
      venue,
      description,
      dateTime
    }).returning();

    return res.status(200).json({
      message: "Event created",
      event
    });
  } catch(error) {
    console.error(error);

    return res.status(500).json({
      message: "INTERNAL SERVER ERROR"
    })
  }
}

export const getEvents = async (req: Request, res: Response) => {
  try {
    const events = await db
      .select()
      .from(eventSchema)
      .where(gt(eventSchema.dateTime, new Date()))

    return res.status(200).json({
      events
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "INTERNAL SERVER ERROR!"
    })
  }
}

type EventIdParam = { eventId: string }

export const getEvent = async (req: Request<EventIdParam>, res: Response) => {
  try {
    const { eventId } = req.params;

    const [ event ] = await db
      .select()
      .from(eventSchema)
      .where(eq(eventSchema.id, eventId));

    if(!event) {
      return res.status(404).json({
        message: "No such event"
      })
    }

    return res.status(200).json({
      event
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "INTERNAL SERVER ERROR!"
    })
  }
}

export const createTicketType = async (req: Request<EventIdParam>, res: Response) => {
  try {
    const user = req.user!;
    const { eventId } = req.params;

    const [ event ] = await db
      .select()
      .from(eventSchema)
      .where(and(
        eq(eventSchema.id, eventId),
        eq(eventSchema.organizerId, user.id)
      ));

    if(!event) {
      return res.status(400).json({
        message: "No such event to add tickets"
      })
    }

    const body = req.body;

    const result = ticketCreationSchema.safeParse(body);

    if(result.error) {
      return res.status(400).json({
        error: z.flattenError(result.error).fieldErrors
      })
    }

    const { name, price, quantity } = result.data;

    const [ createdTicketType ] = await db
      .insert(ticketTypeSchema)
      .values({
        eventId: event.id,
        name,
        price,
        quantity
      }).returning();

    return res.status(200).json({
      ticketType: createdTicketType
    })
  } catch(error) {
    console.log(error);

    return res.status(500).json({
      message: "INTERNAL SERVER ERROR!"
    })
  }
}