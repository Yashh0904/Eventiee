import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative isolate min-h-svh w-full flex flex-col items-center justify-center p-4 sm:p-6 bg-background text-foreground overflow-hidden">
      {/* Centrally Radiating Purple Ambient Light Source */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[650px] sm:size-[720px] -z-10 overflow-visible"
      >
        <div className="h-full w-full rounded-full bg-[radial-gradient(circle_at_center,var(--color-primary)_0%,transparent_70%)] opacity-30 blur-3xl" />
      </div>

      {/* Subtle background cosmic texture */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(var(--color-primary)_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.04] dark:opacity-[0.06]" />
      </div>

      {/* Brand Header */}
      <div className="mb-6 flex flex-col items-center gap-2">
        <Link
          href="/"
          className="group flex items-center gap-2.5 transition-transform hover:scale-102"
        >
          <div className="flex size-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25 transition-transform group-hover:rotate-6">
            <Sparkles className="size-5" />
          </div>
          <span className="font-heading text-2xl font-bold tracking-tight text-foreground">
            Eventiee
          </span>
        </Link>
      </div>

      {/* Centered Translucent Form Container */}
      <main className="relative z-10 w-full max-w-md">
        {children}
      </main>
    </div>
  );
}
