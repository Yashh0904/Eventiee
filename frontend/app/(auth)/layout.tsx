import Link from "next/link";
import Image from "next/image";
import { Sparkles } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-svh w-full overflow-hidden bg-[#070510] text-foreground lg:grid lg:grid-cols-2">
      {/* LEFT COLUMN: Visual Brand & Artwork */}
      <div className="relative hidden flex-col justify-between overflow-hidden p-10 xl:p-14 lg:flex">
        {/* Background Image with Vignette & Gradients */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/auth-banner.jpg"
            alt="Eventiee live festival atmosphere"
            fill
            priority
            className="object-cover object-center opacity-85 contrast-105"
          />
          {/* Multi-layer gradient overlays: smooth seam transition on the right edge */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#070510] via-transparent to-[#070510]/80" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#070510]/40 via-transparent to-[#070510]" />
          {/* Violet ambient glow orb */}
          <div className="absolute -bottom-24 -left-24 size-96 rounded-full bg-primary/30 blur-3xl" />
        </div>

        {/* Top Header */}
        <div className="relative z-10 flex items-center">
          <Link
            href="/"
            className="group flex items-center gap-3 transition-transform hover:scale-105"
          >
            <div className="flex size-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/30">
              <Sparkles className="size-5 transition-transform group-hover:rotate-12" />
            </div>
            <span className="font-heading text-2xl font-bold tracking-tight text-white">
              Eventiee
            </span>
          </Link>
        </div>

        {/* Bottom Editorial Copy */}
        <div className="relative z-10 max-w-md space-y-2.5 pb-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-purple-300/80">
            Live Experiences
          </p>
          <h1 className="font-heading text-3xl font-bold tracking-tight text-white xl:text-4xl leading-tight">
            Live hits different in person. <br />
            <span className="text-zinc-400 font-normal">Your pass is waiting.</span>
          </h1>
        </div>
      </div>

      {/* RIGHT COLUMN: Auth Form Area with Ambient Stage Lights Bleed */}
      <div className="relative flex min-h-svh flex-col items-center justify-center p-4 sm:p-8 lg:p-12">
        {/* Soft Ambient Stage Glow & Blurred Bleed from the Artwork */}
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          {/* Subtle mirrored festival light echoes */}
          <div className="absolute -top-24 left-1/4 h-[500px] w-[500px] rounded-full bg-primary/15 blur-[140px]" />
          <div className="absolute -bottom-20 right-0 h-[450px] w-[450px] rounded-full bg-indigo-600/10 blur-[130px]" />
          <div className="absolute top-1/2 left-0 h-96 w-96 -translate-y-1/2 rounded-full bg-purple-500/10 blur-[120px]" />
          {/* Subtle cosmic grid pattern for texture */}
          <div className="absolute inset-0 bg-[radial-gradient(#7c3aed_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.06]" />
        </div>

        {/* Mobile Header (Hidden on desktop) */}
        <div className="mb-6 flex flex-col items-center gap-2 lg:hidden">
          <Link
            href="/"
            className="group flex items-center gap-2.5 transition-transform hover:scale-105"
          >
            <div className="flex size-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">
              <Sparkles className="size-5 transition-transform group-hover:rotate-12" />
            </div>
            <span className="font-heading text-2xl font-bold tracking-tight text-white">
              Eventiee
            </span>
          </Link>
          <p className="text-xs text-zinc-400">
            Next-generation event discovery & ticketing platform
          </p>
        </div>

        {/* Form Container */}
        <main className="w-full max-w-md">
          {children}
        </main>
      </div>
    </div>
  );
}
