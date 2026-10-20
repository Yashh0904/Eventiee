import crypto from "node:crypto"

interface GatewayOrder {
  gatewayOrderId: string,
  gatewayProvider: string,
  amount: Number, 
  currency: string,
  createdAt: Date
}

interface PaymentDetails {
  gatewayOrderId: string, 
  paymentId: string, 
  signature: string
}

export const createGatewayOrder = async (amount: Number, currency: string, orderId: string): Promise<GatewayOrder> => {
  const gatewayOrderId = `order_${crypto.randomBytes(10).toString('hex')}`

  // gateway db inserts GatewayOrder

  return { 
    gatewayOrderId,
    gatewayProvider: "mock",
    amount, 
    currency,
    createdAt: new Date()
  }
}

export const providerPayment = async (orderId: string, gatewayOrderId: string, gatewayProvider: string): Promise<PaymentDetails> => {
  const paymentId = `${gatewayProvider}_${crypto.randomBytes(10).toString('hex')}`;

  // bank apis probably with amount and currency as well

  await new Promise((resolve) => setTimeout(resolve, 500));

  const signature = crypto
    .createHmac('sha256', process.env.PAYMENT_SERVICE_SECRET!)
    .update(`${gatewayOrderId}|${paymentId}`)
    .digest('hex');

  // another provider db insert

  return {gatewayOrderId, paymentId, signature}
}

export const verifyGatewaySignature = (gatewayOrderId: string, providerPaymentId: string, signature: string) => {
  const signatureCheck = crypto
    .createHmac('sha256', process.env.PAYMENT_SERVICE_SECRET!)
    .update(`${gatewayOrderId}|${providerPaymentId}`)
    .digest('hex');
  
  return signature === signatureCheck
}