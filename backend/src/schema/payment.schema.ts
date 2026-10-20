import z from "zod";

export const paymentInitiationSchema = z.object({
  orderId: z.uuid("Invalid order ID")
});

export const paymentSimulationSchema = z.object({
  orderId: z.uuid(),
  gatewayOrderId: z.string(),
  gatewayProvider: z.string(),
  amount: z.number().nonnegative(),
  currency: z.string().default("INR")
})

export const paymentVerificationSchema = z.object({
  orderId: z.uuid("Invalid order ID"),
  gatewayOrderId: z.string().min(1, "Provider order ID is required"),
  providerPaymentId: z.string().min(1, "Provider payment ID is required"),
  signature: z.string().min(1, "Payment signature is required"),
});