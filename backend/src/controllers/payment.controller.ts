import type { Request, Response } from "express";
import crypto from "node:crypto"
import { paymentInitiationSchema, paymentSimulationSchema, paymentVerificationSchema } from "../schema/payment.schema.js";
import { flattenError } from "zod/v4/core";
import { db } from "../db/index.js";
import { eventSchema, orderItemSchema, orderSchema, paymentSchema, ticketSchema, ticketTypeSchema } from "../db/schema.js";
import { and, eq } from "drizzle-orm";
import { createGatewayOrder, providerPayment, verifyGatewaySignature } from "../services/paymentProvider.service.js";
import { nanoid } from "nanoid";
import { emailQueue } from "../queues/email.queue.js";

export const initiatePayment = async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const result = paymentInitiationSchema.safeParse(req.body);

    if (result.error) {
      return res.status(400).json({
        errors: flattenError(result.error).fieldErrors,
      });
    }

    const { orderId } = result.data;

    const [ order ] = await db
      .select()
      .from(orderSchema)
      .where(and(
        eq(orderSchema.userId, user.id),
        eq(orderSchema.id, orderId)
      ));

    if (!order) {
      return res.status(404).json({
        message: "No such order",
      });
    }

    if (order.status !== "PENDING") {
      return res.status(400).json({
        message: "Order has already been completed or cancelled",
      });
    }

    const providerOrder = await createGatewayOrder(order.totalAmount, "INR", order.id);

    return res.status(200).json({
      ...providerOrder
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "INTERNAL SERVER ERROR",
    });
  }
};

export const simulatePayment = async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const result = paymentSimulationSchema.safeParse(req.body);

    if (result.error) {
      return res.status(400).json({
        errors: flattenError(result.error).fieldErrors,
      });
    }

    const { orderId, gatewayOrderId, gatewayProvider, amount, currency } = result.data;

    const paymentDetails = await providerPayment(orderId, gatewayOrderId, gatewayProvider);

    return res.status(200).json({
      ...paymentDetails
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "INTERNAL SERVER ERROR",
    });
  }
};

export const verifyPayment = async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const result = paymentVerificationSchema.safeParse(req.body);

    if (result.error) {
      return res.status(400).json({
        errors: flattenError(result.error).fieldErrors,
      });
    }

    const { orderId, gatewayOrderId, providerPaymentId, signature } = result.data;

    const [ order ] = await db
      .select()
      .from(orderSchema)
      .where(and(
        eq(orderSchema.id, orderId),
        eq(orderSchema.userId, user.id)
      ));

    if (!order) {
      return res.status(404).json({
        message: "No such order",
      });
    }

    if (order.status !== "PENDING") {
      return res.status(400).json({
        message: "Order has already been completed or cancelled",
      });
    }

    const verifiedPayment = verifyGatewaySignature(gatewayOrderId, providerPaymentId, signature);

    if (!verifiedPayment) {
      await db.insert(paymentSchema).values({
        orderId,
        amount: order.totalAmount,
        currency: "INR",
        status: "FAILED",
        provider: "mock",
        providerPaymentId,
        providerOrderId: gatewayOrderId,
      });

      return res.status(400).json({
        message: "Payment verification failed",
      });
    }

    const issuedTickets = await db.transaction(async (tx) => {
      await tx.insert(paymentSchema).values({
        orderId,
        amount: order.totalAmount,
        currency: "INR",
        status: "SUCCESSFUL",
        provider: "mock",
        providerPaymentId,
        providerOrderId: gatewayOrderId,
      });

      const [ completedOrder ] = await tx
        .update(orderSchema)
        .set({ status: "COMPLETED" })
        .where(and(
          eq(orderSchema.id, orderId),
          eq(orderSchema.status, "PENDING")
        )).returning();

      if (!completedOrder) {
        throw new Error("Order has expired or has already been completed");
      }

      const items = await tx
        .select()
        .from(orderItemSchema)
        .where(eq(orderItemSchema.orderId, order.id));

      const tickets: (typeof ticketSchema.$inferInsert)[] = [];

      for (const item of items) {
        for (let i = 0; i < item.quantity; i++) {
          tickets.push({
            attendeeId: order.userId,
            eventId: order.eventId,
            orderId: order.id,
            ticketTypeId: item.ticketTypeId,
            shortId: nanoid(6),
            qrToken: crypto.randomBytes(32).toString("hex"),
            status: "VALID",
          });
        }
      }

      return await tx.insert(ticketSchema).values(tickets).returning();
    });

    const firstTicket = issuedTickets[0];
    if (!firstTicket) {
      throw new Error("Failed to issue tickets");
    }

    const [ event ] = await db
      .select()
      .from(eventSchema)
      .where(eq(eventSchema.id, firstTicket.eventId));

    if(!event) {
      throw new Error("Invalid Event");
    }

    const emailTickets = issuedTickets.map((ticket) => ({
      shortId: ticket.shortId,
      qrToken: ticket.qrToken,
    }))

    await emailQueue.add('send-email',
      {
        type: "ticket",
        userEmail: user.email,
        userName:user.name,
        eventName: event.name,
        venue: event.venue,
        dateTime: event.dateTime.toDateString(),
        tickets: emailTickets
      },
      {
        jobId: `welcome-email-${order.id}`,
        removeOnComplete: true,
        removeOnFail: 1000,
      }
    )

    return res.status(200).json({
      tickets: issuedTickets,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "INTERNAL SERVER ERROR",
    });
  }
};
