"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  MapPin,
  Building,
  Sparkles,
  ArrowRight,
  Ticket,
  Minus,
  Plus,
  Lock,
  Clock,
  User,
  AlertCircle,
  LogIn,
  UserPlus,
} from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/store/auth-store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/toast";
import { MockPaymentModal } from "@/components/events/MockPaymentModal";
import { EventItem } from "@/types";

interface TicketTier {
  id: string;
  name: string;
  description?: string;
  price: number;
  availableQuantity: number;
}

export default function EventBookingPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = (params?.id as string) || "";
  const { authStatus } = useAuthStore();

  const [showAuthModal, setShowAuthModal] = React.useState(false);
  const [openPaymentModal, setOpenPaymentModal] = React.useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["event", eventId],
    queryFn: () => api.getEvent(eventId),
    enabled: Boolean(eventId),
  });

  const paymentMutation = useMutation({
    mutationFn: async () => {
      const orderResponse = await api.createOrder({
        eventId,
        items: Object.entries(quantities).map(([ticketTypeId, quantity]) => ({ticketTypeId, quantity}))
      });

      const paymentResponse = await api.initiatePayment(orderResponse.id);

      return {
        order: orderResponse,
        gateway: paymentResponse
      }
    },
    onSuccess: ({ order, gateway }) => {
      handleProceedToPayment()
    },
    onError: (error) => {
      toast.add({
        type: "error", 
        title: "Failed to reserve tickets",
        description: "Please try again.",
      });
    },
  })

  const paymentCompletionMutation = useMutation({
    mutationFn: async () => {
      if (!paymentMutation.data) {
        throw new Error("No active order found to process payment.");
      }
      const { order, gateway } = paymentMutation.data;
      
      const paymentDetails = await api.simulatePayment({ orderId: order.id, gatewayOrderId: gateway.gatewayOrderId, gatewayProvider: gateway.gatewayProvider, amount: order.totalAmount, currency: gateway.currency });

      const paymentVerification = await api.verifyPayment({ orderId: order.id, gatewayOrderId: gateway.gatewayOrderId, providerPaymentId: paymentDetails.paymentId, signature: paymentDetails.signature })

      return { paymentDetails, paymentVerification };
    },
    onSuccess: () => {
      setOpenPaymentModal(false);
      toast.add({
        type: "success",
        title: "Payment Successful!",
        description: "Your passes are ready. Redirecting to My Passes...",
      });
      router.push("/tickets");
    },
    onError: (error: any) => {
      toast.add({
        type: "error",
        title: "Payment Verification Failed",
        description: error?.message || "Could not complete transaction. Please try again.",
      });
    }
  })

  const isAuthenticated = authStatus === "authenticated"

  const event: EventItem | undefined = data?.event;

  const [quantities, setQuantities] = React.useState<Record<string, number>>({});

  const tiers: TicketTier[] =
    data?.ticketTypes && data.ticketTypes.length > 0
      ? data.ticketTypes.map((t: any) => ({
          id: t.id,
          name: t.name,
          price: t.price,
          availableQuantity: t.quantity ?? 0,
          description: t.description || undefined,
        })) : [];

  const handleIncrement = (tierId: string, max: number) => {
    setQuantities((prev) => {
      const current = prev[tierId] || 0;
      if (current >= max || current >= 10) return prev; // Max 10 per order limit
      return { ...prev, [tierId]: current + 1 };
    });
  };

  const handleDecrement = (tierId: string) => {
    setQuantities((prev) => {
      const current = prev[tierId] || 0;
      if (current <= 0) return prev;
      const updated = { ...prev, [tierId]: current - 1 };
      if (updated[tierId] === 0) delete updated[tierId];
      return updated;
    });
  };

  // Calculations
  const selectedItems = tiers
    .map((tier) => ({
      ...tier,
      quantity: quantities[tier.id] || 0,
    }))
    .filter((tier) => tier.quantity > 0);

  const totalTickets = selectedItems.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = selectedItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const bookingFee = totalTickets > 0 ? 0 : 0; // Free / waived platform fee
  const grandTotal = subtotal + bookingFee;

  const handleProceedToPayment = () => {  
    setOpenPaymentModal(true)
  };

  // Format date & time
  const eventDate = event?.dateTime ? new Date(event.dateTime) : null;
  const formattedDate = eventDate
    ? eventDate.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "";
  const formattedTime = eventDate
    ? eventDate.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    : "";

  return (
    <div className="relative min-h-svh bg-background text-foreground flex flex-col">
      <Navbar />

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 sm:px-6 pt-8 sm:pt-10 pb-20">
        {/* Two-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Event Overview & Ticket Tier Selection (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Event Header Banner Card */}
            <div className="relative flex flex-col overflow-hidden rounded-3xl border border-border/80 bg-card/60 shadow-lg shadow-black/4 backdrop-blur-xl dark:border-white/8 dark:bg-card/30">
              {/* Event Poster / Banner */}
              <div className="relative aspect-16/9 w-full overflow-hidden bg-gradient-to-br from-purple-100 via-violet-50 to-muted/40 dark:from-purple-950/40 dark:via-violet-900/20 dark:to-background">
                {event?.bannerUrl ? (
                  <img
                    src={event.bannerUrl}
                    alt={event?.name || "Event Banner"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(ellipse_at_center,_rgba(168,85,247,0.25),_transparent_70%)]">
                    <div className="flex size-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary shadow-inner dark:border-white/10 dark:bg-white/5">
                      <Sparkles className="size-6 text-primary" />
                    </div>
                  </div>
                )}

                {/* Floating City Pill */}
                {event?.city && (
                  <div className="absolute top-4 left-4 flex items-center gap-1.5 rounded-full border border-black/5 bg-neutral-100/90 px-3 py-1 text-xs font-semibold text-neutral-800 shadow-md backdrop-blur-md dark:border-white/15 dark:bg-black/60 dark:text-white">
                    <MapPin className="size-3.5 text-primary" />
                    <span>{event.city}</span>
                  </div>
                )}
              </div>

              {/* Event Meta Header */}
              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <h1 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                    {event?.name}
                  </h1>

                  {/* Organizer Byline */}
                  {event?.organizerName && (
                    <div className="flex items-center gap-2 pt-0.5">
                      <div className="flex size-5 items-center justify-center rounded-full border border-border/80 bg-muted/60 text-muted-foreground shadow-sm dark:border-white/15 dark:bg-white/10">
                        <User className="size-3 text-primary" />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        Organized by{" "}
                        <span className="font-semibold text-foreground">
                          {event.organizerName}
                        </span>
                      </span>
                    </div>
                  )}
                </div>

                {/* Date & Location Pill Grid */}
                {(formattedDate || event?.venue || event?.city) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                    {formattedDate && (
                      <div className="flex items-center gap-2.5 rounded-2xl border border-border/60 bg-muted/30 p-3.5 dark:border-white/5 dark:bg-white/2">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                          <Calendar className="size-4" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-semibold text-foreground truncate">{formattedDate}</span>
                          {formattedTime && <span className="text-muted-foreground truncate">{formattedTime}</span>}
                        </div>
                      </div>
                    )}

                    {(event?.venue || event?.city) && (
                      <div className="flex items-center gap-2.5 rounded-2xl border border-border/60 bg-muted/30 p-3.5 dark:border-white/5 dark:bg-white/2">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                          <Building className="size-4" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          {event.venue && (
                            <span className="font-semibold text-foreground truncate">{event.venue}</span>
                          )}
                          {event.city && (
                            <span className="text-muted-foreground truncate">{event.city}</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Description */}
                {event?.description && (
                  <div className="pt-2 space-y-1.5 border-t border-border/40 dark:border-white/5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      About This Experience
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      {event.description}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Ticket Tier Selection Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-heading text-xl font-bold tracking-tight text-foreground">
                    Select Your Tickets
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Choose your admission tier. Maximum 10 tickets per checkout.
                  </p>
                </div>

                <Badge variant="secondary" className="text-xs font-mono">
                  {isLoading ? "Loading..." : `${tiers.length} Tiers Available`}
                </Badge>
              </div>

              {/* Tiers List */}
              <div className="space-y-3.5">
                {isLoading ? (
                  <div className="space-y-3">
                    <div className="h-28 w-full rounded-2xl border border-border/60 bg-muted/30 animate-pulse dark:border-white/5" />
                    <div className="h-28 w-full rounded-2xl border border-border/60 bg-muted/30 animate-pulse dark:border-white/5" />
                  </div>
                ) : tiers.length > 0 ? (
                  tiers.map((tier) => {
                    const qty = quantities[tier.id] || 0;
                    const isSoldOut = tier.availableQuantity <= 0;

                    return (
                      <div
                        key={tier.id}
                        className={`group relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border p-4.5 transition-all duration-200 ${
                          qty > 0
                            ? "border-primary/60 bg-primary/3 shadow-md shadow-primary/10 dark:border-primary/50 dark:bg-primary/5"
                            : "border-border/80 bg-card/60 hover:border-primary/30 dark:border-white/8 dark:bg-card/30"
                        } ${isSoldOut ? "opacity-60 cursor-not-allowed" : ""}`}
                      >
                        {/* Left Tier Meta */}
                        <div className="space-y-1 flex-1 pr-2">
                          <div className="flex items-center gap-2">
                            <h4 className="font-heading text-base font-bold text-foreground">
                              {tier.name}
                            </h4>
                          </div>

                          <div className="flex items-center gap-3 pt-1 text-xs">
                            <span className="font-extrabold text-foreground font-mono text-sm">
                              ₹{tier.price.toLocaleString("en-IN")}
                            </span>
                            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                              <Clock className="size-3 text-amber-500" />
                              {tier.availableQuantity < 10
                                ? `Only ${tier.availableQuantity} spots remaining`
                                : `${tier.availableQuantity} available`}
                            </span>
                          </div>
                        </div>

                        {/* Right: Quantity Stepper */}
                        <div className="flex items-center self-end sm:self-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            disabled={qty === 0 || isSoldOut}
                            onClick={() => handleDecrement(tier.id)}
                            className="size-8.5 rounded-xl cursor-pointer disabled:cursor-not-allowed"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="size-3.5" />
                          </Button>

                          <div className="w-9 text-center font-mono text-sm font-bold text-foreground">
                            {qty}
                          </div>

                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            disabled={qty >= tier.availableQuantity || isSoldOut}
                            onClick={() => handleIncrement(tier.id, tier.availableQuantity)}
                            className="size-8.5 rounded-xl cursor-pointer disabled:cursor-not-allowed hover:border-primary/50"
                            aria-label="Increase quantity"
                          >
                            <Plus className="size-3.5" />
                          </Button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="rounded-2xl border border-dashed border-border/80 p-8 text-center space-y-2 dark:border-white/10">
                    <Ticket className="size-8 text-muted-foreground mx-auto opacity-50" />
                    <h4 className="font-heading text-sm font-semibold text-foreground">
                      No Tickets Available Yet
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      The organizer has not released ticket tiers for this event.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary & Checkout (5 cols) */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 space-y-4">
              <div className="flex flex-col rounded-3xl border border-border/80 bg-card/60 p-6 shadow-xl shadow-black/4backdrop-blur-xl dark:border-white/8 dark:bg-card/30 space-y-5">
                <div className="flex items-center justify-between border-b border-border/50 pb-4 dark:border-white/5">
                  <div>
                    <h3 className="font-heading text-lg font-bold text-foreground">
                      Order Summary
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Review your tickets before payment
                    </p>
                  </div>
                  <Ticket className="size-5 text-primary" />
                </div>

                {/* Itemized Breakdown */}
                {selectedItems.length > 0 ? (
                  <div className="space-y-3">
                    <div className="divide-y divide-border/40 dark:divide-white/5 space-y-2">
                      {selectedItems.map((item) => (
                        <div key={item.id} className="flex items-center justify-between pt-2 text-xs">
                          <div className="flex flex-col">
                            <span className="font-semibold text-foreground">{item.name}</span>
                            <span className="text-[11px] text-muted-foreground font-mono">
                              {item.quantity} × ₹{item.price.toLocaleString("en-IN")}
                            </span>
                          </div>
                          <span className="font-mono font-bold text-foreground">
                            ₹{(item.quantity * item.price).toLocaleString("en-IN")}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Booking fee row */}
                    <div className="flex items-center justify-between pt-3 border-t border-border/40 text-xs dark:border-white/5">
                      <span className="text-muted-foreground">Convenience & Processing</span>
                      <span className="font-semibold text-emerald-500 font-mono">FREE</span>
                    </div>

                    {/* Total Amount Row */}
                    <div className="flex items-center justify-between pt-4 border-t border-border/60 text-sm dark:border-white/10">
                      <div className="flex flex-col">
                        <span className="font-bold text-foreground">Total Amount</span>
                        <span className="text-[11px] text-muted-foreground">
                          Includes all applicable taxes
                        </span>
                      </div>
                      <span className="font-mono text-2xl font-extrabold text-foreground">
                        ₹{grandTotal.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                ) : (
                  /* Empty state prompt */
                  <div className="flex flex-col items-center justify-center py-8 text-center space-y-2 border border-dashed border-border/60 rounded-2xl dark:border-white/10">
                    <Ticket className="size-8 text-muted-foreground/50" />
                    <p className="text-xs font-medium text-muted-foreground">
                      No tickets selected yet
                    </p>
                    <p className="text-[11px] text-muted-foreground/70 max-w-50">
                      Choose tier quantities on the left to proceed with checkout.
                    </p>
                  </div>
                )}

                {/* Checkout Action Button */}
                <div className="space-y-3 pt-2">
                  <Button
                    size="lg"
                    disabled={totalTickets === 0}
                    onClick={() => {
                      if (!isAuthenticated) {
                        setShowAuthModal(true);
                        return;
                      }  
                      paymentMutation.mutate()
                    }}
                    className="w-full rounded-2xl py-3.5 text-sm font-semibold shadow-md shadow-primary/25 cursor-pointer disabled:cursor-not-allowed transition-all duration-200"
                  >
                    <Lock className="size-4 mr-2" />
                    Proceed to Payment
                    <ArrowRight className="size-4 ml-auto" />
                  </Button>
                </div>
              </div>

              {/* Need Help / Assurance Box */}
              <div className="rounded-2xl border border-border/60 bg-muted/20 p-4 text-xs text-muted-foreground space-y-1 dark:border-white/5">
                <div className="flex items-center gap-1.5 font-semibold text-foreground">
                  <AlertCircle className="size-3.5 text-primary" />
                  <span>Need support with your pass?</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Tickets are permanently stored under your profile and accessible offline. Verified entry code sent immediately after payment.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Auth Gate Modal */}
      <Dialog open={showAuthModal} onOpenChange={setShowAuthModal}>
        <DialogContent className="max-w-90 sm:max-w-95 p-5 sm:p-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="size-11 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-xs">
              <Lock className="size-5" />
            </div>

            <DialogHeader className="space-y-1 text-center sm:text-center">
              <DialogTitle className="text-lg font-bold tracking-tight text-foreground">
                Log in to book
              </DialogTitle>
            </DialogHeader>

            <div className="w-full space-y-2 pt-1">
              <Button
                size="lg"
                onClick={() => router.push(`/login?redirect=/events/${eventId}`)}
                className="w-full justify-center rounded-2xl py-2.5 text-sm font-semibold shadow-md shadow-primary/25 cursor-pointer"
              >
                <LogIn className="size-4 mr-1.5" />
                Log In
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={() => router.push(`/signup?redirect=/events/${eventId}`)}
                className="w-full justify-center rounded-2xl py-2.5 text-sm font-medium border-border/80 hover:bg-muted/50 cursor-pointer"
              >
                <UserPlus className="size-4 mr-1.5" />
                Sign Up
              </Button>
            </div>

            <p className="text-[11px] text-muted-foreground/80">
              Your ticket selection will remain saved in this session.
            </p>
          </div>
        </DialogContent>
      </Dialog>
      
      <MockPaymentModal
        open={openPaymentModal}
        onOpenChange={setOpenPaymentModal}
        amount={paymentMutation.data?.order.totalAmount}
        eventName={event?.name}
        orderId={paymentMutation.data?.order.id}
        isLoading={paymentCompletionMutation.isPending}
        onConfirm={() => paymentCompletionMutation.mutate()}
      />
    </div>
  );
}
