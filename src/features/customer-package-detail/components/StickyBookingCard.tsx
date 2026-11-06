"use client";

import { Calendar, MapPin, ShieldCheck, Check, Users, Loader2 } from "lucide-react";
import AuthModal from "@/features/customer-auth/components/AuthModal";
import type { IncludedItemEntry, SelectedAddon } from "../types";
import { formatPrice } from "../utils/formatPrice";
import { formatDayMonth } from "../utils/cancellationPolicy";
import PriceBreakdownDialog from "./PriceBreakdownDialog";
import CancellationPolicyDialog from "./CancellationPolicyDialog";
import VendorNotePromptModal from "./VendorNotePromptModal";
import SearchDropdown from "@/features/customer-landing/components/SearchDropdown";
import SearchDatePicker from "@/features/customer-landing/components/SearchDatePicker";

import EventTimingSlots from "./EventTimingSlots";
import LocationServiceability from "./LocationServiceability";
import type { UseBookingFormResult } from "../hooks/useBookingForm";

export default function StickyBookingCard({
  form,
  packageTotal,
  overtimeChargeRate,
  overtimeBillingUnit,
  gstPercent,
  requiresGuestCount = true,
  includedItems,
  selectedAddons,
  cancellationPolicyText,
  editItemId,
}: {
  /** Shared booking state/logic — one instance, lifted to PackageDetailPage and passed to both this (desktop) card and the mobile sticky bar/sheet, so there's a single source of truth for the in-flight booking rather than two independently-drifting copies of the same form. */
  form: UseBookingFormResult;
  packageTotal: number;
  overtimeChargeRate: number;
  overtimeBillingUnit?: string;
  gstPercent: number;
  /** Decorator / DJ / Photographer hide the guest-count field (and don't require it). */
  requiresGuestCount?: boolean;
  includedItems: IncludedItemEntry[];
  selectedAddons: SelectedAddon[];
  cancellationPolicyText?: string;
  /** Set when editing an existing cart line (see PackageDetailPage) — only used here to vary the Save/Add-to-cart button copy. */
  editItemId?: string;
}) {
  const {
    eventTypeOptions,
    eventType,
    setEventType,
    eventDate,
    setEventDate,
    startTime,
    endTime,
    onSelectSlot,
    slotsState,
    serviceability,
    location,
    setLocation,
    isLocationAutoFilled,
    setIsLocationAutoFilled,
    isDetectingLocation,
    locationDetectError,
    setLocationDetectError,
    detectAndFillLocation,
    guestCount,
    setGuestCount,
    isBreakdownOpen,
    setIsBreakdownOpen,
    isCancellationOpen,
    setIsCancellationOpen,
    justAdded,
    isAuthOpen,
    setIsAuthOpen,
    isSubmitting,
    cartError,
    inCartItemId,
    isNotePromptOpen,
    setIsNotePromptOpen,
    setPendingAction,
    gstAmount,
    liveTokenAmount,
    validEventDate,
    cancellationTiers,
    estimatedTotal,
    convenienceFee,
    conveniencePreview,
    detailsComplete,
    locationNotServiceable,
    requestAddToCart,
    requestBookClick,
    handleNotePromptSkip,
    handleNotePromptSave,
  } = form;

  return (
    <div id="booking-card" className="relative">
      {/* top-0 lets this card scroll all the way up under the fixed navbar
          (z-50, 71.6px tall) instead of stopping below it — trades a slice
          of the card's own top being covered for noticeably more of its
          bottom (the Book Now button) staying inside the viewport. */}
      <div className="sticky top-0 z-10 rounded-2xl border border-black/10 bg-white p-6 shadow-lg shadow-black/[0.04]">
        <button
          type="button"
          onClick={() => setIsBreakdownOpen(true)}
          className="mb-6 block w-full text-left"
        >
          <div className="mb-1 flex items-end gap-2">
            <h2 className="font-figtree text-[24px] font-bold text-brand-950">
              from {formatPrice(estimatedTotal)}
            </h2>
            {gstPercent > 0 && (
              <span className="mb-1 font-figtree text-[11px] text-neutral-tertiary">incl. {gstPercent}% GST</span>
            )}
          </div>
          <p className="font-figtree text-[12px] text-neutral-tertiary">tap the price for the full breakdown</p>
        </button>

        <form className="space-y-4" onSubmit={(event) => event.preventDefault()}>
          <SearchDropdown
            label="Event Type"
            value={eventType}
            onChange={setEventType}
            placeholder="Choose Event Type"
            options={eventTypeOptions}
            triggerId="event-type-select"
            variant="outlined"
          />

          <label className="block">
            <span className="mb-1.5 block font-figtree text-[14px] leading-[16.5px] font-medium tracking-[-0.01em] text-[#3F3F47]">
              Event location
            </span>
            <div className="relative">
              <input
                type="text"
                value={location}
                onChange={(event) => {
                  setLocation(event.target.value);
                  setIsLocationAutoFilled(false);
                  setLocationDetectError(null);
                }}
                onFocus={() => {
                  // Clicking in to edit the auto-detected guess clears it
                  // outright, rather than leaving the customer to
                  // select-all/backspace it before typing their real one.
                  if (isLocationAutoFilled) {
                    setLocation("");
                    setIsLocationAutoFilled(false);
                  }
                }}
                placeholder="Enter your pincode or city"
                className="h-11 w-full rounded-2xl border border-[#E4E4E7] bg-white pr-11 pl-4 font-figtree text-[14px] text-[#3F3F47] outline-none placeholder:text-[#9F9FA9] focus:border-brand-primary"
              />
              <button
                type="button"
                onClick={() => detectAndFillLocation(true)}
                disabled={isDetectingLocation}
                aria-label="Use my current location"
                className="absolute top-1/2 right-4 -translate-y-1/2 text-[#71717B] transition-colors hover:text-brand-primary disabled:cursor-not-allowed"
              >
                {isDetectingLocation ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <MapPin className="h-5 w-5" />
                )}
              </button>
            </div>
            {locationDetectError && (
              <p className="mt-1.5 font-figtree text-[11px] font-medium text-error-700">{locationDetectError}</p>
            )}
            <LocationServiceability state={serviceability} />
          </label>

          <SearchDatePicker
            label="Event date"
            value={eventDate}
            onChange={setEventDate}
            placeholder="Choose Event Date"
            variant="quick"
          />

          <EventTimingSlots
            state={slotsState}
            selectedValue={startTime && endTime ? `${startTime} - ${endTime}` : ""}
            onSelect={onSelectSlot}
          />

          {requiresGuestCount && (
            <label className="block">
              <span className="mb-1.5 block font-figtree text-[11px] font-semibold tracking-wide text-neutral-tertiary uppercase">
                Guest Count
              </span>
              <div className="relative">
                <input
                  type="number"
                  min={1}
                  value={guestCount}
                  onChange={(event) => setGuestCount(event.target.value)}
                  placeholder="Number of guests"
                  className="w-full rounded-lg border border-black/15 py-2 pr-10 pl-3 font-figtree text-[13px] text-brand-950 outline-none focus:border-brand-primary"
                />
                <Users className="pointer-events-none absolute top-2.5 right-3 h-4 w-4 text-neutral-tertiary" />
              </div>
            </label>
          )}
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
            {liveTokenAmount > 0 ? `Book & pay ${formatPrice(liveTokenAmount)}` : "Book now"}
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
            {locationNotServiceable
              ? serviceability.status === "ready" && !serviceability.data.serviceable
                ? "This vendor doesn't serve your location — try a different address"
                : "Add a 6-digit pincode to your location so we can confirm this vendor serves it"
              : requiresGuestCount
                ? "Fill in event type, date, time, location and guest count to continue"
                : "Fill in event type, date, time and location to continue"}
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
        overtimeChargeRate={overtimeChargeRate}
        overtimeBillingUnit={overtimeBillingUnit}
        subtotal={packageTotal}
        gstPercent={gstPercent}
        gstAmount={gstAmount}
        convenienceFee={convenienceFee}
        convenienceFeePending={Boolean(validEventDate && conveniencePreview && !conveniencePreview.configured)}
        convenienceFeeReason={conveniencePreview?.reason ?? null}
        convenienceFeeBreakdown={conveniencePreview?.breakdown ?? null}
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
