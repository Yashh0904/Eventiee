import type { Request, Response } from "express";
import { db } from "../db/index.js";
import { eventSchema, ticketSchema, ticketTypeSchema, userSchema } from "../db/schema.js";
import { and, asc, desc, eq, gte, lt, lte, type SQL } from "drizzle-orm";

export const getMyTickets = async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const view = req.query.view as string | undefined;

    const now = new Date();
    const conditions: (SQL | undefined)[] = [
      eq(ticketSchema.attendeeId, user.id)
    ];

    let orderByClause = desc(eventSchema.dateTime);

    if (view === "active") {
      const past5Hours = new Date(now.getTime() - 5 * 60 * 60 * 1000);
      const next12Hours = new Date(now.getTime() + 12 * 60 * 60 * 1000);

      conditions.push(
        gte(eventSchema.dateTime, past5Hours),
        lte(eventSchema.dateTime, next12Hours)
      );
      orderByClause = asc(eventSchema.dateTime);
    } else if (view === "upcoming") {
      conditions.push(gte(eventSchema.dateTime, now));
      orderByClause = asc(eventSchema.dateTime);
    } else if (view === "past") {
      conditions.push(lt(eventSchema.dateTime, now));
      orderByClause = desc(eventSchema.dateTime);
    }

    const tickets = await db
      .select({
        id: ticketSchema.id,
        shortId: ticketSchema.shortId,
        status: ticketSchema.status,
        qrToken: ticketSchema.qrToken,
        checkedInAt: ticketSchema.checkedInAt,
        createdAt: ticketSchema.createdAt,
        orderId: ticketSchema.orderId,
        event: {
          id: eventSchema.id,
          name: eventSchema.name,
          venue: eventSchema.venue,
          dateTime: eventSchema.dateTime,
          bannerUrl: eventSchema.bannerUrl,
          description: eventSchema.description,
        },
        ticketType: {
          id: ticketTypeSchema.id,
          name: ticketTypeSchema.name,
          price: ticketTypeSchema.price,
        },
      })
      .from(ticketSchema)
      .innerJoin(eventSchema, eq(ticketSchema.eventId, eventSchema.id))
      .innerJoin(ticketTypeSchema, eq(ticketSchema.ticketTypeId, ticketTypeSchema.id))
      .where(and(...conditions))
      .orderBy(orderByClause);

    return res.status(200).json(tickets);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "INTERNAL SERVER ERROR",
    });
  }
};

type TicketParam = {
  ticketId: string;
};

export const getTicketDetails = async (req: Request<TicketParam>, res: Response) => {
  try {
    const user = req.user!;
    const { ticketId } = req.params;

    const [ ticket ] = await db
      .select({
        id: ticketSchema.id,
        shortId: ticketSchema.shortId,
        status: ticketSchema.status,
        qrToken: ticketSchema.qrToken,
        checkedInAt: ticketSchema.checkedInAt,
        createdAt: ticketSchema.createdAt,
        orderId: ticketSchema.orderId,
        event: {
          id: eventSchema.id,
          name: eventSchema.name,
          venue: eventSchema.venue,
          dateTime: eventSchema.dateTime,
          bannerUrl: eventSchema.bannerUrl,
          description: eventSchema.description,
        },
        ticketType: {
          id: ticketTypeSchema.id,
          name: ticketTypeSchema.name,
          price: ticketTypeSchema.price,
        },
      })
      .from(ticketSchema)
      .innerJoin(eventSchema, eq(ticketSchema.eventId, eventSchema.id))
      .innerJoin(ticketTypeSchema, eq(ticketSchema.ticketTypeId, ticketTypeSchema.id))
      .where(and(
        eq(ticketSchema.id, ticketId),
        eq(ticketSchema.attendeeId, user.id)
      ));

    if (!ticket) {
      return res.status(404).json({
        message: "Ticket not found",
      });
    }

    return res.status(200).json({
      ticket,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "INTERNAL SERVER ERROR",
    });
  }
};

export const checkIn = async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const { qrToken, shortId, eventId } = req.body;

    if (!qrToken && !shortId) {
      return res.status(400).json({
        message: "Received no qr token to scan",
      });
    }
    else if(shortId && !eventId) {
      return res.status(400).json({
        message: "eventId is required when checking in with shortId",
      });
    }

    const condition = qrToken
      ? eq(ticketSchema.qrToken, qrToken)
      : and(eq(ticketSchema.eventId, eventId), eq(ticketSchema.shortId, shortId));

    const [ ticket ] = await db
      .select()
      .from(ticketSchema)
      .where(condition);

    if (!ticket) {
      return res.status(404).json({
        message: "Invalid ticket",
      });
    }

    const [ organizer ] = await db
      .select({ organizerId: eventSchema.organizerId })
      .from(eventSchema)
      .where(eq(eventSchema.id, ticket.eventId));

    if (!organizer || organizer.organizerId !== user.id) {
      return res.status(403).json({
        message: "Check-in can only be done by organizer",
      });
    }

    if (ticket.status !== "VALID") {
      return res.status(409).json({
        message: `Ticket ${ticket.status === "USED" ? `already used at ${ticket.checkedInAt}` : "invalid"}`,
      });
    }

    const [ attendee ] = await db
      .select({
        name: userSchema.name,
        email: userSchema.email,
        avatarUrl: userSchema.avatarUrl      
      })
      .from(userSchema)
      .where(eq(userSchema.id, ticket.attendeeId));

    const [ ticketType ] = await db
      .select({
        name: ticketTypeSchema.name 
      })
      .from(ticketTypeSchema)
      .where(eq(ticketTypeSchema.id, ticket.ticketTypeId));

    if(!attendee) {
      return res.status(404).json({
        message: "Invalid ticket",
      });
    }

    const [ updatedTicket ] = await db
      .update(ticketSchema)
      .set({
        status: "USED",
        checkedInAt: new Date(),
      })
      .where(and(
        eq(ticketSchema.id, ticket.id),
        eq(ticketSchema.status, "VALID")
      )).returning();

    if(!updatedTicket){
      return res.status(409).json({
        message: "Ticket has already been checked in or is no longer valid",
      });
    }

    return res.status(200).json({
      message: "Check in successful",
      ticket: {
        id: ticket.id,
        status: updatedTicket?.status,
        checkedAt: updatedTicket?.checkedInAt,
        attendee: {
          ...attendee 
        },
        ticketType: ticketType?.name,
        event: ticket.eventId
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "INTERNAL SERVER ERROR",
    });
  }
};