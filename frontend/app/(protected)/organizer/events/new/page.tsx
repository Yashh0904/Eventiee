"use client";

import * as React from "react";
import Link from "next/link";
import {
  Sparkles,
  Calendar,
  Clock,
  MapPin,
  Building,
  Upload,
  Plus,
  Trash2,
  Eye,
  DollarSign,
  Ticket,
  Image as ImageIcon,
  Info,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/toast";

interface TicketTier {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export default function CreateEventPage() {
  // Empty initial state ready for user input
  const [name, setName] = React.useState("");
  const [venue, setVenue] = React.useState("");
  const [city, setCity] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [startDate, setStartDate] = React.useState("");
  const [startTime, setStartTime] = React.useState("");
  const [endDate, setEndDate] = React.useState("");
  const [endTime, setEndTime] = React.useState("");
  const [bannerUrl, setBannerUrl] = React.useState("");

  const [ticketTiers, setTicketTiers] = React.useState<TicketTier[]>([
    { id: "1", name: "", price: 0, quantity: 100 },
  ]);

  const queryClient = useQueryClient();
  const router = useRouter(); 

  const mutation = useMutation({
    mutationFn: () => api.createEvent({
      name,
      venue,
      city,
      description,
      dateTime: new Date(`${startDate}T${startTime}`).toISOString(),
      endDateTime: (endDate && endTime)
        ? new Date(`${endDate}T${endTime}`).toISOString()
        : undefined,
      bannerUrl: bannerUrl || undefined,
      tickets: ticketTiers
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] })

      toast.add({
        type: "success",
        title: "Event Published! 🎉",
        description: "Your event is now live on Eventiee.",
      });

      router.push('/organizer/events');
    },
    onError: (error: any) => {
      toast.add({
        type: "error",
        title: "Failed to publish event",
        description: error?.message || "Please check your inputs and try again.",
      })
    }
  })

  const isSubmittable = Boolean(
    name.trim().length >= 3 &&
    venue.trim() &&
    city.trim() &&
    description.trim().length >= 5 &&
    startDate &&
    startTime &&
    ticketTiers.some(tier => tier.name.trim() && tier.price >= 0 && tier.quantity > 0)
    );

  const handleAddTier = () => {
    const newId = (ticketTiers.length + 1).toString();
    setTicketTiers((prev) => [
      ...prev,
      { id: newId, name: "", price: 0, quantity: 100 },
    ]);
  };

  const handleRemoveTier = (id: string) => {
    if (ticketTiers.length <= 1) return;
    setTicketTiers((prev) => prev.filter((tier) => tier.id !== id));
  };

  const handleUpdateTier = (id: string, field: keyof TicketTier, value: string | number) => {
    setTicketTiers((prev) =>
      prev.map((tier) => (tier.id === id ? { ...tier, [field]: value } : tier))
    );
  };

  // Format preview date components
  const previewDate = (() => {
    if (!startDate) return { month: "DATE", day: "--" };
    try {
      const d = new Date(`${startDate}T${startTime || "00:00"}`);
      if (isNaN(d.getTime())) return { month: "DATE", day: "--" };
      return {
        month: d.toLocaleString("en-US", { month: "short" }).toUpperCase(),
        day: d.getDate().toString(),
      };
    } catch {
      return { month: "DATE", day: "--" };
    }
  })();

  // Pricing calculations for live preview
  const validTiers = ticketTiers.filter((t) => t.name.trim().length > 0);
  const startingPrice =
    validTiers.length > 0
      ? Math.min(...validTiers.map((t) => Number(t.price) || 0))
      : null;
  const totalPasses = validTiers.reduce(
    (acc, curr) => acc + (Number(curr.quantity) || 0),
    0
  );

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-6 sm:pt-8">
      {/* Top Breadcrumb & Page Header */}
      <div className="mb-8 space-y-4">

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Create New Event
            </h1>
            <p className="text-sm text-muted-foreground max-w-2xl">
              Fill in your event schedule, location, and ticket tiers. Watch the live discovery card update on the right in real time.
            </p>
          </div>
        </div>
      </div>

      {/* Main 2-Column Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Event Configuration Forms (8 Cols) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          {/* Card 1: Basic Event Details */}
          <section className="rounded-3xl border border-border/80 bg-card/60 p-6 sm:p-7 backdrop-blur-xl shadow-sm space-y-5 dark:border-white/[0.08] dark:bg-card/30">
            <div className="flex items-center gap-2.5 pb-2 border-b border-border/50">
              <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Sparkles className="size-4" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-foreground">Event Overview</h2>
                <p className="text-xs text-muted-foreground">General information shown on the main discovery listing</p>
              </div>
            </div>

            {/* Event Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Event Title <span className="text-primary">*</span>
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Neon Horizon Electronic Showcase"
                className="h-10 text-sm"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Description <span className="text-primary">*</span>
              </label>
              <Textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Give attendees a detailed look into what makes your event special, special experiences, dress codes, or schedules..."
                className="text-sm"
              />
              <p className="text-[11px] text-muted-foreground">
                Markdown supported. Keep it engaging and concise.
              </p>
            </div>

            {/* Banner URL / Upload Placeholder */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground">Banner Image URL</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    value={bannerUrl}
                    onChange={(e) => setBannerUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="h-10 pl-9 text-sm"
                  />
                  <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-2xl border border-dashed border-border/80 p-4 text-center justify-center hover:bg-accent/30 transition-colors cursor-pointer dark:border-white/10">
                <Upload className="size-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  Or drag and drop a 16:9 banner image (Max 5MB)
                </span>
              </div>
            </div>
          </section>

          {/* Card 2: Date & Time Schedule */}
          <section className="rounded-3xl border border-border/80 bg-card/60 p-6 sm:p-7 backdrop-blur-xl shadow-sm space-y-5 dark:border-white/[0.08] dark:bg-card/30">
            <div className="flex items-center gap-2.5 pb-2 border-b border-border/50">
              <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Calendar className="size-4" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-foreground">Date & Schedule</h2>
                <p className="text-xs text-muted-foreground">Specify the doors opening and closing timestamps</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Start Date & Time */}
              <div className="space-y-3 rounded-2xl border border-border/60 bg-background/40 p-4 dark:border-white/5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                  <Clock className="size-3.5 text-primary" />
                  <span>Start Date & Time</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="h-9 text-xs"
                  />
                  <Input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              {/* End Date & Time */}
              <div className="space-y-3 rounded-2xl border border-border/60 bg-background/40 p-4 dark:border-white/5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                  <Clock className="size-3.5 text-muted-foreground" />
                  <span>End Date & Time (Optional)</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="h-9 text-xs"
                  />
                  <Input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-xl bg-primary/5 p-3 text-xs text-muted-foreground border border-primary/10">
              <Info className="size-4 text-primary shrink-0" />
              <span>Timestamps are automatically converted to each attendee's local device timezone.</span>
            </div>
          </section>

          {/* Card 3: Venue & Location */}
          <section className="rounded-3xl border border-border/80 bg-card/60 p-6 sm:p-7 backdrop-blur-xl shadow-sm space-y-5 dark:border-white/[0.08] dark:bg-card/30">
            <div className="flex items-center gap-2.5 pb-2 border-b border-border/50">
              <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <MapPin className="size-4" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-foreground">Venue & Location</h2>
                <p className="text-xs text-muted-foreground">Where will attendees gather for this event?</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Venue Name <span className="text-primary">*</span>
                </label>
                <div className="relative">
                  <Input
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    placeholder="e.g. The Glasshouse Rooftop"
                    className="h-10 pl-9 text-sm"
                  />
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  City & State <span className="text-primary">*</span>
                </label>
                <div className="relative">
                  <Input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. New York, NY"
                    className="h-10 pl-9 text-sm"
                  />
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                </div>
              </div>
            </div>
          </section>

          {/* Card 4: Ticket Tiers */}
          <section className="rounded-3xl border border-border/80 bg-card/60 p-6 sm:p-7 backdrop-blur-xl shadow-sm space-y-5 dark:border-white/[0.08] dark:bg-card/30">
            <div className="flex items-center justify-between pb-2 border-b border-border/50">
              <div className="flex items-center gap-2.5">
                <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Ticket className="size-4" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-foreground">Ticket Tiers</h2>
                  <p className="text-xs text-muted-foreground">Configure pricing and available capacity for attendees</p>
                </div>
              </div>
              <Badge variant="secondary" className="text-xs font-mono">
                {ticketTiers.length} {ticketTiers.length === 1 ? "Tier" : "Tiers"}
              </Badge>
            </div>

            {/* Tier Rows */}
            <div className="space-y-3">
              {ticketTiers.map((tier, idx) => (
                <div
                  key={tier.id}
                  className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 rounded-2xl border border-border/70 bg-background/60 p-4 transition-all dark:border-white/5"
                >
                  <div className="flex items-center gap-2 sm:w-1/3">
                    <span className="text-xs font-bold text-muted-foreground">#{idx + 1}</span>
                    <Input
                      value={tier.name}
                      onChange={(e) => handleUpdateTier(tier.id, "name", e.target.value)}
                      placeholder="e.g. General Admission"
                      className="h-9 text-xs font-semibold"
                    />
                  </div>

                  <div className="flex items-center gap-3 sm:w-2/3">
                    <div className="relative flex-1">
                      <Input
                        type="number"
                        min="0"
                        value={tier.price || ""}
                        onChange={(e) => handleUpdateTier(tier.id, "price", Number(e.target.value))}
                        placeholder="Price"
                        className="h-9 pl-7 text-xs"
                      />
                      <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3 text-muted-foreground" />
                    </div>

                    <div className="relative flex-1">
                      <Input
                        type="number"
                        min="1"
                        value={tier.quantity || ""}
                        onChange={(e) => handleUpdateTier(tier.id, "quantity", Number(e.target.value))}
                        placeholder="Quantity"
                        className="h-9 pl-7 text-xs"
                      />
                      <Layers className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3 text-muted-foreground" />
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveTier(tier.id)}
                      disabled={ticketTiers.length <= 1}
                      className="size-8 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0 cursor-pointer disabled:opacity-30"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleAddTier}
              className="w-full rounded-2xl border-dashed border-border/80 py-4 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-accent/40 cursor-pointer dark:border-white/10"
            >
              <Plus className="size-4 mr-1.5 text-primary" />
              Add Another Ticket Tier
            </Button>
          </section>

          {/* Bottom Submission Action Bar */}
          <div className="flex items-center justify-between pt-2">
            <Link href="/">
              <Button variant="ghost" className="rounded-xl text-xs font-medium">
                Cancel
              </Button>
            </Link>

            <div className="flex items-center gap-3">
              <Button variant="outline" className="rounded-xl text-xs font-medium cursor-pointer">
                Save as Draft
              </Button>
              <Button type="button"
              onClick={() => mutation.mutate()}
              disabled={!isSubmittable}
              className="rounded-xl text-xs font-semibold shadow-lg shadow-primary/25 cursor-pointer" >
                <Sparkles className="size-3.5 mr-1.5" />
                Publish Event
              </Button>
            </div>
          </div>
        </div>

        {/* Right Column: Sticky Live Event Preview (4/5 Cols) */}
        <div className="lg:col-span-5 xl:col-span-4 sticky top-24 space-y-5">
          {/* Live Preview Header */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <Eye className="size-3.5 text-primary" />
              <span>Live Card Preview</span>
            </div>
          </div>

          {/* Rendered Preview Card matching EventCard.tsx structure */}
          <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/80 bg-card/60 shadow-lg shadow-black/[0.05] backdrop-blur-sm text-left transition-all dark:border-white/[0.08] dark:bg-card/30 dark:shadow-[0_8px_25px_rgba(0,0,0,0.35)]">
            {/* Banner Container */}
            <div className="relative aspect-16/9 w-full overflow-hidden bg-gradient-to-br from-purple-100 via-violet-50 to-muted/40 dark:from-purple-950/40 dark:via-violet-900/20 dark:to-background">
              {bannerUrl ? (
                <img
                  src={bannerUrl}
                  alt={name || "Event Banner"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(ellipse_at_center,_rgba(168,85,247,0.25),_transparent_70%)]">
                  <div className="flex size-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary shadow-inner dark:border-white/10 dark:bg-white/5">
                    <Sparkles className="size-6 text-primary/80" />
                  </div>
                </div>
              )}

              {/* Floating Date Badge */}
              <div className="absolute top-3 left-3 flex flex-col items-center justify-center rounded-xl border border-black/5 bg-neutral-100/90 px-2.5 py-1 shadow-md backdrop-blur-md dark:border-white/15 dark:bg-black/60">
                <span className="text-[10px] font-bold tracking-wider text-primary">
                  {previewDate.month}
                </span>
                <span className="text-sm font-extrabold leading-tight text-neutral-900 dark:text-white">
                  {previewDate.day}
                </span>
              </div>

              {/* Floating City Pill */}
              <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full border border-black/5 bg-neutral-100/90 px-2.5 py-1 text-[11px] font-medium text-neutral-800 shadow-md backdrop-blur-md dark:border-white/15 dark:bg-black/60 dark:text-white/90">
                <MapPin className="size-3 text-primary" />
                <span>{city || "City"}</span>
              </div>
            </div>

            {/* Card Body */}
            <div className="flex flex-1 flex-col justify-between p-5 space-y-3">
              <div className="space-y-2">
                <h3 className="font-heading text-lg font-bold tracking-tight text-foreground line-clamp-2">
                  {name || "Untitled Event"}
                </h3>

                <div className="space-y-1 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5 truncate">
                    <MapPin className="size-3.5 shrink-0 text-primary/70" />
                    <span className="truncate">{venue || "Venue not set"}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="size-3.5 shrink-0 text-primary/70" />
                    <span>{startTime ? `Starts ${startTime}` : "Time not set"}</span>
                  </div>
                </div>
              </div>

              {/* Pricing Footer */}
              <div className="flex items-center justify-between border-t border-border/50 pt-3 dark:border-white/5">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                    Starting from
                  </span>
                  <span className="text-base font-extrabold text-foreground">
                    {startingPrice !== null ? `$${startingPrice}` : "--"}
                  </span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {totalPasses > 0 ? `${totalPasses} Total Passes` : "0 Passes"}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
