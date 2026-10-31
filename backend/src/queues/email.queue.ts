import { Queue } from "bullmq";
import { redis } from "../lib/redis.js";

export type WelcomeEmailPayload = {
  type: "welcome";
  userEmail: string;
  userName: string;
};

export type TicketEmailPayload = {
  type: "ticket";
  userEmail: string;
  userName: string;
  eventName: string;
  venue: string;
  dateTime: string;
  tickets: Array<{
    shortId: string;
    qrToken: string;
  }>;
};

export type EmailJobData = WelcomeEmailPayload | TicketEmailPayload;

 export const emailQueue = new Queue<EmailJobData>("email", {
    connection: redis
 })