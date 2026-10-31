import { Worker } from "bullmq";
import { type OrderExpiryJobData } from "../queues/orderExpiry.queue.js";
import { db } from "../db/index.js";
import { orderItemSchema, orderSchema, ticketTypeSchema } from "../db/schema.js";
import { and, eq, sql } from "drizzle-orm";
import { redis } from "../lib/redis.js";

export const orderExpiryWorker = new Worker<OrderExpiryJobData>(
  "order-expiry",
  async (job) => {
    const { orderId } = job.data;
    console.log(`[OrderExpiryWorker] Checking expiration for order: ${orderId}`);

    const [ order ] = await db
      .select()
      .from(orderSchema)
      .where(eq(orderSchema.id, orderId));

    if (!order) {
      console.log(`[OrderExpiryWorker] Order ${orderId} not found. Skipping.`);
      return;
    }

    if (order.status !== "PENDING") {
      console.log(
        `[OrderExpiryWorker] Order ${orderId} is "${order.status}". No action needed.`
      );
      return;
    }

    await db.transaction(async (tx) => {
      const [order] = await tx
        .select()
        .from(orderSchema)
        .where(eq(orderSchema.id, orderId))
        .for("update");
      if (!order || order.status !== "PENDING") {
        console.log(`[OrderExpiryWorker] Order ${orderId} is not PENDING. Skipping.`);
        return;
      }

      await tx
        .update(orderSchema)
        .set({ status: "EXPIRED" })
        .where(and(
          eq(orderSchema.id, orderId),
          eq(orderSchema.status, "PENDING")
        )).returning();

      const items = await tx
        .select()
        .from(orderItemSchema)
        .where(eq(orderItemSchema.orderId, orderId));

      for (const item of items) {
        await tx
          .update(ticketTypeSchema)
          .set({
            quantity: sql`${ticketTypeSchema.quantity} + ${item.quantity}`,
          })
          .where(eq(ticketTypeSchema.id, item.ticketTypeId));
      }
    });

    console.log(
      `[OrderExpiryWorker] Successfully expired order ${orderId} and restored ticket inventory.`
    );
  },
  {
    connection: redis,
    drainDelay: 120,
    stalledInterval: 300000 
  }
);

orderExpiryWorker.on("completed", (job) => {
  console.log(`[OrderExpiryWorker] Job ${job.id} completed successfully.`);
});

orderExpiryWorker.on("failed", (job, err) => {
  console.error(`[OrderExpiryWorker] Job ${job?.id} failed with error:`, err);
});
