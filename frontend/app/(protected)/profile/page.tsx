"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User as UserIcon,
  Mail,
  ShieldCheck,
  Ticket,
  Calendar,
  Check,
  Copy,
  LogOut,
  ExternalLink,
  Save,
  RefreshCw,
} from "lucide-react";
import { useAuthStore } from "@/lib/store/auth-store";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/components/ui/toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const AVATAR_PRESETS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=250&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=250&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=250&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=250&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=250&auto=format&fit=crop&q=80",
];

export default function ProfilePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user: authUser, updateUser, clearAuth } = useAuthStore();

  const { data: profileData, isLoading: isFetchingProfile } = useQuery({
    queryKey: ["user-profile"],
    queryFn: () => api.getMe(),
    initialData: authUser ? { user: authUser } : undefined,
  });

  const currentUser = profileData?.user ?? authUser;

  const [name, setName] = React.useState(currentUser?.name ?? "");
  const [avatarUrl, setAvatarUrl] = React.useState(currentUser?.avatarUrl ?? "");
  const [copiedId, setCopiedId] = React.useState(false);

  // Synchronize initial state when server data is loaded
  React.useEffect(() => {
    if (currentUser) {
      setName(currentUser.name ?? "");
      setAvatarUrl(currentUser.avatarUrl ?? "");
    }
  }, [currentUser]);

  const isDirty =
    name.trim() !== (currentUser?.name ?? "") ||
    (avatarUrl.trim() || "") !== (currentUser?.avatarUrl ?? "");

  const updateMutation = useMutation({
    mutationFn: (payload: { name?: string; avatarUrl?: string | null }) =>
      api.updateProfile(payload),
    onSuccess: (data) => {
      updateUser(data.user);
      queryClient.setQueryData(["user-profile"], { user: data.user });
      toast.add({
        title: "Profile updated",
        description: "Your details have been successfully saved.",
        type: "success",
      });
    },
    onError: (error: any) => {
      toast.add({
        title: "Update failed",
        description: error.message || "Could not update profile",
        type: "error",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.add({
        title: "Name required",
        description: "Your name cannot be empty.",
        type: "error",
      });
      return;
    }

    updateMutation.mutate({
      name: name.trim(),
      avatarUrl: avatarUrl.trim() ? avatarUrl.trim() : null,
    });
  };

  const handleCopyId = () => {
    if (!currentUser?.id) return;
    navigator.clipboard.writeText(currentUser.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch {
      // Ignore network errors on logout
    } finally {
      clearAuth();
      router.replace("/");
    }
  };

  const userInitial = (name || currentUser?.name || "U").trim().charAt(0).toUpperCase();

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pt-8 pb-16">
      {/* Ambient background glow */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 size-96 rounded-full bg-primary/10 blur-[120px] dark:bg-purple-900/15" />
      </div>

      {/* Hero Header Card */}
      <section className="relative overflow-hidden rounded-3xl border border-border/80 bg-linear-to-b from-card/80 via-card/50 to-card/20 p-6 sm:p-10 shadow-xl backdrop-blur-2xl mb-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8">
          {/* Default Avatar (No glow, purple theme if no URL) */}
          <div className="shrink-0">
            <Avatar className="size-24 sm:size-28 rounded-full border border-border/80 bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-200 dark:border-purple-800/50 shadow-sm">
              {avatarUrl ? (
                <AvatarImage src={avatarUrl} alt={name} className="object-cover" />
              ) : null}
              <AvatarFallback className="text-3xl font-bold bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-200">
                {userInitial}
              </AvatarFallback>
            </Avatar>
          </div>


          {/* User Meta Info */}
          <div className="flex-1 text-center sm:text-left min-w-0">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 mb-2">
              <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-foreground truncate">
                {name || currentUser?.name || "Anonymous Member"}
              </h1>
              <Badge
                variant="outline"
                className="rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider bg-primary/10 text-primary border-primary/25"
              >
                <ShieldCheck className="size-3 mr-1" />
                {currentUser?.role || "Attendee"}
              </Badge>
            </div>

            <p className="flex items-center justify-center sm:justify-start gap-1.5 text-sm text-muted-foreground mb-4">
              <Mail className="size-3.5 text-primary/70 shrink-0" />
              <span className="truncate">{currentUser?.email}</span>
            </p>

            {/* Quick Actions / ID pill */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
              <button
                type="button"
                onClick={handleCopyId}
                id="copy-user-id-btn"
                className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-muted/40 px-3 py-1 font-mono text-[11px] text-muted-foreground hover:bg-muted/70 hover:text-foreground transition-all cursor-pointer"
                title="Click to copy User ID"
              >
                <span>ID: {currentUser?.id?.slice(0, 8)}...</span>
                {copiedId ? (
                  <Check className="size-3 text-emerald-500" />
                ) : (
                  <Copy className="size-3" />
                )}
              </button>

              <span className="text-xs text-muted-foreground/60 hidden sm:inline">•</span>

              <span className="text-xs text-muted-foreground">
                Live Event Passholder
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Grid: Form + Hub Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Edit Profile Form */}
        <div className="lg:col-span-7">
          <div className="rounded-3xl border border-border/80 bg-card/60 p-6 sm:p-8 shadow-xl backdrop-blur-xl">
            <div className="flex items-center justify-between pb-6 border-b border-border/60 mb-6">
              <div>
                <h2 className="text-lg font-semibold tracking-tight text-foreground flex items-center gap-2">
                  <UserIcon className="size-4.5 text-primary" />
                  Personal Information
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Update your public display name and avatar pass picture.
                </p>
              </div>

              {isDirty && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                  Unsaved changes
                </span>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Field */}
              <div className="space-y-2">
                <label
                  htmlFor="profile-name-input"
                  className="text-xs font-semibold tracking-wide uppercase text-muted-foreground"
                >
                  Full Name
                </label>
                <Input
                  id="profile-name-input"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  required
                  className="rounded-2xl border-border/80 bg-background/50 px-4 py-2.5 text-sm font-medium focus-visible:ring-primary/30"
                />
              </div>

              {/* Email (Read-Only) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="profile-email-input"
                    className="text-xs font-semibold tracking-wide uppercase text-muted-foreground"
                  >
                    Email Address
                  </label>
                  <span className="text-[11px] text-muted-foreground/70">Verified Account</span>
                </div>
                <Input
                  id="profile-email-input"
                  type="email"
                  value={currentUser?.email ?? ""}
                  disabled
                  className="rounded-2xl border-border/50 bg-muted/30 px-4 py-2.5 text-sm text-muted-foreground cursor-not-allowed"
                />
                <p className="text-[11px] text-muted-foreground/70">
                  Email addresses are permanently tied to your cryptographic ticket signatures.
                </p>
              </div>

              {/* Avatar URL Field */}
              <div className="space-y-2">
                <label
                  htmlFor="profile-avatar-input"
                  className="text-xs font-semibold tracking-wide uppercase text-muted-foreground"
                >
                  Avatar Image URL
                </label>
                <Input
                  id="profile-avatar-input"
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://example.com/your-avatar.jpg"
                  className="rounded-2xl border-border/80 bg-background/50 px-4 py-2.5 text-sm font-medium focus-visible:ring-primary/30"
                />
              </div>

              {/* Quick Presets */}
              <div className="space-y-2 pt-1">
                <span className="text-xs font-medium text-muted-foreground">
                  Or pick a preset avatar:
                </span>
                <div className="flex items-center gap-3">
                  {AVATAR_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setAvatarUrl(preset)}
                      className={`relative size-10 rounded-full overflow-hidden border-2 transition-all cursor-pointer hover:scale-110 ${
                        avatarUrl === preset
                          ? "border-primary ring-2 ring-primary/30 scale-105"
                          : "border-border/80 hover:border-primary/60"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={preset}
                        alt={`Preset ${idx + 1}`}
                        className="size-full object-cover"
                      />
                    </button>
                  ))}
                  {avatarUrl && (
                    <button
                      type="button"
                      onClick={() => setAvatarUrl("")}
                      className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 ml-1 cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex items-center justify-between border-t border-border/60">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={!isDirty || updateMutation.isPending}
                  onClick={() => {
                    setName(currentUser?.name ?? "");
                    setAvatarUrl(currentUser?.avatarUrl ?? "");
                  }}
                  className="rounded-xl text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  Reset
                </Button>

                <Button
                  type="submit"
                  id="save-profile-btn"
                  disabled={!isDirty || updateMutation.isPending}
                  className="rounded-2xl px-6 py-2.5 text-sm font-semibold shadow-md shadow-primary/20 bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer"
                >
                  {updateMutation.isPending ? (
                    <>
                      <RefreshCw className="size-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="size-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Account Hub & Quick Navigation */}
        <div className="lg:col-span-5 space-y-6">
          {/* Digital Passes Quick Card */}
          <div className="rounded-3xl border border-border/80 bg-linear-to-br from-card/70 via-card/50 to-primary/5 p-6 shadow-xl backdrop-blur-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20">
                <Ticket className="size-5" />
              </div>
              <Badge variant="secondary" className="rounded-full text-[11px] font-semibold">
                Passes Vault
              </Badge>
            </div>

            <h3 className="text-base font-bold text-foreground tracking-tight mb-1">
              My Digital Passes
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              View cryptographic QR passes, gate entry IDs, and active concert bookings.
            </p>

            <Link href="/tickets" className="block">
              <Button
                variant="outline"
                className="w-full justify-between rounded-2xl border-border/80 bg-background/40 hover:bg-background/80 text-foreground font-medium text-xs py-2.5"
              >
                <span>Open Passes Vault</span>
                <ExternalLink className="size-3.5 text-muted-foreground" />
              </Button>
            </Link>
          </div>

          {/* Organizer Event Management Card */}
          <div className="rounded-3xl border border-border/80 bg-card/60 p-6 shadow-xl backdrop-blur-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex size-10 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                <Calendar className="size-5" />
              </div>
              <Badge variant="outline" className="rounded-full text-[11px] font-semibold">
                Organizer Hub
              </Badge>
            </div>

            <h3 className="text-base font-bold text-foreground tracking-tight mb-1">
              Host or Manage Events
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              Create new live events, monitor ticket tiers, and inspect attendee check-ins.
            </p>

            <div className="space-y-2">
              <Link href="/organizer/events" className="block">
                <Button
                  variant="outline"
                  className="w-full justify-between rounded-2xl border-border/80 bg-background/40 hover:bg-background/80 text-foreground font-medium text-xs py-2.5"
                >
                  <span>Manage My Events</span>
                  <ExternalLink className="size-3.5 text-muted-foreground" />
                </Button>
              </Link>
              <Link href="/organizer/events/new" className="block">
                <Button
                  variant="ghost"
                  className="w-full justify-center rounded-2xl text-xs text-primary hover:bg-primary/10 font-semibold"
                >
                  + Create New Event
                </Button>
              </Link>
            </div>
          </div>

          {/* Security & Sign Out Card */}
          <div className="rounded-3xl border border-border/80 bg-card/40 p-6 backdrop-blur-xl">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Session & Security
            </h4>
            <p className="text-xs text-muted-foreground mb-4">
              Signing out will invalidate your local session tokens on this browser.
            </p>

            <Button
              type="button"
              variant="outline"
              onClick={handleLogout}
              id="profile-signout-btn"
              className="w-full justify-center rounded-2xl border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive text-xs font-semibold py-2.5 cursor-pointer"
            >
              <LogOut className="size-3.5 mr-2" />
              Sign Out of Eventiee
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
