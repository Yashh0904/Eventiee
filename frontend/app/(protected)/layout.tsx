"use client"

import * as React from "react";
import { Navbar } from "@/components/layout/navbar";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth-store";

export default function OrganizerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [hasHydrated, setHasHydrated] = React.useState(false);

  React.useEffect(() => {
    if(useAuthStore.persist.hasHydrated()) {
      setHasHydrated(true)
    }
    else {
      const unsub = useAuthStore.persist.onFinishHydration(() => setHasHydrated(true));
    return () => unsub();
    }
  }, []);

  React.useEffect(() => {
    if(hasHydrated && !isAuthenticated) {
      router.replace('/')
    }
  }, [hasHydrated, isAuthenticated, router])

  if (!hasHydrated || !isAuthenticated) {
    return null; 
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      <main className="flex-1 pb-16">{children}</main>
    </div>
  );
}