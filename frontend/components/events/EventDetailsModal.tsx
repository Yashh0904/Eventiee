"use client";

import Link from "next/link";
import { type EventItem } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar, MapPin, Sparkles, ArrowRight, Building, User } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EventDetailsModalProps {
  event: EventItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EventDetailsModal({
  event,
  open,
  onOpenChange,
}: EventDetailsModalProps) {
  if (!event) return null;

  const eventDate = new Date(event.dateTime);
  const formattedDate = eventDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const formattedTime = eventDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        position="right"
        className="p-0 border border-border/70 bg-background/95 shadow-2xl shadow-black/10 backdrop-blur-3xl"
      >
        {/* Top Banner Visual Header (Fixed at top of floating card) */}
        <div className="relative aspect-16/9 w-full shrink-0 overflow-hidden bg-gradient-to-br from-purple-100 via-violet-50 to-muted/40 dark:from-purple-950/60 dark:via-violet-900/30 dark:to-background">
          {event.bannerUrl ? (
            <img
              src={event.bannerUrl}
              alt={event.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(ellipse_at_center,_rgba(168,85,247,0.3),_transparent_75%)]">
              <div className="flex size-16 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary shadow-inner dark:border-white/10 dark:bg-white/5">
                <Sparkles className="size-8 text-primary" />
              </div>
            </div>
          )}

          {/* Floating City Tag */}
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-full border border-white/20 bg-black/65 px-3 py-1 text-xs font-semibold text-white shadow-lg backdrop-blur-md">
              <MapPin className="size-3.5 text-primary" />
              <span>{event.city}</span>
            </div>
          </div>
        </div>

        {/* Scrollable Middle Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
          <DialogHeader className="space-y-3">
            <DialogTitle className="font-heading text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
              {event.name}
            </DialogTitle>

            {/* Organizer Byline with Avatar Icon */}
            <div className="flex items-center gap-2 pt-0.5">
              <div className="flex size-5 items-center justify-center rounded-full border border-border/80 bg-muted/60 text-muted-foreground shadow-sm dark:border-white/15 dark:bg-white/10">
                <User className="size-3 text-primary" />
              </div>
              <span className="text-xs text-muted-foreground">
                Organized by{" "}
                <span className="font-semibold text-foreground">
                  {event.organizerName || "Event Host"}
                </span>
              </span>
            </div>

            {/* Quick Meta: Side-by-side with only a vertical dividing border between them */}
            <div className="grid grid-cols-2 text-xs divide-x divide-border dark:divide-white/10 pt-2 pb-1">
              <div className="flex items-start gap-2.5 pr-4 min-w-0">
                <Calendar className="size-4 shrink-0 text-primary mt-0.5" />
                <div className="flex flex-col min-w-0">
                  <span className="font-semibold text-foreground truncate">{formattedDate}</span>
                  <span className="text-muted-foreground truncate">{formattedTime}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 pl-4 min-w-0">
                <Building className="size-4 shrink-0 text-primary mt-0.5" />
                <div className="flex flex-col min-w-0">
                  <span className="font-semibold text-foreground truncate">{event.venue}</span>
                  <span className="text-muted-foreground truncate">{event.city}</span>
                </div>
              </div>
            </div>
          </DialogHeader>

          {/* Event Description */}
          <div className="space-y-2 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              About This Event
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {event.description || "No description provided for this event."}
            </p>
          </div>
        </div>

        {/* Pinned Bottom Footer Action */}
        <div className="shrink-0 p-5 border-t border-border/60 bg-background/95 backdrop-blur-xl flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              Admission
            </span>
            <span className="text-sm font-bold text-foreground">
              Tickets available
            </span>
          </div>

          <Link href={`/events/${event.id}`}>
            <Button
              size="lg"
              className="rounded-xl px-6 py-2.5 text-sm font-semibold shadow-lg shadow-primary/25 transition-transform hover:scale-102"
            >
              Book Tickets
              <ArrowRight className="ml-2 size-4" />
            </Button>
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}
