"use client";

import * as React from "react";
import { type EventItem } from "@/lib/api";
import { Calendar, MapPin, Sparkles, ArrowRight } from "lucide-react";

interface EventCardProps {
  event: EventItem;
  onClick?: () => void;
}

export function EventCard({ event, onClick }: EventCardProps) {
  const eventDate = React.useMemo(() => {
    try {
      return new Date(event.dateTime);
    } catch {
      return new Date();
    }
  }, [event.dateTime]);

  const month = eventDate.toLocaleString("en-US", { month: "short" }).toUpperCase();
  const day = eventDate.getDate();
  const formattedTime = eventDate.toLocaleString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.();
        }
      }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/80 bg-card/60 shadow-md shadow-black/[0.05] backdrop-blur-sm text-left cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:bg-card/80 hover:shadow-xl hover:shadow-primary/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 dark:border-white/[0.08] dark:bg-card/30 dark:shadow-[0_8px_25px_rgba(0,0,0,0.35)] dark:hover:shadow-primary/15"
    >
      {/* Banner / Poster Image Container */}
      <div className="relative aspect-16/9 w-full overflow-hidden bg-gradient-to-br from-purple-100 via-violet-50 to-muted/40 dark:from-purple-950/40 dark:via-violet-900/20 dark:to-background">
        {event.bannerUrl ? (
          <img
            src={event.bannerUrl}
            alt={event.name}
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(ellipse_at_center,_rgba(168,85,247,0.25),_transparent_70%)]">
            <div className="flex size-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary shadow-inner dark:border-white/10 dark:bg-white/5">
              <Sparkles className="size-6 text-primary/80 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" />
            </div>
          </div>
        )}

        {/* Floating Date Badge */}
        <div className="absolute top-3 left-3 flex flex-col items-center justify-center rounded-xl border border-black/5 bg-neutral-100/90 px-2.5 py-1 shadow-md backdrop-blur-md dark:border-white/15 dark:bg-black/60">
          <span className="text-[10px] font-bold tracking-wider text-primary"
          suppressHydrationWarning>
            {month}
          </span>
          <span className="text-sm font-extrabold leading-tight text-neutral-900 dark:text-white"
          suppressHydrationWarning>
            {day}
          </span>
        </div>

        {/* Floating City Pill */}
        <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full border border-black/5 bg-neutral-100/90 px-2.5 py-1 text-[11px] font-medium text-neutral-800 shadow-md backdrop-blur-md dark:border-white/15 dark:bg-black/60 dark:text-white/90">
          <MapPin className="size-3 text-primary" />
          <span>{event.city}</span>
        </div>
      </div>

      {/* Card Body */}
      <div className="flex flex-1 flex-col justify-between p-5">
        <div className="space-y-2">
          {/* Title */}
          <h3 className="font-heading text-lg font-bold tracking-tight text-foreground transition-colors group-hover:text-primary">
            {event.name}
          </h3>

          {/* Venue & Time Meta */}
          <div className="space-y-1 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5 truncate">
              <MapPin className="size-3.5 shrink-0 text-primary/70" />
              <span className="truncate">{event.venue}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="size-3.5 shrink-0 text-primary/70" />
              <span suppressHydrationWarning>{formattedTime}</span>
            </div>
          </div>

          {/* Description Preview */}
          {event.description && (
            <p className="line-clamp-2 pt-1 text-xs text-muted-foreground/80 leading-relaxed">
              {event.description}
            </p>
          )}
        </div>

        {/* Card Footer: Right-aligned 'View event ->' with plain arrow */}
        <div className="mt-5 flex items-center justify-end border-t border-border/30 pt-3 text-xs">
          <div className="inline-flex items-center gap-1.5 font-medium text-muted-foreground transition-colors group-hover:text-primary">
            <span>View event</span>
            <ArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-1" />
          </div>
        </div>
      </div>
    </div>
  );
}
