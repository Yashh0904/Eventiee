import type { Request, Response } from "express";
import crypto from "node:crypto"
import { paymentInitiationSchema, paymentSimulationSchema, paymentVerificationSchema } from "../schema/payment.schema.js";
import { flattenError } from "zod/v4/core";
import { db } from "../db/index.js";
import { orderItemSchema, orderSchema, paymentSchema, ticketSchema } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { createGatewayOrder, providerPayment, verifyGatewaySignature } from "../services/paymentProvider.service.js";

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
      .where(eq(orderSchema.id, orderId));

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
      providerOrder,
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
      paymentDetails
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
      .where(eq(orderSchema.id, orderId));

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

      await tx
        .update(orderSchema)
        .set({ status: "COMPLETED" })
        .where(eq(orderSchema.id, orderId));

      const items = await tx
        .select()
        .from(orderItemSchema)
        .where(eq(orderItemSchema.orderId, order.id));

      const tickets: (typeof ticketSchema.$inferInsert)[] = [];

      for (const item of items) {
        for (let i = 0; i < item.quantity; i++) {
          tickets.push({
            attendeeId: user.id,
            eventId: order.eventId,
            orderId: order.id,
            ticketTypeId: item.ticketTypeId,
            shortId: Math.floor(100000 + Math.random() * 900000),
            qrToken: crypto.randomBytes(32).toString("hex"),
            status: "VALID",
          });
        }
      }

      return await tx.insert(ticketSchema).values(tickets).returning();
    });

    return res.status(200).json({
      message: "Payment verified and tickets issued successfully",
      tickets: issuedTickets,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "INTERNAL SERVER ERROR",
    });
  }
};
