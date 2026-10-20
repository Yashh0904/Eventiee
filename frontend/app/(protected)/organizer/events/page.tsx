"use client";

import * as React from "react";
import Link from "next/link";
import {
  Sparkles,
  Calendar,
  MapPin,
  Building,
  Plus,
  QrCode,
  Search,
  ExternalLink,
  CalendarDays,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EventCardSkeleton } from "@/components/events/EventCardSkeleton";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "@/components/ui/toast";

export default function OrganizerEventsPage() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filterTab, setFilterTab] = React.useState<"all" | "upcoming" | "past">("all");

  const { data, error, isError, isLoading } = useQuery({
    queryKey: ["myEvents"],
    queryFn: api.getMyEvents,
  });

  React.useEffect(() => {
    if (isError) {
      toast.add({
        type: "error",
        title: "Failed to load hosted events",
        description: error?.message || "Could not retrieve your events. Please try again.",
      });
    }
  }, [isError, error]);

  const events = data?.events ?? [];

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.venue.toLowerCase().includes(searchQuery.toLowerCase());

    const eventDate = new Date(event.dateTime);
    const isPast = !isNaN(eventDate.getTime()) && eventDate.getTime() < Date.now();

    if (filterTab === "upcoming") {
      return matchesSearch && !isPast;
    }
    if (filterTab === "past") {
      return matchesSearch && isPast;
    }
    return matchesSearch;
  });

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 pt-6 sm:pt-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Hosted Events
          </h1>
          <p className="text-sm text-muted-foreground max-w-xl">
            Monitor attendee capacity, manage ticket tiers, and launch QR check-ins for your active events.
          </p>
        </div>

        <Link href="/organizer/events/new">
          <Button size="sm" className="rounded-xl text-xs font-semibold shadow-md shadow-primary/25 cursor-pointer">
            <Plus className="size-3.5 mr-1.5" />
            Create Event
          </Button>
        </Link>
      </div>

      {/* Search & Tabs Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search hosted events or cities..."
            className="h-10 pl-9 text-xs rounded-xl"
          />
        </div>

        <div className="flex items-center gap-1 rounded-xl border border-border/70 bg-card/40 p-1 backdrop-blur-sm self-start dark:border-white/10 dark:bg-card/20">
          {(["all", "upcoming", "past"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterTab(tab)}
              className={`rounded-lg px-3 py-1 text-xs font-medium capitalize transition-all cursor-pointer ${
                filterTab === tab
                  ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Events Listing */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <EventCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {filteredEvents.map((event) => {
            const eventDate = new Date(event.dateTime);
            const isPast = !isNaN(eventDate.getTime()) && eventDate.getTime() < Date.now();
            const formattedDate = isNaN(eventDate.getTime())
              ? "Date TBA"
              : eventDate.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                });
            const formattedTime = isNaN(eventDate.getTime())
              ? "Time TBA"
              : eventDate.toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                });
            const status = (event as any).status || (isPast ? "Past" : "Active");

            return (
              <div
                key={event.id}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/80 bg-card/60 shadow-md backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10 dark:border-white/[0.08] dark:bg-card/30"
              >
                {/* Event Top Banner */}
                <div className="relative aspect-16/9 w-full overflow-hidden bg-gradient-to-br from-purple-100 via-violet-50 to-muted/40 dark:from-purple-950/40 dark:via-violet-900/20 dark:to-background">
                  {event.bannerUrl ? (
                    <img
                      src={event.bannerUrl}
                      alt={event.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(ellipse_at_center,_rgba(168,85,247,0.25),_transparent_70%)]">
                      <div className="flex size-12 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary shadow-inner dark:border-white/10 dark:bg-white/5">
                        <Sparkles className="size-5 text-primary/80" />
                      </div>
                    </div>
                  )}

                  {/* Status Tag */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full border border-black/5 bg-neutral-100/90 px-2.5 py-1 text-[11px] font-semibold text-neutral-800 shadow-md backdrop-blur-md dark:border-white/15 dark:bg-black/60 dark:text-white">
                    <span
                      className={`size-1.5 rounded-full ${
                        isPast ? "bg-amber-500" : "bg-emerald-500 animate-pulse"
                      }`}
                    />
                    <span className="capitalize">{status}</span>
                  </div>

                  {/* City Pill */}
                  <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full border border-black/5 bg-neutral-100/90 px-2.5 py-1 text-[11px] font-medium text-neutral-800 shadow-md backdrop-blur-md dark:border-white/15 dark:bg-black/60 dark:text-white">
                    <MapPin className="size-3 text-primary" />
                    <span>{event.city}</span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="flex flex-1 flex-col justify-between p-4.5 sm:p-5 space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-heading text-base sm:text-lg font-bold tracking-tight text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                      {event.name}
                    </h3>

                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5 truncate">
                        <Building className="size-3.5 text-primary/70 shrink-0" />
                        <span className="truncate">{event.venue}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="size-3.5 text-primary/70 shrink-0" />
                        <span>
                          {formattedDate} • {formattedTime}
                        </span>
                      </div>
                    </div>

                    {event.description && (
                      <p className="line-clamp-2 pt-1 text-xs text-muted-foreground/80 leading-relaxed">
                        {event.description}
                      </p>
                    )}
                  </div>

                  {/* Organizer Action Toolbar */}
                  <div className="flex items-center gap-2 pt-2 border-t border-border/50 dark:border-white/5">
                    {/* Launch Check-in Scanner Button */}
                    <Button
                      size="sm"
                      className="flex-1 rounded-xl text-xs font-semibold shadow-sm shadow-primary/25 cursor-pointer"
                    >
                      <QrCode className="size-3.5 mr-1.5" />
                      Launch Check-in
                    </Button>

                    {/* View Public Page Link */}
                    <Link href={`/?search=${encodeURIComponent(event.name)}`}>
                      <Button
                        variant="outline"
                        size="icon"
                        className="size-8.5 rounded-xl text-muted-foreground hover:text-foreground cursor-pointer"
                        title="View Public Listing"
                      >
                        <ExternalLink className="size-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 p-12 text-center space-y-4 dark:border-white/10">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner">
            <CalendarDays className="size-7" />
          </div>
          <div className="space-y-1">
            <h3 className="font-heading text-lg font-bold text-foreground">
              No events found
            </h3>
          </div>
        </div>
      )}
    </div>
  );
}
