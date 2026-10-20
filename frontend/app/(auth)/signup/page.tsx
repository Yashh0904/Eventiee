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
import { api, ApiError, type RegisterPayload } from "@/lib/api";
import { useAuthStore } from "@/lib/store/auth-store";
import {
  User,
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);

  const [generalError, setGeneralError] = React.useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string[]>>({});

  const signupMutation = useMutation({
    mutationFn: (payload: RegisterPayload) => api.register(payload),
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken);
      const redirectUrl =
        typeof window !== "undefined"
          ? new URLSearchParams(window.location.search).get("redirect") || "/"
          : "/";
      router.push(redirectUrl);
    },
    onError: (err: unknown) => {
      if (err instanceof ApiError) {
        if (err.errors) {
          setFieldErrors(err.errors);
        } else {
          setGeneralError(err.message);
        }
      } else {
        setGeneralError("Registration failed. Please try again.");
      }
    },
  });

  const handleSubmit = (e: React.SubmitEvent) => {
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

    signupMutation.mutate({ name, email, password });
  };

  return (
    <Card className="border border-border/80 bg-card/80 shadow-[0_20px_50px_-12px_var(--color-primary)/20] backdrop-blur-2xl">
      <CardHeader className="space-y-1.5 pb-4">
        <CardTitle className="text-xl font-bold tracking-tight text-foreground">
          Create an account
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Enter your details to discover events and get passes
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {generalError && (
            <div className="flex items-center gap-2 rounded-xl border border-destructive/40 bg-destructive/15 px-3.5 py-2.5 text-xs text-destructive">
              <AlertCircle className="size-4 shrink-0" />
              <span>{generalError}</span>
            </div>
          )}

          {/* Full Name */}
          <div className="space-y-2">
            <label
              htmlFor="name"
              className="text-xs font-medium text-foreground"
            >
              Full Name
            </label>
            <div className="relative">
              <User className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="name"
                type="text"
                placeholder="Enter Name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-10 rounded-xl border border-border bg-background/80 pl-10 text-foreground placeholder:text-muted-foreground/60 hover:border-primary/40 focus-visible:border-primary focus-visible:ring-primary/20"
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
              className="text-xs font-medium text-foreground"
            >
              Email Address
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="Enter Email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-10 rounded-xl border border-border bg-background/80 pl-10 text-foreground placeholder:text-muted-foreground/60 hover:border-primary/40 focus-visible:border-primary focus-visible:ring-primary/20"
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
              className="text-xs font-medium text-foreground"
            >
              Password
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Min. 6 characters"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-10 rounded-xl border border-border bg-background/80 pl-10 pr-10 text-foreground placeholder:text-muted-foreground/60 hover:border-primary/40 focus-visible:border-primary focus-visible:ring-primary/20"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                aria-label={showPassword ? "Hide password" : "Show password"}
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
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
            disabled={signupMutation.isPending}
          >
            {signupMutation.isPending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Creating account...
              </>
            ) : (
              <>
                Create account
                <ArrowRight className="ml-1.5 size-4" />
              </>
            )}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
