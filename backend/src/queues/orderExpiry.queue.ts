import { Queue } from "bullmq";
import { redis } from "../lib/redis.js";

export type OrderExpiryJobData = {
  orderId: string;
};

export const orderExpiryQueue = new Queue<OrderExpiryJobData>("order-expiry", {
  connection: redis,
});

export const addOrderExpiryJob = async (
  orderId: string, 
  delayMs: number = 15 * 60 * 1000
) => {
  return await orderExpiryQueue.add(
    "expire-order",
    { orderId },
    {
      delay: delayMs,
      jobId: `order-expiry-${orderId}`,
      removeOnComplete: true,
      removeOnFail: 1000,
    }
  );
};