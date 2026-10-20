import * as React from "react";
import { Navbar } from "@/components/layout/navbar";

export default function OrganizerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <main className="flex-1 pb-16">{children}</main>
    </div>
  );
}
