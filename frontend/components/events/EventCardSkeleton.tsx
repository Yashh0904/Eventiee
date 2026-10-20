import * as React from "react";

export function EventCardSkeleton() {
  return (
    <div className="relative flex flex-col overflow-hidden rounded-2xl border border-border/80 bg-card/50 shadow-md backdrop-blur-sm">
      {/* Banner / Poster Placeholder */}
      <div className="relative aspect-16/9 w-full overflow-hidden bg-muted/40">
        {/* Floating Date Badge Placeholder */}
        <div className="absolute top-3 left-3 h-12 w-11 rounded-xl border border-border/40 bg-card/60 backdrop-blur-md" />

        {/* Floating City Pill Placeholder */}
        <div className="absolute top-3 right-3 h-6 w-18 rounded-full border border-border/40 bg-card/60 backdrop-blur-md" />
      </div>

      {/* Card Body */}
      <div className="flex flex-1 flex-col justify-between p-5 space-y-4">
        <div className="space-y-3">
          {/* Title Placeholder */}
          <div className="h-5 w-3/4 rounded-lg bg-muted/70" />

          {/* Venue & Time Meta */}
          <div className="space-y-2 pt-1">
            <div className="h-3.5 w-3/5 rounded-md bg-muted/50" />
            <div className="h-3.5 w-2/5 rounded-md bg-muted/50" />
          </div>

          {/* Description Lines */}
          <div className="space-y-1.5 pt-2">
            <div className="h-3 w-full rounded bg-muted/40" />
            <div className="h-3 w-4/5 rounded bg-muted/40" />
          </div>
        </div>

        {/* Card Footer */}
        <div className="mt-5 flex items-center justify-end border-t border-border/30 pt-3">
          <div className="h-4 w-20 rounded bg-muted/50" />
        </div>
      </div>

      {/* Full Card Shimmer Wave */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent dark:via-white/[0.05]"
      />
    </div>
  );
}
