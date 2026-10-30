import { User } from "@/lib/store/auth-store";

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface EventItem {
  id: string;
  organizerId: string;
  organizerName: string;
  name: string;
  venue: string;
  city: string;
  description: string;
  dateTime: string;
  endDateTime?: string | null;
  bannerUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TicketType {
  name: string,
  price: number,
  quantity: number
}

export interface EventPayload {
  name: string;
  venue: string;
  city: string;
  description: string;
  dateTime: string;
  endDateTime?: string | null;
  bannerUrl?: string | null;
  tickets: TicketType[]
}

export interface EventsResponse {
  events: EventItem[];
}

export interface OrderPayload {
  eventId: string,
  items: {
    ticketTypeId: string;
    quantity: number;
  }[]
}

export interface OrderResponse {
    createdAt: Date;
    id: string;
    updatedAt: Date;
    userId: string;
    eventId: string;
    status: "PENDING" | "COMPLETED" | "CANCELLED" | "EXPIRED";
    totalAmount: number;
}

export interface BasePayment {
  orderId: string;
  gatewayOrderId: string;
}

export interface PaymentResponse {
  gatewayOrderId: string,
  gatewayProvider: string,
  amount: Number, 
  currency: string,
  createdAt: Date
}

export interface PaymentSimulationPayload extends BasePayment {
  gatewayProvider: string,
  amount: number,
  currency: string
}

export interface PaymentSimulationResponse {
  gatewayOrderId: string, 
  paymentId: string, 
  signature: string
}

export interface PaymentVerification extends BasePayment {
  providerPaymentId: string, 
  signature: string
}

export interface Ticket {
  orderId: string;
  id: string;
  createdAt: Date;
  updatedAt: Date;
  eventId: string;
  status: "CANCELLED" | "VALID" | "USED";
  ticketTypeId: string;
  attendeeId: string;
  shortId: string;
  qrToken: string;
  checkedInAt: Date | null;
}

export interface Tickets {
  tickets: Ticket[],
}

export interface TicketItem extends Ticket {
  event: EventItem,
  ticketType: {
    id: string;
    name: string;
    price: number;
  };
}