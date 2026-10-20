import Link from "next/link";
import { Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background/50 py-10 backdrop-blur-sm">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 text-center sm:flex-row sm:px-8 sm:text-left">
        <div className="flex items-center gap-2">
          <div className="flex size-6 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm shadow-primary/20">
            <Sparkles className="size-3" />
          </div>
          <span className="font-heading text-sm font-semibold tracking-tight text-foreground">
            Eventiee
          </span>
          <span className="text-xs text-muted-foreground">
            &middot; Live Passes & Ticketing Platform
          </span>
        </div>

        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Eventiee. Built with Express, Drizzle ORM, Next.js, and Base UI.
        </p>
      </div>
    </footer>
  );
}
