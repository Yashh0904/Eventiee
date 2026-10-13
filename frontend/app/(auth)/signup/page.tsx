"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { api, ApiError } from "@/lib/api";
import { useAuthStore, type UserRole } from "@/lib/store/auth-store";
import {
  User,
  Mail,
  Lock,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Loader2,
  Ticket,
  CalendarDays,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function SignupPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  // Flow step state: 1 = Account Credentials, 2 = Role Choice
  const [step, setStep] = React.useState<1 | 2>(1);

  // Form states
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [role, setRole] = React.useState<UserRole>("ATTENDEE");

  const [generalError, setGeneralError] = React.useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string[]>>({});

  const signupMutation = useMutation({
    mutationFn: () => api.register({ name, email, password, role }),
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken);
      router.push("/");
    },
    onError: (err: unknown) => {
      if (err instanceof ApiError) {
        if (err.errors) {
          setFieldErrors(err.errors);
          // If the errors belong to credentials, navigate back to Step 1
          if (err.errors.name || err.errors.email || err.errors.password) {
            setStep(1);
          }
        } else {
          setGeneralError(err.message);
        }
      } else {
        setGeneralError("Registration failed. Please try again.");
      }
    },
  });

  const handleStepOneSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    setGeneralError(null);
    setFieldErrors({});

    const errors: Record<string, string[]> = {};
    if (!name.trim()) errors.name = ["Name is required"];
    if (!email.trim() || !email.includes("@")) errors.email = ["Please enter a valid email address"];
    if (password.length < 6) errors.password = ["Password must be at least 6 characters"];

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setStep(2);
  };

  const handleFinalSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    setGeneralError(null);
    signupMutation.mutate();
  };

  return (
    <Card className="border border-white/[0.08] bg-[#0e0b1f]/75 shadow-[0_16px_50px_-12px_rgba(124,58,237,0.22)] backdrop-blur-2xl transition-all duration-300">
      {/* Progress Header */}
      <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-3.5">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "flex size-6 items-center justify-center rounded-full text-xs font-semibold transition-colors",
              step === 1
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/30"
                : "bg-primary/20 text-purple-300"
            )}
          >
            1
          </div>
          <div className="h-0.5 w-6 rounded-full bg-white/10" />
          <div
            className={cn(
              "flex size-6 items-center justify-center rounded-full text-xs font-semibold transition-colors",
              step === 2
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/30"
                : "bg-white/[0.06] text-zinc-400"
            )}
          >
            2
          </div>
        </div>
        <Badge variant="outline" className="border-white/10 bg-white/[0.03] text-[11px] font-normal text-zinc-400">
          {step === 1 ? "Step 1: Credentials" : "Step 2: Choose Role"}
        </Badge>
      </div>

      {generalError && (
        <div className="mx-6 mt-4 flex items-center gap-2 rounded-xl border border-destructive/40 bg-destructive/15 px-3.5 py-2.5 text-xs text-red-300">
          <AlertCircle className="size-4 shrink-0" />
          <span>{generalError}</span>
        </div>
      )}

      {/* STEP 1: Account Credentials */}
      {step === 1 && (
        <form onSubmit={handleStepOneSubmit}>
          <CardHeader className="space-y-1.5 pb-4">
            <CardTitle className="text-xl font-bold tracking-tight text-white">
              Create your account
            </CardTitle>
            <CardDescription className="text-zinc-400">
              Enter your basic details to get started with Eventiee
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Full Name */}
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="text-xs font-medium text-zinc-300"
              >
                Full Name
              </label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Jane Doe"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-10 rounded-xl border border-white/[0.08] bg-white/[0.03] pl-10 text-white placeholder:text-zinc-500 hover:border-white/15 focus-visible:border-primary/60 focus-visible:ring-primary/20"
                  autoComplete="name"
                />
              </div>
              {fieldErrors.name && (
                <p className="text-[11px] text-destructive">{fieldErrors.name[0]}</p>
              )}
            </div>

            {/* Email Address */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-xs font-medium text-zinc-300"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="jane@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-10 rounded-xl border border-white/[0.08] bg-white/[0.03] pl-10 text-white placeholder:text-zinc-500 hover:border-white/15 focus-visible:border-primary/60 focus-visible:ring-primary/20"
                  autoComplete="email"
                />
              </div>
              {fieldErrors.email && (
                <p className="text-[11px] text-destructive">{fieldErrors.email[0]}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-xs font-medium text-zinc-300"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Min. 6 characters"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-10 rounded-xl border border-white/[0.08] bg-white/[0.03] pl-10 text-white placeholder:text-zinc-500 hover:border-white/15 focus-visible:border-primary/60 focus-visible:ring-primary/20"
                  autoComplete="new-password"
                />
              </div>
              {fieldErrors.password && (
                <p className="text-[11px] text-destructive">{fieldErrors.password[0]}</p>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4 pt-7">
            <Button
              type="submit"
              className="h-10 w-full rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90"
            >
              Continue
              <ArrowRight className="ml-1.5 size-4" />
            </Button>

            <p className="text-center text-xs text-zinc-400">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium text-purple-400 underline-offset-4 hover:underline"
              >
                Log in
              </Link>
            </p>
          </CardFooter>
        </form>
      )}

      {/* STEP 2: Role Selection ("Who are you?") */}
      {step === 2 && (
        <form onSubmit={handleFinalSubmit}>
          <CardHeader className="space-y-1.5 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-purple-400" />
              <CardTitle className="text-xl font-bold tracking-tight text-white">
                Who are you?
              </CardTitle>
            </div>
            <CardDescription className="text-zinc-400">
              Choose how you will be using Eventiee. You can always change this later.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-3.5">
            {/* Attendee Option */}
            <button
              type="button"
              onClick={() => setRole("ATTENDEE")}
              className={cn(
                "group relative flex w-full items-start gap-4 rounded-2xl border p-4 text-left transition-all",
                role === "ATTENDEE"
                  ? "border-primary/70 bg-primary/15 ring-2 ring-primary/30"
                  : "border-white/[0.08] bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.05]"
              )}
            >
              <div
                className={cn(
                  "flex size-11 shrink-0 items-center justify-center rounded-xl transition-colors",
                  role === "ATTENDEE"
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/30"
                    : "bg-white/[0.06] text-zinc-400 group-hover:text-white"
                )}
              >
                <Ticket className="size-5" />
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-white">
                    I want to attend events
                  </span>
                  {role === "ATTENDEE" && (
                    <CheckCircle2 className="size-5 text-purple-400" />
                  )}
                </div>
                <p className="text-xs text-zinc-400">
                  Browse festivals, concerts, and workshops. Buy tickets & receive digital QR passes.
                </p>
              </div>
            </button>

            {/* Organizer Option */}
            <button
              type="button"
              onClick={() => setRole("ORGANIZER")}
              className={cn(
                "group relative flex w-full items-start gap-4 rounded-2xl border p-4 text-left transition-all",
                role === "ORGANIZER"
                  ? "border-primary/70 bg-primary/15 ring-2 ring-primary/30"
                  : "border-white/[0.08] bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.05]"
              )}
            >
              <div
                className={cn(
                  "flex size-11 shrink-0 items-center justify-center rounded-xl transition-colors",
                  role === "ORGANIZER"
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/30"
                    : "bg-white/[0.06] text-zinc-400 group-hover:text-white"
                )}
              >
                <CalendarDays className="size-5" />
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-white">
                    I want to organize events
                  </span>
                  {role === "ORGANIZER" && (
                    <CheckCircle2 className="size-5 text-purple-400" />
                  )}
                </div>
                <p className="text-xs text-zinc-400">
                  Create events, configure tiered pricing, manage ticket sales, and scan QR badges at the gate.
                </p>
              </div>
            </button>
          </CardContent>

          <CardFooter className="flex items-center gap-3 pt-7">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep(1)}
              className="h-10 w-1/3 rounded-xl border-white/10 bg-white/[0.03] text-sm font-medium text-zinc-300 hover:bg-white/[0.08] hover:text-white"
              disabled={signupMutation.isPending}
            >
              <ArrowLeft className="mr-1.5 size-4" />
              Back
            </Button>

            <Button
              type="submit"
              className="h-10 flex-1 rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90"
              disabled={signupMutation.isPending}
            >
              {signupMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  Complete Signup
                  <ArrowRight className="ml-1.5 size-4" />
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      )}
    </Card>
  );
}
