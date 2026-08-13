"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Clock, MapPin, ShieldCheck } from "lucide-react";
import AuthModal from "@/features/customer-auth/components/AuthModal";
import { useCustomerSession } from "@/features/customer-auth/hooks/useCustomerSession";
import { formatPrice } from "../utils/formatPrice";

export default function StickyBookingCard({
  packageTotal,
  gstPercent,
  tokenAmount,
}: {
  packageTotal: number;
  gstPercent: number;
  tokenAmount: number;
}) {
  const [eventType, setEventType] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [location, setLocation] = useState("");
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const router = useRouter();
  const { isLoggedIn } = useCustomerSession();

  const gstAmount = Math.round((packageTotal * gstPercent) / 100);
  const estimatedTotal = packageTotal + gstAmount;

  // No cart-add API call here — both actions just take the customer to the
  // (real) Cart page rather than writing to the backend from the PDP.
  function handleAddToCart() {
    router.push("/cart");
  }

  function handleBookClick() {
    if (!isLoggedIn) {
      setIsAuthOpen(true);
      return;
    }
    router.push("/cart");
  }

  return (
    <div className="relative">
      <div className="sticky top-24 rounded-2xl border border-black/10 bg-white p-6 shadow-lg shadow-black/[0.04]">
        <div className="mb-6">
          <div className="mb-1 flex items-end gap-2">
            <h2 className="font-figtree text-[24px] font-bold text-brand-950">
              from {formatPrice(estimatedTotal)}
            </h2>
            <span className="mb-1 font-figtree text-[11px] text-neutral-tertiary">
              incl. {gstPercent}% GST
            </span>
          </div>
          <p className="font-figtree text-[12px] text-neutral-tertiary">
            price updates with your variant &amp; add-on picks
          </p>
        </div>

        <form className="space-y-4" onSubmit={(event) => event.preventDefault()}>
          <label className="block">
            <span className="mb-1.5 block font-figtree text-[11px] font-semibold tracking-wide text-neutral-tertiary uppercase">
              Event Type
            </span>
            <select
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
            <div className="relative">
              <input
                type="text"
                value={eventDate}
                onChange={(event) => setEventDate(event.target.value)}
                placeholder="Enter Event Date"
                className="w-full rounded-lg border border-black/15 py-2 pr-10 pl-3 font-figtree text-[13px] text-brand-950 outline-none focus:border-brand-primary"
              />
              <Calendar className="pointer-events-none absolute top-2.5 right-3 h-4 w-4 text-neutral-tertiary" />
            </div>
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1.5 block font-figtree text-[11px] font-semibold tracking-wide text-neutral-tertiary uppercase">
                Start Time
              </span>
              <div className="relative">
                <input
                  type="text"
                  value={startTime}
                  onChange={(event) => setStartTime(event.target.value)}
                  placeholder="Start time"
                  className="w-full rounded-lg border border-black/15 py-2 pr-8 pl-3 font-figtree text-[13px] text-brand-950 outline-none focus:border-brand-primary"
                />
                <Clock className="pointer-events-none absolute top-2.5 right-2.5 h-4 w-4 text-neutral-tertiary" />
              </div>
            </label>
            <label className="block">
              <span className="mb-1.5 block font-figtree text-[11px] font-semibold tracking-wide text-neutral-tertiary uppercase">
                End Time
              </span>
              <div className="relative">
                <input
                  type="text"
                  value={endTime}
                  onChange={(event) => setEndTime(event.target.value)}
                  placeholder="End time"
                  className="w-full rounded-lg border border-black/15 py-2 pr-8 pl-3 font-figtree text-[13px] text-brand-950 outline-none focus:border-brand-primary"
                />
                <Clock className="pointer-events-none absolute top-2.5 right-2.5 h-4 w-4 text-neutral-tertiary" />
              </div>
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

        <div className="mt-6 space-y-2 border-t border-black/5 pt-4 font-figtree text-[13px]">
          <div className="flex justify-between text-neutral-secondary">
            <span>Package total</span>
            <span>{formatPrice(packageTotal)}</span>
          </div>
          <div className="flex justify-between text-neutral-secondary">
            <span>GST {gstPercent}%</span>
            <span>{formatPrice(gstAmount)}</span>
          </div>
          <div className="flex justify-between pt-2 font-bold text-brand-950">
            <span>Estimated total</span>
            <span>{formatPrice(estimatedTotal)}</span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={handleBookClick}
            className="rounded-xl bg-brand-primary py-3 text-center font-figtree text-[14px] font-semibold text-white shadow-sm transition hover:bg-rose-600"
          >
            Book at {formatPrice(tokenAmount)}
          </button>
          <button
            type="button"
            onClick={handleAddToCart}
            className="rounded-xl border border-black/15 py-3 font-figtree text-[14px] font-semibold text-brand-950 transition hover:border-black/30"
          >
            Add to Cart
          </button>
        </div>

        <p className="mt-3 text-center font-figtree text-[11px] text-neutral-tertiary">
          Date locked instantly · held safely until setup
        </p>

        <div className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-success-subtle px-3 py-3 font-figtree text-[12px] text-success-700">
          <ShieldCheck className="h-4 w-4" />
          Pick a date to see your free-cancellation cut-off
        </div>
      </div>

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthenticated={() => {
          setIsAuthOpen(false);
          router.push("/cart");
        }}
      />
    </div>
  );
}
