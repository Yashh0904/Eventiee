import z from "zod";

export const paymentInitiationSchema = z.object({
  orderId: z.uuid("Invalid order ID")
});

export const paymentVerificationSchema = z.object({
  orderId: z.uuid("Invalid order ID"),
  providerOrderId: z.string().min(1, "Provider order ID is required"),
  providerPaymentId: z.string().min(1, "Provider payment ID is required"),
  signature: z.string().min(1, "Payment signature is required"),
});