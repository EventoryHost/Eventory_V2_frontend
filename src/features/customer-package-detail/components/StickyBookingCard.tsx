"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, MapPin, ShieldCheck } from "lucide-react";
import AuthModal from "@/features/customer-auth/components/AuthModal";
import { useCustomerSession } from "@/features/customer-auth/hooks/useCustomerSession";
import { addCartItem } from "@/lib/customerCartApi";
import { ApiError } from "@/lib/apiClient";
import type { IncludedItemEntry, SelectedAddon } from "../types";
import { formatPrice } from "../utils/formatPrice";
import { formatDayMonth, getCancellationTiers } from "../utils/cancellationPolicy";
import PriceBreakdownDialog from "./PriceBreakdownDialog";
import CancellationPolicyDialog from "./CancellationPolicyDialog";

export default function StickyBookingCard({
  packageId,
  packageTotal,
  gstPercent,
  tokenAmount,
  selectedAddons,
  includedItems,
  vendorNote,
  cancellationPolicyText,
}: {
  packageId: string;
  packageTotal: number;
  gstPercent: number;
  tokenAmount: number;
  selectedAddons: SelectedAddon[];
  includedItems: IncludedItemEntry[];
  vendorNote: string;
  cancellationPolicyText?: string;
}) {
  const [eventType, setEventType] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [location, setLocation] = useState("");
  const [isBreakdownOpen, setIsBreakdownOpen] = useState(false);
  const [isCancellationOpen, setIsCancellationOpen] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cartError, setCartError] = useState<string | null>(null);
  const router = useRouter();
  const { isLoggedIn } = useCustomerSession();

  const gstAmount = Math.round((packageTotal * gstPercent) / 100);
  const estimatedTotal = packageTotal + gstAmount;
  const todayIso = new Date().toISOString().slice(0, 10);
  const validEventDate = eventDate && !isNaN(Date.parse(eventDate)) ? eventDate : null;
  const cancellationTiers = validEventDate ? getCancellationTiers(validEventDate) : null;

  function buildCartPayload() {
    const timeSlot = [startTime, endTime].filter(Boolean).join(" - ") || undefined;
    return {
      packageId,
      date: validEventDate ?? undefined,
      timeSlot,
      location: location || undefined,
      eventType: eventType || undefined,
      specialRequest: vendorNote || undefined,
      selectedAddOns: selectedAddons.map((addon) => ({
        addOnId: addon.id,
        name: addon.title,
        price: addon.price,
        quantity: addon.quantity,
      })),
    };
  }

  async function handleAddToCart() {
    setCartError(null);
    setIsSubmitting(true);
    try {
      await addCartItem(buildCartPayload());
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 2000);
    } catch (error) {
      setCartError(error instanceof ApiError ? error.message : "Couldn't add to cart. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleBookClick() {
    if (!isLoggedIn) {
      setIsAuthOpen(true);
      return;
    }
    setCartError(null);
    setIsSubmitting(true);
    try {
      await addCartItem(buildCartPayload());
      router.push("/cart");
    } catch (error) {
      setCartError(error instanceof ApiError ? error.message : "Couldn't start booking. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div id="booking-card" className="relative">
      <div className="sticky top-24 rounded-2xl border border-black/10 bg-white p-6 shadow-lg shadow-black/[0.04]">
        <button
          type="button"
          onClick={() => setIsBreakdownOpen(true)}
          className="mb-6 block w-full text-left"
        >
          <div className="mb-1 flex items-end gap-2">
            <h2 className="font-figtree text-[24px] font-bold text-brand-950">
              from {formatPrice(estimatedTotal)}
            </h2>
            <span className="mb-1 font-figtree text-[11px] text-neutral-tertiary">estimated total</span>
          </div>
          <p className="font-figtree text-[12px] text-neutral-tertiary">
            incl. {gstPercent}% GST · tap the price for the full breakdown
          </p>
        </button>

        <form className="space-y-4" onSubmit={(event) => event.preventDefault()}>
          <label className="block">
            <span className="mb-1.5 block font-figtree text-[11px] font-semibold tracking-wide text-neutral-tertiary uppercase">
              Event Type
            </span>
            <select
              id="event-type-select"
              value={eventType}
              onChange={(event) => setEventType(event.target.value)}
              className="w-full rounded-lg border border-black/15 px-3 py-2 font-figtree text-[13px] text-brand-950 outline-none focus:border-brand-primary"
            >
              <option value="">Choose Event Type</option>
              <option value="wedding">Wedding</option>
              <option value="haldi">Haldi</option>
              <option value="birthday">Birthday</option>
              <option value="anniversary">Anniversary</option>
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block font-figtree text-[11px] font-semibold tracking-wide text-neutral-tertiary uppercase">
              Event Date
            </span>
            <input
              type="date"
              value={eventDate}
              min={todayIso}
              onChange={(event) => setEventDate(event.target.value)}
              className="w-full rounded-lg border border-black/15 px-3 py-2 font-figtree text-[13px] text-brand-950 outline-none focus:border-brand-primary [color-scheme:light]"
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1.5 block font-figtree text-[11px] font-semibold tracking-wide text-neutral-tertiary uppercase">
                Time In
              </span>
              <input
                type="time"
                value={startTime}
                onChange={(event) => setStartTime(event.target.value)}
                className="w-full rounded-lg border border-black/15 px-3 py-2 font-figtree text-[13px] text-brand-950 outline-none focus:border-brand-primary [color-scheme:light]"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block font-figtree text-[11px] font-semibold tracking-wide text-neutral-tertiary uppercase">
                Time Out
              </span>
              <input
                type="time"
                value={endTime}
                onChange={(event) => setEndTime(event.target.value)}
                className="w-full rounded-lg border border-black/15 px-3 py-2 font-figtree text-[13px] text-brand-950 outline-none focus:border-brand-primary [color-scheme:light]"
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-1.5 block font-figtree text-[11px] font-semibold tracking-wide text-neutral-tertiary uppercase">
              Event Location
            </span>
            <div className="relative">
              <input
                type="text"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                placeholder="Enter event location"
                className="w-full rounded-lg border border-black/15 py-2 pr-10 pl-3 font-figtree text-[13px] text-brand-950 outline-none focus:border-brand-primary"
              />
              <MapPin className="pointer-events-none absolute top-2.5 right-3 h-4 w-4 text-neutral-tertiary" />
            </div>
          </label>
        </form>

        {validEventDate && cancellationTiers ? (
          <button
            type="button"
            onClick={() => setIsCancellationOpen(true)}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-success-700/20 bg-success-subtle px-3 py-3 font-figtree text-[12px] font-medium text-success-700 transition hover:border-success-700/40"
          >
            <ShieldCheck className="h-4 w-4" />
            Free cancellation till {formatDayMonth(cancellationTiers.fullRefundCutoff)}
          </button>
        ) : (
          <div className="mt-6 flex items-center justify-center gap-2 rounded-xl border border-black/10 px-3 py-3 font-figtree text-[12px] font-medium text-neutral-secondary">
            <Calendar className="h-4 w-4" />
            Pick a date to see your free-cancellation cut-off
          </div>
        )}

        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={handleBookClick}
            disabled={isSubmitting}
            className="rounded-xl bg-brand-primary py-3 text-center font-figtree text-[14px] font-semibold text-white shadow-sm transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Book &amp; pay {formatPrice(tokenAmount)}
          </button>
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isSubmitting}
            className="rounded-xl border border-black/15 py-3 font-figtree text-[14px] font-semibold text-brand-950 transition hover:border-black/30 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {justAdded ? "Added ✓" : "Add to cart"}
          </button>
        </div>

        {cartError && (
          <p className="mt-3 text-center font-figtree text-[12px] font-medium text-error-700">{cartError}</p>
        )}

        <p className="mt-3 text-center font-figtree text-[11px] text-neutral-tertiary">
          Date locked instantly · held safely until setup
        </p>
      </div>

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthenticated={() => {
          setIsAuthOpen(false);
          void handleBookClick();
        }}
      />

      <PriceBreakdownDialog
        isOpen={isBreakdownOpen}
        onClose={() => setIsBreakdownOpen(false)}
        includedItems={includedItems}
        selectedAddons={selectedAddons}
        subtotal={packageTotal}
        gstPercent={gstPercent}
        gstAmount={gstAmount}
        estimatedTotal={estimatedTotal}
        eventDateIso={validEventDate}
        onViewCancellationPolicy={() => {
          setIsBreakdownOpen(false);
          setIsCancellationOpen(true);
        }}
      />

      <CancellationPolicyDialog
        isOpen={isCancellationOpen}
        onClose={() => setIsCancellationOpen(false)}
        eventDateIso={validEventDate}
        vendorPolicyText={cancellationPolicyText}
      />
    </div>
  );
}
