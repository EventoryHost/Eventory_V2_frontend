"use client";

import Image from "next/image";
import { MapPin, ShieldCheck, Users, Loader2 } from "lucide-react";
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
import LocationSuggestionList from "./LocationSuggestionList";
import { useLocationSuggestions } from "../hooks/useLocationSuggestions";
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
  packageTitle,
  categoryLabel,
  teamAndEquipmentCharge,
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
  /** Shown in the price breakdown's header and package line. */
  packageTitle: string;
  categoryLabel: string;
  /** The vendor's flat crew and equipment charge (0 when none), shown as its own line in the price breakdown. */
  teamAndEquipmentCharge: number;
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

  const suggest = useLocationSuggestions(location, (value) => {
    setLocation(value);
    setIsLocationAutoFilled(false);
    setLocationDetectError(null);
  });

  return (
    <div id="booking-card" className="relative">
      {/* top-0 lets this card scroll all the way up under the fixed navbar
          (z-50, 71.6px tall) instead of stopping below it — trades a slice
          of the card's own top being covered for noticeably more of its
          bottom (the Book Now button) staying inside the viewport. */}
      <div className="sticky top-0 z-10 rounded-[22px] bg-white px-5 py-4 shadow-[0_5px_8px_rgba(0,0,0,0.08)]">
        {/* Figma node 3233:26781 — price (tap for breakdown) with a "Token
            Required" pill on the right when a token amount applies. */}
        <div className="mb-5">
          <div className="flex items-center justify-between gap-3">
            <button type="button" onClick={() => setIsBreakdownOpen(true)} className="text-left">
              <h2 className="font-figtree text-[24px] leading-[33.6px] font-semibold text-[#222] underline decoration-[#ddd]">
                from {formatPrice(estimatedTotal)}
              </h2>
            </button>
            {liveTokenAmount > 0 && (
              <span className="shrink-0 rounded-full border border-[#00C950] bg-gradient-to-r from-[#F0FDF4] to-white px-2 py-0.5 font-figtree text-[14px] leading-5 font-medium text-[#008236]">
                Token Required
              </span>
            )}
          </div>
          <p className="mt-2 font-figtree text-[12px] leading-4 text-[#717171]">Tap the price for the full breakdown</p>
        </div>

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
            <span className="mb-2 block font-figtree text-[14px] leading-[16.5px] font-medium tracking-[-0.01em] text-[#3F3F47]">
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
                  suggest.onUserType();
                }}
                onKeyDown={suggest.handleKeyDown}
                onBlur={() => suggest.setOpen(false)}
                autoComplete="off"
                role="combobox"
                aria-expanded={suggest.open}
                aria-autocomplete="list"
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
                className="w-full rounded-xl border border-[#E4E4E7] bg-white py-3 pr-11 pl-3.5 font-figtree text-[14px] leading-5 text-[#3F3F47] outline-none placeholder:text-[#9F9FA9] focus:border-brand-primary"
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
              {suggest.open && (
                <LocationSuggestionList
                  items={suggest.items}
                  activeIndex={suggest.activeIndex}
                  onPick={suggest.pick}
                  onHover={suggest.setActiveIndex}
                />
              )}
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
            title={/decor/i.test(categoryLabel) ? "Installation Time" : undefined}
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

        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={requestAddToCart}
            disabled={isSubmitting || !detailsComplete}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-[#E4E4E7] px-6 py-2.5 font-figtree text-[16px] leading-6 font-semibold text-[#3F3F47] transition hover:border-black/30 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {justAdded ? (
              editItemId ? (
                "Saved ✓"
              ) : (
                "Added ✓"
              )
            ) : editItemId ? (
              "Save changes"
            ) : (
              "Add to Cart"
            )}
          </button>
          <button
            type="button"
            onClick={requestBookClick}
            disabled={isSubmitting || !detailsComplete}
            className="flex-1 rounded-full bg-[linear-gradient(-5.5deg,#D92640_14%,#F0596F_86%)] px-6 py-2.5 text-center font-figtree text-[16px] leading-6 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {liveTokenAmount > 0 ? `Book at ${formatPrice(liveTokenAmount)}` : "Book now"}
          </button>
        </div>

        {!detailsComplete && (
          <p className="mt-3 text-center font-figtree text-[12px] font-medium text-error-700">
            {locationNotServiceable
              ? serviceability.status === "ready" && !serviceability.data.serviceable
                ? "This vendor doesn't serve your location — try a different address"
                : "Pick a locality from the suggestions, or add a 6-digit pincode, so we can confirm this vendor serves it"
              : requiresGuestCount
                ? "Fill in event type, date, time, location and guest count to continue"
                : "Fill in event type, date, time and location to continue"}
          </p>
        )}

        {cartError && (
          <p className="mt-3 text-center font-figtree text-[12px] font-medium text-error-700">{cartError}</p>
        )}

        {validEventDate && cancellationTiers ? (
          <button
            type="button"
            onClick={() => setIsCancellationOpen(true)}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-success-700/20 bg-success-subtle px-3 py-3 font-figtree text-[12px] font-medium text-success-700 transition hover:border-success-700/40"
          >
            <ShieldCheck className="h-4 w-4" />
            Free cancellation till {formatDayMonth(cancellationTiers.fullRefundCutoff)}
          </button>
        ) : (
          <div className="mt-4 flex items-center justify-center gap-2 font-figtree text-[14px] leading-5 text-[#5E5E5E]">
            <Image src="/images/customer/package-detail/calendar-search.svg" alt="" width={18} height={18} />
            Pick a date to see your free-cancellation cut-off
          </div>
        )}
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
        packageTitle={packageTitle}
        categoryLabel={categoryLabel}
        guestCount={requiresGuestCount ? guestCount : ""}
        teamAndEquipmentCharge={teamAndEquipmentCharge}
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
