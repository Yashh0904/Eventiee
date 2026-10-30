import { AuthResponse, EventItem, EventPayload, EventsResponse, LoginPayload, OrderPayload, OrderResponse, PaymentResponse, PaymentSimulationPayload, PaymentSimulationResponse, PaymentVerification, RegisterPayload, TicketItem, Tickets, TicketType } from "@/types";
import { useAuthStore, type User } from "./store/auth-store";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export class ApiError extends Error {
  statusCode: number;
  errors?: Record<string, string[]>;

  constructor(message: string, statusCode: number, errors?: Record<string, string[]>) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}, isRetry= false): Promise<T> {
  const token = useAuthStore.getState().accessToken;

  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: "include", 
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const tokenStatus = data?.tokenStatus;
    if(tokenStatus === "REVOKED"){
      useAuthStore.getState().clearAuth();
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
      throw new ApiError(data.message || "Session revoked", response.status);
    }
    if(response.status === 401 && tokenStatus === "EXPIRED" && !isRetry) {
      const newToken = await refreshAccessToken();

      if (newToken) {
        return request<T>(endpoint, options, true);
      }
    }
    const message =
      data.message ||
      (data.errors ? "Validation error occurred" : "An error occurred with the request");
    throw new ApiError(message, response.status, data.errors);
  }

  return data as T;
}

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null>  {
  if (refreshPromise) return refreshPromise;
  refreshPromise = (async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Refresh failed");
      const data = await res.json();
      useAuthStore.getState().setAuth(data.user, data.accessToken);
      return data.accessToken;
    } catch {
      useAuthStore.getState().clearAuth();
      return null;
    } finally {
      refreshPromise = null;
    }
  })();
  return refreshPromise;
}

export const api = {
  register: (payload: RegisterPayload) =>
    request<AuthResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  login: (payload: LoginPayload) =>
    request<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  logout: () =>
    request<{ message: string }>("/api/auth/logout", {
      method: "POST",
    }),

  refreshToken: () => refreshAccessToken(),

  getEvents: (params?: { city?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.city && params.city !== "All") {
      searchParams.set("city", params.city);
    }
    const query = searchParams.toString() ? `?${searchParams.toString()}` : "";
    return request<EventsResponse>(`/api/event${query}`);
  },

  getMyEvents: () => 
    request<EventsResponse>('/api/event/me'),

  getEvent: (eventId: string) =>
    request<{ event: EventItem, ticketTypes?: TicketType[] }>(`/api/event/${eventId}`),

  createEvent: (payload: EventPayload) => 
    request<EventItem & TicketType[]>('/api/event', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  createOrder: (payload: OrderPayload) =>
    request<OrderResponse>('/api/order', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  initiatePayment: (orderId: string) => 
    request<PaymentResponse>('/api/payment', {
      method: 'POST',
      body: JSON.stringify({ orderId })
    }),

  simulatePayment: (payload: PaymentSimulationPayload) =>
    request<PaymentSimulationResponse>('/api/payment/simulate', {
      method: "POST",
      body: JSON.stringify(payload)
    }),

  verifyPayment: (payload: PaymentVerification) => 
    request<Tickets>('/api/payment/verify', {
      method: "POST",
      body: JSON.stringify(payload)
    }),

  getMyTickets: () => request<TicketItem[]>('/api/ticket/me'),

  getMe: () => request<{ user: User }>('/api/auth/me'),

  updateProfile: (payload: { name?: string; avatarUrl?: string | null }) =>
    request<{ message: string; user: User }>('/api/auth/me', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  updateEvent: (eventId: string, payload: Partial<Omit<EventPayload, 'tickets'>>) =>
    request<{ message: string; event: EventItem }>(`/api/event/${eventId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
};