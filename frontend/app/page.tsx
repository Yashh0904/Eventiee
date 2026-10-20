"use client";

import * as React from "react";
import { Navbar } from "@/components/layout/navbar";
import { EventCard } from "@/components/events/EventCard";
import { EventCardSkeleton } from "@/components/events/EventCardSkeleton";
import { EventDetailsModal } from "@/components/events/EventDetailsModal";
import { api, type EventItem } from "@/lib/api";
import { Search, CalendarX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { toast } from "@/components/ui/toast";

export default function HomePage() {
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [selectedEvent, setSelectedEvent] = React.useState<EventItem | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = React.useState(false);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["events"],
    queryFn: () => api.getEvents(),
  });

  React.useEffect(() => {
    if (isError) {
      toast.add({
        type: "error",
        title: "Failed to load events",
        description: error?.message || "Could not fetch events from the server.",
      });
    }
  }, [isError, error]);

  const handleInspectEvent = (event: EventItem) => {
    setSelectedEvent(event);
    setIsDetailsOpen(true);
  };

  const events = data?.events ?? [];

  return (
    <div className="relative flex min-h-svh flex-col bg-transparent text-foreground">
      <Navbar />

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pt-10 pb-20 sm:px-6">
        {/* Section Header: Discover Events */}
        <section className="mb-6 space-y-2">
          <h1 className="font-heading text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
            Discover Events
          </h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            Explore live music, tech conferences, underground nightlife, and curated gatherings.
          </p>
        </section>

        {/* Compact Search Toolbar */}
        <section className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full max-w-md">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search events, venues, or cities..."
              className="h-10 w-full rounded-xl border border-border/80 bg-card/60 pl-9.5 pr-8 text-sm text-foreground backdrop-blur-xl transition-all placeholder:text-muted-foreground/60 hover:border-primary/40 focus:border-primary focus:bg-card/90 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Clear
              </button>
            )}
          </div>

          <div className="text-xs font-medium text-muted-foreground">
            Showing <span className="font-bold text-foreground">{isLoading ? "..." : events.length}</span> events
          </div>
        </section>

        {/* Event List Grid */}
        <section>
          {isLoading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <EventCardSkeleton key={i} />
              ))}
            </div>
          ) : events.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onClick={() => handleInspectEvent(event)}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/60 bg-card/20 px-6 py-16 text-center backdrop-blur-sm">
              <div className="flex size-14 items-center justify-center rounded-2xl border border-border/60 bg-muted/30 text-muted-foreground">
                <CalendarX className="size-7" />
              </div>
              <h3 className="mt-4 font-heading text-lg font-bold text-foreground">
                No events found
              </h3>
              <p className="mt-1.5 max-w-sm text-xs text-muted-foreground">
                We couldn't find any events matching your search criteria.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSearchQuery("")}
                className="mt-5 text-xs font-semibold"
              >
                Clear search
              </Button>
            </div>
          )}
        </section>

        {/* Event Details Inspection Modal */}
        <EventDetailsModal
          event={selectedEvent}
          open={isDetailsOpen}
          onOpenChange={setIsDetailsOpen}
        />
      </main>
    </div>
  );
}
