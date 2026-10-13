"use client";

import * as React from "react";
import Link from "next/link";
import { useAuthStore } from "@/lib/store/auth-store";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Sparkles,
  Ticket,
  CalendarDays,
  ShieldCheck,
  Zap,
  ArrowRight,
  LogOut,
  User as UserIcon,
} from "lucide-react";

export default function HomePage() {
  const { user, isAuthenticated, clearAuth } = useAuthStore();
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch {
      // ignore
    } finally {
      clearAuth();
    }
  };

  return (
    <div className="relative flex min-h-svh flex-col">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/2 -z-10 h-[550px] w-[700px] -translate-x-1/2 rounded-full bg-primary/10 blur-[140px] dark:bg-primary/20" />
      </div>

      {/* Navigation */}
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-8">
          <Link href="/" className="flex items-center gap-2.5 font-heading text-xl font-bold tracking-tight">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/25">
              <Sparkles className="size-4.5" />
            </div>
            <span>Eventiee</span>
          </Link>

          <nav className="flex items-center gap-2.5">
            {isMounted && isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 rounded-2xl border border-border/60 bg-muted/30 px-3 py-1.5">
                  <UserIcon className="size-4 text-muted-foreground" />
                  <span className="text-xs font-semibold text-foreground">
                    {user.name}
                  </span>
                  <Badge variant="secondary" className="text-[10px] uppercase">
                    {user.role}
                  </Badge>
                </div>
                <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground hover:text-foreground">
                  <LogOut className="mr-1.5 size-3.5" />
                  Logout
                </Button>
              </div>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Sign in
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm" className="shadow-sm shadow-primary/20">
                    Sign up
                  </Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto flex flex-1 flex-col items-center justify-center px-4 py-16 text-center sm:px-8">
        <Badge variant="secondary" className="mb-4 gap-1.5 px-3 py-1 text-xs">
          <Sparkles className="size-3.5 text-primary" />
          Production-Ready Event Management
        </Badge>

        <h1 className="max-w-3xl font-heading text-4xl font-extrabold tracking-tight sm:text-6xl">
          Discover incredible events,{" "}
          <span className="bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
            instant digital ticketing.
          </span>
        </h1>

        <p className="mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
          Experience seamless event booking with atomic ticket reservations,
          crypto-secure QR check-ins, and lightning-fast gate management.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
          {isMounted && isAuthenticated ? (
            <div className="flex flex-wrap gap-3">
              <Button size="lg" className="shadow-lg shadow-primary/25">
                <Ticket className="mr-2 size-4" />
                Browse Events
              </Button>
              {user?.role === "ORGANIZER" && (
                <Button size="lg" variant="outline">
                  <CalendarDays className="mr-2 size-4" />
                  Organizer Dashboard
                </Button>
              )}
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              <Link href="/signup">
                <Button size="lg" className="shadow-lg shadow-primary/25">
                  Get Started
                  <ArrowRight className="ml-2 size-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline">
                  Sign in
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Feature Grid */}
        <div className="mt-20 grid w-full max-w-4xl grid-cols-1 gap-4 text-left sm:grid-cols-3">
          <Card className="border-border/60 bg-card/60 backdrop-blur-sm">
            <CardHeader className="space-y-1.5">
              <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Zap className="size-4.5" />
              </div>
              <CardTitle className="text-base font-semibold">
                Atomic Inventory
              </CardTitle>
              <CardDescription className="text-xs leading-relaxed">
                Transactional ticket booking prevents race conditions, double-selling, and overselling.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-border/60 bg-card/60 backdrop-blur-sm">
            <CardHeader className="space-y-1.5">
              <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <ShieldCheck className="size-4.5" />
              </div>
              <CardTitle className="text-base font-semibold">
                Live QR Verification
              </CardTitle>
              <CardDescription className="text-xs leading-relaxed">
                Instant gate check-in with tamper-proof cryptographic tokens and shortId fallback codes.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-border/60 bg-card/60 backdrop-blur-sm">
            <CardHeader className="space-y-1.5">
              <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Ticket className="size-4.5" />
              </div>
              <CardTitle className="text-base font-semibold">
                Live Pass Wallet
              </CardTitle>
              <CardDescription className="text-xs leading-relaxed">
                Auto-surfacing active passes on event day with real-time wristband and tier metadata.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-6 text-center text-xs text-muted-foreground">
        Eventiee &copy; {new Date().getFullYear()} &middot; Built with Express, Drizzle ORM, Next.js, and Shadcn Base UI
      </footer>
    </div>
  );
}
