import type { Request, Response } from "express";
import { eventCreationSchema } from "../schema/event.schema.js";
import z from "zod";
import { db } from "../db/index.js";
import { eventSchema, ticketTypeSchema, userSchema } from "../db/schema.js";
import { and, eq, getTableColumns, gt } from "drizzle-orm";
import { ticketSchema } from "../schema/ticket.schema.js";

export const createEvent = async (req: Request, res: Response) => {
  try {
    const user = req.user!

    const result = eventCreationSchema.safeParse(req.body);

    if(result.error) {
      return res.status(400).json({
        errors: z.flattenError(result.error).fieldErrors
      })
    }

    const { name, venue, city, description, dateTime, endDateTime, bannerUrl, tickets } = result.data;

    const createdData = await db.transaction(async (tx) => {
      const [ event ] = await tx
        .insert(eventSchema)
        .values({
          organizerId: user.id,
          name,
          venue,
          city,
          description,
          dateTime,
          endDateTime,
          bannerUrl: bannerUrl || null
        }).returning();

      if (!event) {
        throw new Error("Failed to create event");
      }

      const ticketRows = tickets.map((ticket) => ({
        ...ticket,
        eventId: event.id,
      }));  

      const createdTicketTypes = await tx
        .insert(ticketTypeSchema)
        .values(ticketRows)

      return {event, tickets: createdTicketTypes}
    })

    return res.status(200).json({
      message: "Event created",
      ...createdData,
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
      .select({
        ...getTableColumns(eventSchema),
        organizerName: userSchema.name
      })
      .from(eventSchema)
      .innerJoin(userSchema, eq(eventSchema.organizerId, userSchema.id))
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

export const getMyEvents = async (req: Request, res: Response) => {
  try {
    const user = req.user!;

    const events = await db
      .select({
        ...getTableColumns(eventSchema),
        organizerName: userSchema.name
      })
      .from(eventSchema)
      .innerJoin(userSchema, eq(eventSchema.organizerId, userSchema.id))
      .where(eq(eventSchema.organizerId, user.id))

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
      .select({
        ...getTableColumns(eventSchema),
        organizerName: userSchema.name,
      })
      .from(eventSchema)
      .innerJoin(userSchema, eq(eventSchema.organizerId, userSchema.id))
      .where(eq(eventSchema.id, eventId));

    if(!event) {
      return res.status(404).json({
        message: "No such event"
      })
    }

    const ticketTypes = await db
    .select()
    .from(ticketTypeSchema)
    .where(eq(ticketTypeSchema.eventId, event.id));

    return res.status(200).json({
      event,
      ticketTypes
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

    const result = ticketSchema.safeParse(body);

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