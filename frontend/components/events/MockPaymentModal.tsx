"use client";

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
} from "lucide-react";

export interface MockPaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amount?: number;
  orderId?: string;
  eventName?: string;
  isLoading?: boolean;
  onConfirm?: () => void;
}

export function MockPaymentModal({
  open,
  onOpenChange,
  amount,
  orderId,
  eventName,
  isLoading = false,
  onConfirm,
}: MockPaymentModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-95 sm:max-w-100 p-0 overflow-hidden rounded-3xl border border-border/80 bg-background/95 shadow-2xl backdrop-blur-2xl">
        {/* Header Bar */}
        <div className="border-b border-border/60 bg-muted/30 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
                <ShieldCheck className="size-4" />
              </div>
              <div>
                <DialogTitle className="text-sm font-semibold tracking-tight text-foreground">
                  Mock Gateway
                </DialogTitle>
                <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <Lock className="size-3" /> Simulated Checkout
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Amount & Order Summary */}
        <div className="px-6 pt-5 pb-2">
          <div className="rounded-2xl border border-border/60 bg-linear-to-br from-muted/40 via-muted/10 to-transparent p-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
              <span className="truncate max-w-50 font-medium text-foreground">{eventName}</span>
              <span className="font-mono text-[11px]">ID: {orderId}</span>
            </div>
            <div className="flex items-baseline justify-between pt-1">
              <span className="text-xs font-medium text-muted-foreground">Amount Due</span>
              <span className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                ₹{amount ? amount.toLocaleString("en-IN") : "Nothing"}
              </span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="px-6 pb-6 pt-3 space-y-2.5">
          <Button
            size="lg"
            onClick={onConfirm}
            disabled={isLoading}
            className="w-full justify-center rounded-2xl py-2.5 text-sm font-semibold shadow-md shadow-primary/20 bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer"
          >
            <CheckCircle2 className="size-4 mr-1.5" />
            {isLoading ? "Processing Payment..." : "Confirm Payment"}
          </Button>

          <p className="text-center text-[11px] text-muted-foreground/75">
            Simulated test gateway. No real money will be charged.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
