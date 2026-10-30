"use client"

import * as React from "react";
import { Navbar } from "@/components/layout/navbar";
import { LoadingScreen } from "@/components/layout/loading-screen";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth-store";

export default function OrganizerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const authStatus = useAuthStore((state) => state.authStatus);

  React.useEffect(() => {
    if (authStatus === "anonymous") {
      router.replace("/");
    }
  }, [authStatus, router]);

  if (authStatus === "loading") {
    return <LoadingScreen />;
  }

  if (authStatus === "anonymous") return null;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      <main className="flex-1 pb-16">{children}</main>
    </div>
  );
}
