import nodemailer, { type Transporter } from "nodemailer";
import { env } from "../config/env.js";
import type { TicketEmailPayload } from "../queues/email.queue.js";

let cachedTransporter: Transporter | null = null
export const createEmailTransporter = async () => {
  if(cachedTransporter)  return cachedTransporter;
  const testAccount = await nodemailer.createTestAccount();

  cachedTransporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
        user: testAccount.user,
        pass: testAccount.pass,
    }
  })

  return cachedTransporter;
}

export async function sendWelcomeEmail (userEmail: string, userName: string, appUrl = env.FRONTEND_URL) {
  const transporter = await createEmailTransporter();

  const info = await transporter.sendMail({
    from: '"Eventiee" <noreply@eventiee.com>',
    to: userEmail,
    subject: "Welcome to Eventiee! 🎉",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; color: #111;">
        <h2 style="color: #7e22ce;">Welcome to Eventiee, ${userName}! 🎉</h2>
        <p style="font-size: 15px; line-height: 1.5; color: #444;">
          Your account is ready. You can now discover upcoming concerts, summits, and live experiences, and reserve digital passes instantly.
        </p>
        <div style="margin: 28px 0;">
          <a href="${appUrl}" style="background-color: #7e22ce; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px;">
            Explore Events &rarr;
          </a>
        </div>
        <p style="font-size: 13px; color: #888; border-top: 1px solid #eee; padding-top: 16px;">
          Sent by Eventiee • If you didn't create this account, please ignore this email.
        </p>
      </div>
    `,
  });

  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
}

export async function sendTicketEmail(
  { userEmail, userName, eventName, venue, dateTime, tickets }: TicketEmailPayload,
  appUrl = env.FRONTEND_URL
) {
  const transporter = await createEmailTransporter();

  const ticketRowsHtml = tickets
    .map(
      (t) => `
      <div style="background-color: #ffffff; border: 2px dashed #d8b4fe; border-radius: 12px; padding: 20px; margin-bottom: 16px; text-align: center;">
        
        <!-- Scannable QR Code -->
        <div style="margin-bottom: 12px;">
          <img
            src="https://api.qrserver.com/v1/create-qr-code/?size=160x160&margin=0&data=${encodeURIComponent(t.qrToken)}"
            alt="Ticket QR Code"
            width="160"
            height="160"
            style="display: block; margin: 0 auto; border-radius: 8px;"
          />
        </div>
        <!-- Fast Pass Code -->
        <div style="font-size: 13px; color: #6b7280; margin-bottom: 4px;">
          Fast Pass Entry Code
        </div>
        <div style="font-family: monospace; font-size: 18px; font-weight: bold; letter-spacing: 2px; color: #6b21a8; background-color: #f3e8ff; display: inline-block; padding: 4px 12px; border-radius: 6px;">
          #${t.shortId}
        </div>
        <div style="font-size: 11px; color: #9ca3af; margin-top: 8px;">
          Scan QR at venue entrance for instant check-in
        </div>
      </div>
    `
    )
    .join("");

  const info = await transporter.sendMail({
    from: '"Eventiee" <noreply@eventiee.com>',
    to: userEmail,
    subject: `Your Tickets for ${eventName} 🎟️`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; color: #111;">
        
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #7e22ce; margin: 0 0 8px 0; font-size: 24px;">Tickets Confirmed! 🎟️</h1>
          <p style="font-size: 15px; color: #4b5563; margin: 0;">Hey ${userName}, you're all set for the event.</p>
        </div>

        <!-- Event Details Card -->
        <div style="background-color: #faf5ff; border: 1px solid #e9d5ff; border-radius: 12px; padding: 18px; margin-bottom: 24px;">
          <h2 style="margin: 0 0 12px 0; font-size: 18px; color: #581c87;">${eventName}</h2>
          <div style="font-size: 14px; line-height: 1.6; color: #374151;">
            <div>📅 <strong>Date & Time:</strong> ${dateTime}</div>
            <div>📍 <strong>Venue:</strong> ${venue}</div>
          </div>
        </div>

        <!-- Tickets Section -->
        <div style="margin-bottom: 24px;">
          <h3 style="font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280; margin: 0 0 10px 0;">
            Your Digital Passes (${tickets.length})
          </h3>
          ${ticketRowsHtml}
        </div>

        <!-- Call to Action -->
        <div style="text-align: center; margin: 32px 0;">
          <a href="${appUrl}/tickets" style="background-color: #7e22ce; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block;">
            View Passes in App &rarr;
          </a>
        </div>

        <!-- Instructions & Footer -->
        <p style="font-size: 13px; color: #6b7280; line-height: 1.5; border-top: 1px solid #e5e7eb; padding-top: 16px; margin: 0;">
          Show this email or your in-app QR code at the entrance for check-in.<br />
          Need help? Contact support or reply to this email.
        </p>
      </div>
    `,
  });

  console.log("Ticket Email Preview URL: %s", nodemailer.getTestMessageUrl(info));
}