"use client";

import * as React from "react";
import Link from "next/link";
import { useAuthStore } from "@/lib/store/auth-store";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Ticket,
  PlusCircle,
  Compass,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "cn";

export function Navbar() {
  const { user, authStatus, clearAuth } = useAuthStore();
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const router = useRouter();
  const pathname = usePathname();
  
  const isAuthenticated = authStatus === "authenticated"
  const isExploreActive = pathname === "/";
  const isPassesActive = pathname.startsWith("/tickets");
  const isCreateActive = pathname.startsWith("/organizer");

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch {
      // Ignore network errors on logout
    } finally {
      clearAuth();
      router.replace('/');
    }
  };

  const userInitial = user?.name ? user.name.trim().charAt(0).toUpperCase() : "U";

  return (
    <header className="sticky top-3 sm:top-4 z-50 mx-auto w-[calc(100%-2rem)] max-w-6xl transition-all duration-300">
      <div className="flex h-14 sm:h-16 items-center justify-between rounded-full border border-white/10 bg-white/2),0_8px_32px_rgba(0,0,0,0.12)] backdrop-blur-2xl transition-all dark:border-white/8 dark:bg-purple-900/6">
        {/* Brand Logo */}
        <Link
          href="/"
          className="group flex items-center gap-2.5 transition-transform hover:scale-102"
        >
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/25 transition-transform group-hover:rotate-6">
            <Sparkles className="size-4.5" />
          </div>
          <span className="font-heading text-xl font-bold tracking-tight text-foreground">
            Eventiee
          </span>
        </Link>

        {/* Center / Navigation Links */}
        <nav className="hidden items-center gap-8 sm:gap-9 text-sm font-medium md:flex">
          <Link
            href="/"
            className={cn(
              "flex items-center gap-2 transition-colors hover:text-foreground",
              isExploreActive ? "text-foreground font-semibold" : "text-muted-foreground"
            )}
          >
            <Compass className="size-4 text-primary" />
            <span>Explore Events</span>
          </Link>
          {isMounted && isAuthenticated && (
            <>
              <Link
                href="/tickets"
                className={cn(
                  "flex items-center gap-2 transition-colors hover:text-foreground",
                  isPassesActive ? "text-foreground font-semibold" : "text-muted-foreground"
                )}
              >
                <Ticket className="size-4 text-primary" />
                <span>My Passes</span>
              </Link>
              <Link
                href="/organizer/events/new"
                className={cn(
                  "flex items-center gap-2 transition-colors hover:text-foreground",
                  isCreateActive ? "text-foreground font-semibold" : "text-muted-foreground"
                )}
              >
                <PlusCircle className="size-4 text-primary" />
                <span>Create Event</span>
              </Link>
            </>
          )}
        </nav>

        {/* Right Auth / Action Controls */}
        <div className="flex items-center gap-4">
          {isMounted && isAuthenticated && user ? (
            <div className="flex items-center">
              {/* Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger
                  aria-label="User account menu"
                  className="rounded-full outline-none transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-primary/40 cursor-pointer"
                >
                  <Avatar className="size-9 border border-border/80 bg-primary/10 text-primary shadow-sm dark:border-purple-300/30 dark:bg-purple-200 dark:text-purple-950">
                    {user?.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user?.name} />}
                    <AvatarFallback className="text-xs font-bold bg-primary/15 text-primary dark:bg-purple-200 dark:text-purple-950">
                      {userInitial}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="end"
                  sideOffset={8}
                  className="w-56 rounded-2xl border border-border/80 bg-popover/95 p-1.5 text-popover-foreground shadow-2xl backdrop-blur-2xl"
                >
                  {/* User Profile Header with Avatar */}
                  <div className="flex items-center gap-3 p-2.5">
                    <Avatar className="size-9 shrink-0 border border-border/60 bg-primary/10 text-primary dark:border-purple-300/30 dark:bg-purple-200 dark:text-purple-950">
                      {user?.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user?.name} />}
                      <AvatarFallback className="text-xs font-bold bg-primary/15 text-primary dark:bg-purple-200 dark:text-purple-950">
                        {userInitial}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-semibold text-foreground truncate leading-tight">
                        {user.name}
                      </span>
                      <span className="text-xs text-muted-foreground truncate leading-snug mt-0.5">
                        {user.email}
                      </span>
                    </div>
                  </div>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={() => router.push("/profile")}
                    className="rounded-xl px-3 py-2 text-sm font-medium text-foreground/80 hover:text-foreground cursor-pointer transition-colors"
                  >
                    View Profile
                  </DropdownMenuItem>


                  <DropdownMenuItem
                    onClick={() => router.push("/organizer/events")}
                    className="rounded-xl px-3 py-2 text-sm font-medium text-foreground/80 hover:text-foreground cursor-pointer transition-colors"
                  >
                    Manage Events
                  </DropdownMenuItem>

                  <DropdownMenuItem className="rounded-xl px-3 py-2 text-sm font-medium text-foreground/80 hover:text-foreground cursor-pointer transition-colors">
                    Settings
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="rounded-xl px-3 py-2 text-sm font-medium text-foreground/80 hover:text-destructive focus:text-destructive data-highlighted:text-destructive cursor-pointer transition-colors"
                  >
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-xs font-medium">
                  Sign in
                </Button>
              </Link>
              <Link href="/signup">
                <Button
                  size="sm"
                  className="rounded-xl text-xs font-semibold shadow-md shadow-primary/20"
                >
                  Get Started
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
