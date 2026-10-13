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
import { api, ApiError } from "@/lib/api";
import { useAuthStore } from "@/lib/store/auth-store";
import { Mail, Lock, ArrowRight, AlertCircle, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const loginMutation = useMutation({
    mutationFn: () => api.login({ email, password }),
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken);
      router.push("/");
    },
    onError: (err: unknown) => {
      if (err instanceof ApiError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Failed to log in. Please try again.");
      }
    },
  });

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    loginMutation.mutate();
  };

  return (
    <Card className="border border-white/[0.08] bg-[#0e0b1f]/75 shadow-[0_16px_50px_-12px_rgba(124,58,237,0.22)] backdrop-blur-2xl">
      <CardHeader className="space-y-1.5 pb-4">
        <CardTitle className="text-xl font-bold tracking-tight text-white">
          Welcome back
        </CardTitle>
        <CardDescription className="text-zinc-400">
          Enter your email and password to access your account
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {errorMessage && (
            <div className="flex items-center gap-2 rounded-xl border border-destructive/40 bg-destructive/15 px-3.5 py-2.5 text-xs text-red-300">
              <AlertCircle className="size-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

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
                placeholder="name@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-10 rounded-xl border border-white/[0.08] bg-white/[0.03] pl-10 text-white placeholder:text-zinc-500 hover:border-white/15 focus-visible:border-primary/60 focus-visible:ring-primary/20"
                autoComplete="email"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="text-xs font-medium text-zinc-300"
              >
                Password
              </label>
            </div>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-10 rounded-xl border border-white/[0.08] bg-white/[0.03] pl-10 text-white placeholder:text-zinc-500 hover:border-white/15 focus-visible:border-primary/60 focus-visible:ring-primary/20"
                autoComplete="current-password"
              />
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-4 pt-7">
          <Button
            type="submit"
            className="h-10 w-full rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                Sign in
                <ArrowRight className="ml-1.5 size-4" />
              </>
            )}
          </Button>

          <p className="text-center text-xs text-zinc-400">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="font-medium text-purple-400 underline-offset-4 hover:underline"
            >
              Sign up
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
