import type { Request, Response } from "express"
import { orderCreationSchema } from "../schema/order.schema.js"
import { flattenError } from "zod/v4/core";
import { eventSchema, orderItemSchema, orderSchema, ticketTypeSchema } from "../db/schema.js";
import { and, eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { addOrderExpiryJob } from "../queues/orderExpiry.queue.js";

export const createOrder = async (req: Request, res: Response) => {
  try{
    const user = req.user!
    const result = orderCreationSchema.safeParse(req.body);

    if(result.error) {
      return res.status(400).json({
        error: flattenError(result.error).fieldErrors
      })
    }

    const { eventId, items } = result.data;

    const [ event ] = await db
      .select()
      .from(eventSchema)
      .where(eq(eventSchema.id, eventId));

    if(!event) {
      return res.status(400).json({
        message: "Invalid event"
      })
    }

    const orderTxn = await db.transaction(async (tx) => {
      let totalAmount = 0;
      let preparedOrderItems = [];

      for(const item of items) {
        const [ ticketType ] = await tx
          .select()
          .from(ticketTypeSchema)
          .where(and(
            eq(ticketTypeSchema.id, item.ticketTypeId),
            eq(ticketTypeSchema.eventId, eventId)
          ))

        if(!ticketType) {
          throw new Error("Invalid ticket type");
        }

        if (item.quantity > ticketType.quantity) {
          throw new Error(`Only ${ticketType.quantity} tickets remaining for ${ticketType.name}`);
        }

        await tx
          .update(ticketTypeSchema)
          .set({ quantity: ticketType.quantity - item.quantity })
          .where(eq(ticketTypeSchema.id, item.ticketTypeId))

        preparedOrderItems.push({
          ticketTypeId: item.ticketTypeId,
          quantity: item.quantity,
          unitPrice: ticketType.price,
        });

        totalAmount += ticketType.price * item.quantity;
      }

      const [ order ] = await tx
        .insert(orderSchema)
        .values({
          userId: user.id,
          eventId: event.id,
          status: "PENDING",
          totalAmount
        }).returning();

      if(!order) {
        throw new Error("Order Creation failed")
      }

      await tx.insert(orderItemSchema).values(
        preparedOrderItems.map((item) => ({
          orderId: order.id,
          ...item,
        }))
      );

      return order;
    })

    await addOrderExpiryJob(orderTxn.id);

    return res.status(201).json({
      message: "Order initiated successfully",
      order: orderTxn,
    });
  } catch(error: any) {
    return res.status(400).json({
      message: error.message || "Failed to create order"
    });
  }
}

type orderParam = {
  orderId: string
}

export const getOrderDetails = async (req: Request<orderParam>, res: Response) => {
  try {
    const user = req.user!;
    const { orderId } = req.params;

    const order = await db
      .select({
        orderId: orderSchema.id,
        status: orderSchema.status,
        totalAmount: orderSchema.totalAmount,
        createdAt: orderSchema.createdAt,

        eventName: eventSchema.name,
        eventVenue: eventSchema.venue,
        eventDateTime: eventSchema.dateTime,

        orderItemId: orderItemSchema.id,
        quantity: orderItemSchema.quantity,
        unitPrice: orderItemSchema.unitPrice,
        ticketTypeName: ticketTypeSchema.name
      })
      .from(orderSchema)
      .innerJoin(eventSchema, eq(orderSchema.eventId, eventSchema.id))
      .innerJoin(orderItemSchema, eq(orderSchema.id, orderItemSchema.orderId))
      .innerJoin(ticketTypeSchema, eq(orderItemSchema.ticketTypeId, ticketTypeSchema.id))
      .where(and(
        eq(orderSchema.id, orderId),
        eq(orderSchema.userId, user.id)
      ));

    const [ firstRow ] = order;

    if (!firstRow) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    const orderDetails = {
      id: firstRow.orderId,
      status: firstRow.status,
      totalAmount: firstRow.totalAmount,
      createdAt: firstRow.createdAt,
      event: {
        name: firstRow.eventName,
        venue: firstRow.eventVenue,
        dateTime: firstRow.eventDateTime
      },
      items: order.map((item) => ({
        id: item.orderItemId,
        ticketType: item.ticketTypeName,
        quantity: item.quantity,
        unitPrice: item.unitPrice
      }))
    }

    return res.status(200).json({
      order: orderDetails
    })
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "INTERNAL SERVER ERROR" });
  }
}

export const getOrders = async (req: Request, res: Response) => {
  try {
    const user = req.user!

    const rows = await db
      .select({
        orderId: orderSchema.id,
        status: orderSchema.status,
        totalAmount: orderSchema.totalAmount,
        createdAt: orderSchema.createdAt,

        eventName: eventSchema.name,
        eventVenue: eventSchema.venue,
        eventDateTime: eventSchema.dateTime,

        orderItemId: orderItemSchema.id,
        quantity: orderItemSchema.quantity,
        unitPrice: orderItemSchema.unitPrice,
        ticketTypeName: ticketTypeSchema.name
      })
      .from(orderSchema)
      .innerJoin(eventSchema, eq(orderSchema.eventId, eventSchema.id))
      .innerJoin(orderItemSchema, eq(orderSchema.id, orderItemSchema.orderId))
      .innerJoin(ticketTypeSchema, eq(orderItemSchema.ticketTypeId, ticketTypeSchema.id))
      .where(eq(orderSchema.userId, user.id));

    const ordersMap = new Map();

    for(const row of rows) {
      if(!ordersMap.has(row.orderId)) {
        ordersMap.set(row.orderId, {
          id: row.orderId,
          status: row.status,
          totalAmount: row.totalAmount,
          createdAt: row.createdAt,
          event: {
            name: row.eventName,
            venue: row.eventVenue,
            dateTime: row.eventDateTime,
          },
          items: [],
        })
      }

      ordersMap.get(row.orderId).items.push({
        id: row.orderItemId,
        ticketType: row.ticketTypeName,
        quantity: row.quantity,
        unitPrice: row.unitPrice,
      })
    }

    const userOrders = Array.from(ordersMap.values());
    return res.status(200).json({ orders: userOrders });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "INTERNAL SERVER ERROR" });
  }
}