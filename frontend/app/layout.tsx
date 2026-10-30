"use client"

import { Geist, Geist_Mono } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { QueryProvider } from "@/components/providers/query-provider"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/toast"
import { cn } from "@/lib/utils";
import React from "react"
import { api } from "@/lib/api"
import { useAuthStore } from "@/lib/store/auth-store"

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  React.useEffect(() => {
    api.refreshToken()
  }, [])

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, "font-sans", geist.variable)}
    >
      <body className="relative min-h-screen bg-background text-foreground antialiased selection:bg-primary/20 selection:text-primary">
        {/* Full-width top purple horizon light source fading downwards */}
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-[500px] overflow-hidden"
        >
          {/* Top ambient illumination wash across full width */}
          <div className="h-full w-full bg-[linear-gradient(to_bottom,rgba(168,85,247,0.24)_0%,rgba(147,51,234,0.12)_30%,rgba(126,34,206,0.03)_65%,transparent_100%)] dark:bg-[linear-gradient(to_bottom,rgba(168,85,247,0.30)_0%,rgba(147,51,234,0.14)_30%,rgba(91,33,182,0.04)_65%,transparent_100%)]" />

          {/* Top horizon neon hairline glow */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
        </div>

        <ThemeProvider>
          <QueryProvider>
            <TooltipProvider>
              {children}
              <Toaster />
            </TooltipProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
