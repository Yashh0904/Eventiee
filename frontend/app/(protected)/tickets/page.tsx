"use client";

import * as React from "react";
import Link from "next/link";
import {
  Ticket,
  Calendar,
  MapPin,
  Clock,
  QrCode,
  Copy,
  Check,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { TicketItem } from "@/types";
import { QRCodeSVG } from "qrcode.react";

export default function MyPassesPage() {
  const [filter, setFilter] = React.useState<"all" | "upcoming" | "past">("all");
  const [selectedTicket, setSelectedTicket] = React.useState<TicketItem | null>(null);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["my-tickets", filter],
    queryFn: () => api.getMyTickets(),
  });

  const tickets: TicketItem[] = data ?? [];

  const filteredTickets = React.useMemo(() => {
    return tickets.filter((t) => {
      const isPast = new Date(t.event.dateTime).getTime() < Date.now();
      if (filter === "upcoming") return !isPast && t.status === "VALID";
      if (filter === "past") return isPast || t.status === "USED";
      return true;
    });
  }, [tickets, filter]);

  const eventGroups = React.useMemo(() => {
    const map = new Map<string, { event: TicketItem["event"]; passes: TicketItem[] }>();
    for (const ticket of filteredTickets) {
      const eventId = ticket.event.id;
      if (!map.has(eventId)) {
        map.set(eventId, {
          event: ticket.event,
          passes: [],
        });
      }
      map.get(eventId)!.passes.push(ticket);
    }
    return Array.from(map.values());
  }, [filteredTickets]);

  const handleCopyCode = (text: string, id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="mx-auto w-[calc(100%-2rem)] max-w-5xl py-8 sm:py-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-8 border-b border-border/60">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-3">
            <Sparkles className="size-3.5" />
            <span>Digital Gate Passes</span>
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            My Passes
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5 max-w-xl">
            Passes are organized by event. Present your cryptographic QR pass or 6-digit gate code for entry.
          </p>
        </div>

        {/* View Tabs */}
        <div className="flex items-center gap-1.5 rounded-2xl border border-border/60 bg-muted/30 p-1 self-start sm:self-auto">
          {(["all", "upcoming", "past"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilter(tab)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold capitalize transition-all cursor-pointer ${
                filter === tab
                  ? "bg-background text-foreground shadow-xs border border-border/80"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Grouped Events & Passes List */}
      <div className="pt-8">
        {eventGroups.length > 0 ? (
          <div className="space-y-8">
            {eventGroups.map(({ event, passes }) => {
              const eventDate = new Date(event.dateTime);
              const formattedDate = eventDate.toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric",
              });
              const formattedTime = eventDate.toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              });

              return (
                <div
                  key={event.id}
                  className="overflow-hidden rounded-3xl border border-border/80 bg-card shadow-sm hover:shadow-md transition-all duration-300"
                >
                  {/* Event Group Header Bar */}
                  <div className="border-b border-border/60 bg-muted/20 p-6 sm:p-7">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge
                            variant="secondary"
                            className="font-semibold text-xs tracking-wide bg-primary/10 text-primary border border-primary/20"
                          >
                            {passes.length} {passes.length === 1 ? "Pass" : "Passes"}
                          </Badge>

                          {passes.some((p) => p.status === "VALID") && (
                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-500 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              Active Booking
                            </span>
                          )}
                        </div>

                        <h2 className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                          {event.name}
                        </h2>

                        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground pt-1">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="size-3.5 text-primary" />
                            <span className="font-medium text-foreground">{formattedDate}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="size-3.5 text-primary" />
                            <span>{formattedTime}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <MapPin className="size-3.5 text-primary" />
                            <span className="truncate max-w-[280px]">{event.venue}</span>
                          </div>
                        </div>
                      </div>

                      <Link href={`/events/${event.id}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-xl text-xs gap-1.5 border-border/80 hover:bg-muted self-start sm:self-auto cursor-pointer"
                        >
                          <span>Event Page</span>
                          <ArrowRight className="size-3" />
                        </Button>
                      </Link>
                    </div>
                  </div>

                  {/* Vertical Stack of Pass Pills */}
                  <div className="p-4 sm:p-6 space-y-2.5">
                    {passes.map((pass, index) => {
                      const isUsed = pass.status === "USED";
                      const isCancelled = pass.status === "CANCELLED";

                      return (
                        <div
                          key={pass.id}
                          onClick={() => setSelectedTicket(pass)}
                          className="group relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 rounded-2xl border border-border/70 bg-background/80 hover:bg-muted/40 p-4 transition-all duration-200 hover:border-primary/40 hover:shadow-md cursor-pointer"
                        >
                          {/* Left: Pass # & Tier (Fixed width so gate codes align vertically) */}
                          <div className="flex items-center gap-3 sm:w-64 md:w-72 sm:shrink-0">
                            <span className="flex size-7 items-center justify-center rounded-xl bg-primary/10 text-primary text-xs font-bold shrink-0">
                              #{index + 1}
                            </span>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <h3
                                  className="font-heading text-sm font-bold text-foreground group-hover:text-primary transition-colors truncate"
                                  title={pass.ticketType.name}
                                >
                                  {pass.ticketType.name}
                                </h3>
                                <span className="text-xs text-muted-foreground font-mono shrink-0">
                                  ₹{pass.ticketType.price.toLocaleString("en-IN")}
                                </span>
                              </div>
                              <span className="text-[11px] text-muted-foreground/75 font-mono block truncate">
                                ID: {pass.id.slice(0, 12)}...
                              </span>
                            </div>
                          </div>

                          {/* Center: Gate Entry Code (Always vertically aligned) */}
                          <div className="flex items-center gap-2 self-start sm:self-auto bg-muted/40 px-3 py-1.5 rounded-xl border border-border/60 shrink-0">
                            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                              Code:
                            </span>
                            <span className="font-mono text-sm font-black tracking-widest text-foreground">
                              #{pass.shortId}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => handleCopyCode(pass.shortId.toString(), pass.id, e)}
                              className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-background transition-colors cursor-pointer"
                              title="Copy code"
                            >
                              {copiedId === pass.id ? (
                                <Check className="size-3.5 text-emerald-500" />
                              ) : (
                                <Copy className="size-3.5" />
                              )}
                            </button>
                          </div>

                          {/* Right: Status & Action Button */}
                          <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-border/40">
                            <span
                              className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                                pass.status === "VALID"
                                  ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20 flex items-center gap-1.5"
                                  : isUsed
                                  ? "text-muted-foreground bg-muted border-border"
                                  : "text-destructive bg-destructive/10 border-destructive/20"
                              }`}
                            >
                              {pass.status === "VALID" && <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                              {pass.status === "VALID" ? "Valid Entry" : isUsed ? "Checked In" : "Cancelled"}
                            </span>

                            <div className="flex items-center gap-1.5 text-xs font-medium text-primary group-hover:translate-x-0.5 transition-transform">
                              <QrCode className="size-4" />
                              <span className="hidden sm:inline">View Pass</span>
                              <ArrowRight className="size-3.5" />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-3xl border border-dashed border-border/80 bg-muted/10 space-y-4">
            <div className="flex size-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary shadow-xs">
              <Ticket className="size-7" />
            </div>
            <div className="space-y-1">
              <h3 className="font-heading text-lg font-bold text-foreground">
                No tickets found
              </h3>
              <p className="text-xs text-muted-foreground max-w-sm">
                {filter === "all"
                  ? "You haven't reserved or purchased any event passes yet."
                  : `No ${filter} passes found under your account.`}
              </p>
            </div>
            <Link href="/">
              <Button
                size="lg"
                className="rounded-2xl text-xs font-semibold shadow-md shadow-primary/20 mt-2 cursor-pointer"
              >
                Explore Live Events
                <ArrowRight className="size-3.5 ml-1.5" />
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Expanded Ticket Check-In Modal */}
      {selectedTicket && (
        <Dialog open={Boolean(selectedTicket)} onOpenChange={(open) => !open && setSelectedTicket(null)}>
          <DialogContent className="max-w-95 sm:max-w-100 p-0 overflow-hidden rounded-3xl border border-border/80 bg-background/95 shadow-2xl backdrop-blur-2xl">
            {/* Header */}
            <div className="border-b border-border/60 bg-muted/30 pl-6 pr-14 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex size-7 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
                  <ShieldCheck className="size-4" />
                </div>
                <DialogTitle className="text-sm font-bold text-foreground">
                  Gate Entry Pass
                </DialogTitle>
                <Badge
                  variant="secondary"
                  className={`text-[10px] font-bold uppercase tracking-wider ${
                    selectedTicket.status === "VALID"
                      ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                      : "bg-muted text-muted-foreground border border-border"
                  }`}
                >
                  {selectedTicket.status === "VALID" ? "Active" : selectedTicket.status}
                </Badge>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 flex flex-col items-center text-center space-y-5">
              <div>
                <h3 className="font-heading text-lg font-bold text-foreground">
                  {selectedTicket.event.name}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {selectedTicket.ticketType.name} Pass • {selectedTicket.event.venue}
                </p>
              </div>

              {/* Large Centered Scannable QR Code */}
              <div className="rounded-3xl bg-white p-4 shadow-xl border border-border/40 size-56 flex items-center justify-center">
                <QRCodeSVG
                  value={selectedTicket.qrToken} // or `https://eventiee.com/gate/checkin?token=${ticket.qrToken}`
                  size={160}
                  level="H" 
                />
              </div>

              {/* Monospaced Entry Code */}
              <div className="w-full rounded-2xl border border-border/60 bg-muted/30 p-3.5 flex items-center justify-between">
                <div className="text-left">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                    Fast Check-in Code
                  </span>
                  <span className="font-mono text-xl font-black tracking-widest text-foreground">
                    #{selectedTicket.shortId}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={(e) => handleCopyCode(selectedTicket.shortId.toString(), "modal", e)}
                  className="px-3 py-1.5 rounded-xl border border-border/60 bg-background hover:bg-muted text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  {copiedId === "modal" ? (
                    <>
                      <Check className="size-3.5 text-emerald-500" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="size-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Scan this screen at the gate entrance.
              </p>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
