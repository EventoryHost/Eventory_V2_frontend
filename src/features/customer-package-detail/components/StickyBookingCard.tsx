"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, MapPin, ShieldCheck, Check } from "lucide-react";
import AuthModal from "@/features/customer-auth/components/AuthModal";
import { useCustomerSession } from "@/features/customer-auth/hooks/useCustomerSession";
import { addCartItem, getCart, updateCartItem, type RawCartEventDetails } from "@/lib/customerCartApi";
import { ApiError } from "@/lib/apiClient";
import type { IncludedItemEntry, SelectedAddon } from "../types";
import { formatPrice } from "../utils/formatPrice";
import { formatDayMonth, getCancellationTiers } from "../utils/cancellationPolicy";
import PriceBreakdownDialog from "./PriceBreakdownDialog";
import CancellationPolicyDialog from "./CancellationPolicyDialog";
import VendorNotePromptModal from "./VendorNotePromptModal";
import SearchDropdown from "@/features/customer-landing/components/SearchDropdown";
import SearchDatePicker from "@/features/customer-landing/components/SearchDatePicker";

const EVENT_TYPE_OPTIONS = [
  { value: "wedding", label: "Wedding" },
  { value: "haldi", label: "Haldi" },
  { value: "birthday", label: "Birthday" },
  { value: "anniversary", label: "Anniversary" },
];

// Half-hour slots, stored as 24h "HH:MM" (same shape the native time input
// produced, so buildCartPayload's `${startTime} - ${endTime}` join and any
// backend expectations elsewhere don't change) but labeled in 12h format to
// match the search bar's themed dropdown styling.
const TIME_OPTIONS = Array.from({ length: 48 }, (_, index) => {
  const totalMinutes = index * 30;
  const hours24 = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const value = `${String(hours24).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  const period = hours24 < 12 ? "AM" : "PM";
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  const label = `${hours12}:${String(minutes).padStart(2, "0")} ${period}`;
  return { value, label };
});

export default function StickyBookingCard({
  packageId,
  packageTotal,
  teamAndEquipmentCharge,
  teamAndEquipmentBillingUnit,
  overtimeChargeRate,
  overtimeBillingUnit,
  gstPercent,
  tokenAmount,
  selectedAddons,
  includedItems,
  vendorNote,
  onVendorNoteChange,
  cancellationPolicyText,
  editItemId,
  prefillEventDetails,
}: {
  packageId: string;
  packageTotal: number;
  teamAndEquipmentCharge: number;
  teamAndEquipmentBillingUnit?: string;
  overtimeChargeRate: number;
  overtimeBillingUnit?: string;
  gstPercent: number;
  tokenAmount: number;
  selectedAddons: SelectedAddon[];
  includedItems: IncludedItemEntry[];
  vendorNote: string;
  onVendorNoteChange: (note: string) => void;
  cancellationPolicyText?: string;
  /** Set when editing an existing cart line (see PackageDetailPage) — routes saves to updateCartItem instead of creating a new cart item. */
  editItemId?: string;
  /** This cart item's already-saved event details, to prefill the fields below instead of starting blank. */
  prefillEventDetails?: RawCartEventDetails;
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
  const [inCartItemId, setInCartItemId] = useState<string | null>(null);
  const [isNotePromptOpen, setIsNotePromptOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<"cart" | "book" | null>(null);
  const router = useRouter();
  const { isLoggedIn } = useCustomerSession();

  // Reflects whether this exact package is already sitting in the cart, so
  // navigating back to its PDP doesn't invite adding a duplicate row —
  // "Add to cart" becomes "In cart · view cart" instead. Skipped when
  // editItemId is already known (arrived via Cart's "Edit Package Details")
  // — the parent already fetched the cart to build that id, no need to
  // repeat the request just to learn the same thing.
  useEffect(() => {
    if (editItemId) {
      setInCartItemId(editItemId);
      return;
    }
    let cancelled = false;
    getCart()
      .then((cart) => {
        if (cancelled) return;
        const existing = cart.vendors.flatMap((group) => group.items).find((item) => item.packageId === packageId);
        setInCartItemId(existing?._id ?? null);
      })
      .catch(() => {
        // Best-effort — worst case the button just doesn't know it's already in the cart.
      });
    return () => {
      cancelled = true;
    };
  }, [packageId, editItemId]);

  // Prefill from the cart item being edited — otherwise these all start
  // blank on every visit, edit or not.
  useEffect(() => {
    if (!prefillEventDetails) return;
    if (prefillEventDetails.eventType) setEventType(prefillEventDetails.eventType);
    if (prefillEventDetails.date) setEventDate(prefillEventDetails.date.slice(0, 10));
    if (prefillEventDetails.timeSlot) {
      const [start, end] = prefillEventDetails.timeSlot.split(" - ");
      if (start) setStartTime(start.trim());
      if (end) setEndTime(end.trim());
    }
    if (prefillEventDetails.location) setLocation(prefillEventDetails.location);
  }, [prefillEventDetails]);

  const gstAmount = Math.round((packageTotal * gstPercent) / 100);
  const estimatedTotal = packageTotal + gstAmount;
  const validEventDate = eventDate && !isNaN(Date.parse(eventDate)) ? eventDate : null;
  const cancellationTiers = validEventDate ? getCancellationTiers(validEventDate) : null;
  const detailsComplete = Boolean(eventType && validEventDate && startTime && endTime && location.trim());

  function buildCartPayload(noteOverride?: string) {
    const timeSlot = [startTime, endTime].filter(Boolean).join(" - ") || undefined;
    const note = noteOverride ?? vendorNote;
    return {
      packageId,
      date: validEventDate ?? undefined,
      timeSlot,
      location: location || undefined,
      eventType: eventType || undefined,
      specialRequest: note || undefined,
      selectedAddOns: selectedAddons.map((addon) => ({
        addOnId: addon.id,
        name: addon.title,
        price: addon.price,
        quantity: addon.quantity,
      })),
    };
  }

  async function performAddToCart(noteOverride?: string) {
    setCartError(null);
    setIsSubmitting(true);
    try {
      if (editItemId) {
        await updateCartItem(editItemId, buildCartPayload(noteOverride));
        setInCartItemId(editItemId);
      } else {
        const result = await addCartItem(buildCartPayload(noteOverride));
        setInCartItemId(result.itemId);
      }
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 2000);
    } catch (error) {
      setCartError(error instanceof ApiError ? error.message : "Couldn't add to cart. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function performBookClick(noteOverride?: string) {
    setCartError(null);
    setIsSubmitting(true);
    try {
      if (editItemId) {
        await updateCartItem(editItemId, buildCartPayload(noteOverride));
      } else {
        await addCartItem(buildCartPayload(noteOverride));
      }
      router.push("/cart");
    } catch (error) {
      setCartError(error instanceof ApiError ? error.message : "Couldn't start booking. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function requestAddToCart() {
    if (!detailsComplete) return;
    // Not in edit mode and already in the cart — just take them to it
    // rather than silently overwriting. In edit mode this same
    // inCartItemId is expected (it's set to editItemId above) and should
    // fall through to actually saving the edits.
    if (inCartItemId && !editItemId) {
      router.push("/cart");
      return;
    }
    if (!vendorNote.trim()) {
      setPendingAction("cart");
      setIsNotePromptOpen(true);
      return;
    }
    void performAddToCart();
  }

  function requestBookClick() {
    if (!detailsComplete) return;
    if (!isLoggedIn) {
      setIsAuthOpen(true);
      return;
    }
    if (!vendorNote.trim()) {
      setPendingAction("book");
      setIsNotePromptOpen(true);
      return;
    }
    void performBookClick();
  }

  function resolvePendingAction(noteOverride?: string) {
    setIsNotePromptOpen(false);
    if (pendingAction === "cart") void performAddToCart(noteOverride);
    if (pendingAction === "book") void performBookClick(noteOverride);
    setPendingAction(null);
  }

  function handleNotePromptSkip() {
    resolvePendingAction();
  }

  function handleNotePromptSave(note: string) {
    onVendorNoteChange(note);
    resolvePendingAction(note);
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
          <SearchDropdown
            label="Event Type"
            value={eventType}
            onChange={setEventType}
            placeholder="Choose Event Type"
            options={EVENT_TYPE_OPTIONS}
            triggerId="event-type-select"
          />

          <SearchDatePicker
            label="Event Date"
            value={eventDate}
            onChange={setEventDate}
            placeholder="Choose Event Date"
          />

          <div className="grid grid-cols-2 gap-3">
            <SearchDropdown
              label="Time In"
              value={startTime}
              onChange={setStartTime}
              placeholder="Start time"
              options={TIME_OPTIONS}
              matchTriggerWidth
            />
            <SearchDropdown
              label="Time Out"
              value={endTime}
              onChange={setEndTime}
              placeholder="End time"
              options={TIME_OPTIONS}
              matchTriggerWidth
            />
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
            onClick={requestBookClick}
            disabled={isSubmitting || !detailsComplete}
            className="rounded-xl bg-brand-primary py-3 text-center font-figtree text-[14px] font-semibold text-white shadow-sm transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {tokenAmount > 0 ? `Book & pay ${formatPrice(tokenAmount)}` : "Book now"}
          </button>
          <button
            type="button"
            onClick={requestAddToCart}
            disabled={isSubmitting || !detailsComplete}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-black/15 py-3 font-figtree text-[14px] font-semibold text-brand-950 transition hover:border-black/30 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {justAdded ? (
              editItemId ? (
                "Saved ✓"
              ) : (
                "Added ✓"
              )
            ) : editItemId ? (
              "Save changes"
            ) : inCartItemId ? (
              <>
                <Check className="h-4 w-4" />
                In cart &middot; view cart
              </>
            ) : (
              "Add to cart"
            )}
          </button>
        </div>

        {!detailsComplete && (
          <p className="mt-3 text-center font-figtree text-[12px] font-medium text-error-700">
            Fill in event type, date, time and location to continue
          </p>
        )}

        {cartError && (
          <p className="mt-3 text-center font-figtree text-[12px] font-medium text-error-700">{cartError}</p>
        )}

        <p className="mt-3 text-center font-figtree text-[11px] text-neutral-tertiary">
          Date locked instantly · held safely until setup
        </p>
      </div>

      <VendorNotePromptModal
        isOpen={isNotePromptOpen}
        onClose={() => {
          setIsNotePromptOpen(false);
          setPendingAction(null);
        }}
        onSkip={handleNotePromptSkip}
        onSave={handleNotePromptSave}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthenticated={() => {
          setIsAuthOpen(false);
          requestBookClick();
        }}
      />

      <PriceBreakdownDialog
        isOpen={isBreakdownOpen}
        onClose={() => setIsBreakdownOpen(false)}
        includedItems={includedItems}
        selectedAddons={selectedAddons}
        teamAndEquipmentCharge={teamAndEquipmentCharge}
        teamAndEquipmentBillingUnit={teamAndEquipmentBillingUnit}
        overtimeChargeRate={overtimeChargeRate}
        overtimeBillingUnit={overtimeBillingUnit}
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
