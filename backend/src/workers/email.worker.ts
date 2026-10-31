import { Worker } from "bullmq";
import type { EmailJobData } from "../queues/email.queue.js";
import { sendTicketEmail, sendWelcomeEmail } from "../services/email.service.js";
import { redis } from "../lib/redis.js";

export const emailWorker = new Worker<EmailJobData>("email", 
    async (job) => {
        if(job.data.type === "welcome") {
            const { userEmail, userName } = job.data;

            await sendWelcomeEmail( userEmail, userName)
        }
        else if (job.data.type === "ticket") {
            await sendTicketEmail( {...job.data} )
        }
    },
    {
        connection: redis,
        drainDelay: 120,
        stalledInterval: 300000 
    }
)