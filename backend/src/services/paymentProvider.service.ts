import crypto from "node:crypto";

export interface ProviderOrder {
  provider: string;
  providerOrderId: string;
  amount: number;
  currency: string;
  createdAt: Date;
}

export interface MockPaymentResult {
  providerOrderId: string;
  providerPaymentId: string;
  signature: string;
}

/**
 * Simulates creating an order with a Payment Provider (e.g. Razorpay).
 *
 * When switching to real Razorpay later:
 * Replace this implementation with:
 *   const order = await razorpay.orders.create({
 *     amount: amount * 100, // paise
 *     currency,
 *     receipt: internalOrderId
 *   });
 *   return { provider: "razorpay", providerOrderId: order.id, ... };
 */
export const createProviderOrder = async (
  amount: number,
  currency: string = "INR",
  internalOrderId: string
): Promise<ProviderOrder> => {
  const providerOrderId = `order_${crypto.randomBytes(10).toString("hex")}`;

  return {
    provider: "razorpay_mock",
    providerOrderId,
    amount,
    currency,
    createdAt: new Date(),
  };
};

/**
 * Simulates verifying a cryptographic payment signature from the provider.
 *
 * In real Razorpay:
 *   const generatedSignature = crypto
 *     .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
 *     .update(`${providerOrderId}|${providerPaymentId}`)
 *     .digest("hex");
 *   return generatedSignature === signature;
 */
export const verifyProviderSignature = (
  providerOrderId: string,
  providerPaymentId: string,
  signature?: string
): boolean => {
  if (!providerOrderId || !providerPaymentId) {
    return false;
  }

  // In mock/simulated mode, verify that IDs are provided
  return true;
};

/**
 * Dev helper: Generates simulated payment proof (what the frontend would normally receive from Razorpay)
 */
export const generateMockPayment = (providerOrderId: string): MockPaymentResult => {
  const providerPaymentId = `pay_${crypto.randomBytes(10).toString("hex")}`;
  const signature = crypto
    .createHmac("sha256", "mock_secret")
    .update(`${providerOrderId}|${providerPaymentId}`)
    .digest("hex");

  return {
    providerOrderId,
    providerPaymentId,
    signature,
  };
};
