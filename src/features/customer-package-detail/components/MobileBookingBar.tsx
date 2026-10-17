"use client";

import { useEffect, useState } from "react";
import { X, MapPin, Loader2, ChevronDown, ShieldCheck, CheckCircle2 } from "lucide-react";
import { formatPrice } from "../utils/formatPrice";
import { formatDayMonth } from "../utils/cancellationPolicy";
import SearchDatePicker from "@/features/customer-landing/components/SearchDatePicker";
import EventTimingSlots from "./EventTimingSlots";
import LocationServiceability from "./LocationServiceability";
import type { UseBookingFormResult } from "../hooks/useBookingForm";

type StepIndex = 0 | 1 | 2;

function StepBadge({ index, state }: { index: number; state: "done" | "active" | "upcoming" }) {
  if (state === "done") {
    return (
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#ECFDF3]">
        <CheckCircle2 className="h-4 w-4 fill-[#ECFDF3] text-[#008236]" />
      </span>
    );
  }
  return (
    <span
      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg font-figtree text-[12px] font-semibold ${
        state === "active" ? "bg-[#222] text-white" : "bg-[#F4F4F5] text-[#3F3F47]"
      }`}
    >
      {index}
    </span>
  );
}

/**
 * Mobile-only replacement for StickyBookingCard's sidebar card (Figma nodes
 * 2548:28662 onward) — a fixed bottom pill bar that opens a bottom sheet
 * with the same 3-step booking form, each step auto-advancing to the next
 * once filled in. Drives the exact same `form` (useBookingForm) instance
 * StickyBookingCard uses, so picking things here or on desktop never
 * disagrees with the other.
 *
 * Simplification flagged: Figma's Event location step shows a list of
 * nearby-pincode suggestions ("110075 — Dwarka Sector 6, New Delhi" etc.)
 * — there's no pincode-autocomplete endpoint in this codebase to back that
 * with real data, so this keeps the same plain text input + "use my
 * current location" + serviceability feedback the desktop card already
 * uses, rather than inventing fake suggestion rows.
 */
export default function MobileBookingBar({
  form,
  title,
  variantLabel,
  setupsCount,
  packageTotal,
  gstPercent,
  addonsTotal,
  requiresGuestCount = true,
  editItemId,
}: {
  form: UseBookingFormResult;
  title: string;
  variantLabel?: string;
  setupsCount?: number;
  packageTotal: number;
  gstPercent: number;
  addonsTotal: number;
  requiresGuestCount?: boolean;
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
    isSubmitting,
    cartError,
    inCartItemId,
    justAdded,
    liveTokenAmount,
    validEventDate,
    cancellationTiers,
    estimatedTotal,
    guestCountComplete,
    timingComplete,
    detailsComplete,
    requestAddToCart,
    requestBookClick,
  } = form;

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [activeStep, setActiveStep] = useState<StepIndex | null>(0);

  const step0Done = Boolean(eventType);
  const step1Done = Boolean(location.trim());
  const step2Done = Boolean(validEventDate) && timingComplete && guestCountComplete;

  // Auto-advance — "opens as soon as X is selected" (the user's own framing
  // for these Figma iterations).
  useEffect(() => {
    if (activeStep === 0 && step0Done) setActiveStep(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step0Done]);
  useEffect(() => {
    if (activeStep === 1 && step1Done) setActiveStep(2);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step1Done]);
  useEffect(() => {
    if (activeStep === 2 && step2Done) setActiveStep(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step2Done]);

  function openSheet() {
    setIsSheetOpen(true);
    if (!step0Done) setActiveStep(0);
    else if (!step1Done) setActiveStep(1);
    else if (!step2Done) setActiveStep(2);
    else setActiveStep(null);
  }

  function toggleStep(step: StepIndex) {
    setActiveStep((current) => (current === step ? null : step));
  }

  const selectedSlotLabel =
    slotsState.status === "ready"
      ? slotsState.data.slots.find((slot) => slot.value === `${startTime} - ${endTime}`)?.label
      : undefined;

  const dateTimeSummary = validEventDate
    ? `${new Date(validEventDate).toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short" })}${
        selectedSlotLabel ? ` · ${selectedSlotLabel}` : ""
      }`
    : "";

  const barSubtitle = !step0Done
    ? "Add date & time to book"
    : !step1Done
      ? "Add your event location"
      : !step2Done
        ? "Pick a date & time"
        : dateTimeSummary;

  return (
    <>
      {/* Floating sticky bar — Figma node 2548:28662. */}
      <div className="fixed inset-x-4 bottom-4 z-40 lg:hidden">
        <div className="flex items-center gap-2.5 rounded-[32px] border-[0.5px] border-[#E4E4E7] bg-white py-2 pr-2 pl-5 shadow-[0px_8px_28px_0px_rgba(0,0,0,0.16)]">
          <button type="button" onClick={openSheet} className="flex min-w-0 flex-1 flex-col items-start gap-1 text-left">
            <span className="flex items-baseline gap-1">
              <span className="font-figtree text-[18px] font-semibold text-[#222]">{formatPrice(packageTotal)}</span>
              <span className="font-figtree text-[12px] text-[#71717B]">/ setup</span>
            </span>
            <span className="truncate font-figtree text-[12px] text-[#71717B]">{barSubtitle}</span>
          </button>

          <button
            type="button"
            onClick={() => (detailsComplete ? requestBookClick() : openSheet())}
            disabled={isSubmitting}
            className="flex h-12 w-40 shrink-0 items-center justify-center rounded-full bg-brand-primary font-figtree text-[16px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {detailsComplete ? (liveTokenAmount > 0 ? `Book at ${formatPrice(liveTokenAmount)}` : "Book now") : "Book Now"}
          </button>
        </div>
      </div>

      {/* Bottom sheet — Figma nodes 2548:29992 / 30691 / 31449 / 32153, one
          component covering all four since they're the same sheet at
          different steps of the same flow. */}
      {isSheetOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close"
            onClick={() => setIsSheetOpen(false)}
            className="absolute inset-0 bg-black/45"
          />
          <div className="absolute inset-x-0 bottom-0 flex max-h-[90vh] flex-col rounded-t-3xl bg-white">
            <div className="flex shrink-0 flex-col items-center pt-2.5">
              <span className="h-1 w-10 rounded-full bg-[#E4E4E7]" />
            </div>

            <div className="flex shrink-0 items-center justify-between border-b border-[#E4E4E7] px-4 py-3">
              <div className="min-w-0">
                <p className="font-figtree text-[20px] font-semibold text-[#222]">Event details</p>
                <p className="truncate font-figtree text-[12px] text-[#71717B]">
                  {title}
                  {variantLabel ? ` · ${variantLabel}` : ""}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsSheetOpen(false)}
                aria-label="Close"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F4F4F5]"
              >
                <X className="h-[18px] w-[18px] text-[#222]" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-4">
              {/* Step 1 — Event type */}
              <div className="border-b border-[#E4E4E7] py-4">
                <button type="button" onClick={() => toggleStep(0)} className="flex w-full items-center gap-3">
                  <StepBadge index={1} state={step0Done ? "done" : activeStep === 0 ? "active" : "upcoming"} />
                  <span className="min-w-0 flex-1 text-left">
                    <span className="block font-figtree text-[16px] font-medium text-[#222]">Event type</span>
                    {step0Done && activeStep !== 0 && (
                      <span className="block truncate font-figtree text-[14px] text-[#3F3F47]">{eventType}</span>
                    )}
                  </span>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-[#71717B] transition-transform ${activeStep === 0 ? "rotate-180" : ""}`}
                  />
                </button>
                {activeStep === 0 && (
                  <div className="mt-3.5 flex flex-wrap gap-2">
                    {eventTypeOptions.map((option) => {
                      const isSelected = eventType === option.value;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setEventType(option.value)}
                          className={`rounded-full border px-3.5 py-2 font-figtree text-[14px] font-medium ${
                            isSelected
                              ? "border-[#B4112A] bg-[#FDEEF0] text-[#B4112A]"
                              : "border-[#E4E4E7] bg-white text-[#3F3F47]"
                          }`}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Step 2 — Event location */}
              <div className="border-b border-[#E4E4E7] py-4">
                <button type="button" onClick={() => toggleStep(1)} className="flex w-full items-center gap-3">
                  <StepBadge index={2} state={step1Done ? "done" : activeStep === 1 ? "active" : "upcoming"} />
                  <span className="min-w-0 flex-1 text-left">
                    <span className="block font-figtree text-[16px] font-medium text-[#222]">Event location</span>
                    {step1Done && activeStep !== 1 ? (
                      <span className="block truncate font-figtree text-[14px] text-[#3F3F47]">{location}</span>
                    ) : activeStep !== 1 ? (
                      <span className="block font-figtree text-[14px] text-[#9F9FA9]">Venue pincode or city</span>
                    ) : null}
                  </span>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-[#71717B] transition-transform ${activeStep === 1 ? "rotate-180" : ""}`}
                  />
                </button>
                {activeStep === 1 && (
                  <div className="mt-3.5">
                    <div className="relative">
                      <MapPin className="pointer-events-none absolute top-1/2 left-3.5 h-[18px] w-[18px] -translate-y-1/2 text-[#71717B]" />
                      <input
                        type="text"
                        value={location}
                        onChange={(event) => {
                          setLocation(event.target.value);
                          setIsLocationAutoFilled(false);
                          setLocationDetectError(null);
                        }}
                        onFocus={() => {
                          if (isLocationAutoFilled) {
                            setLocation("");
                            setIsLocationAutoFilled(false);
                          }
                        }}
                        placeholder="Venue pincode or city"
                        className="h-12 w-full rounded-xl border-[1.5px] border-[#F0596F] bg-white pr-4 pl-10 font-figtree text-[16px] text-[#222] outline-none placeholder:text-[#9F9FA9]"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => detectAndFillLocation(true)}
                      disabled={isDetectingLocation}
                      className="mt-2.5 flex items-center gap-1.5 font-figtree text-[14px] font-medium text-[#F0596F] disabled:opacity-60"
                    >
                      {isDetectingLocation ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
                      Use my current location
                    </button>
                    {locationDetectError && (
                      <p className="mt-1.5 font-figtree text-[11px] font-medium text-error-700">{locationDetectError}</p>
                    )}
                    <LocationServiceability state={serviceability} />
                  </div>
                )}
              </div>

              {/* Step 3 — Date & time */}
              <div className={step2Done || activeStep === 2 ? "border-b border-[#E4E4E7] py-4" : "py-4"}>
                <button type="button" onClick={() => toggleStep(2)} className="flex w-full items-center gap-3">
                  <StepBadge index={3} state={step2Done ? "done" : activeStep === 2 ? "active" : "upcoming"} />
                  <span className="min-w-0 flex-1 text-left">
                    <span className="block font-figtree text-[16px] font-medium text-[#222]">Date &amp; time</span>
                    {step2Done && activeStep !== 2 ? (
                      <span className="block truncate font-figtree text-[14px] text-[#3F3F47]">{dateTimeSummary}</span>
                    ) : activeStep !== 2 ? (
                      <span className="block font-figtree text-[14px] text-[#9F9FA9]">Pick a date and a slot</span>
                    ) : null}
                  </span>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-[#71717B] transition-transform ${activeStep === 2 ? "rotate-180" : ""}`}
                  />
                </button>
                {activeStep === 2 && (
                  <div className="mt-3.5 flex flex-col gap-4">
                    <SearchDatePicker
                      label="Date"
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
                        <span className="mb-1.5 block font-figtree text-[14px] font-medium text-[#3F3F47]">
                          Guest count
                        </span>
                        <input
                          type="number"
                          min={1}
                          value={guestCount}
                          onChange={(event) => setGuestCount(event.target.value)}
                          placeholder="Number of guests"
                          className="h-12 w-full rounded-xl border border-[#E4E4E7] px-4 font-figtree text-[16px] text-[#222] outline-none focus:border-[#F0596F]"
                        />
                      </label>
                    )}
                  </div>
                )}
              </div>

              {/* "Your booking" summary (Figma node 2548:32152) — shown once every step above is done. */}
              {detailsComplete && (
                <div className="mt-4 flex flex-col gap-2.5 rounded-2xl border border-[#E4E4E7] bg-[#FAFAFA] p-4">
                  <p className="font-figtree text-[16px] font-semibold text-[#222]">Your booking</p>
                  <div className="flex items-center justify-between font-figtree text-[14px]">
                    <span className="text-[#3F3F47]">
                      {variantLabel}
                      {setupsCount ? ` · ${setupsCount} setup${setupsCount > 1 ? "s" : ""}` : ""}
                    </span>
                    <span className="text-[#222]">{formatPrice(packageTotal - addonsTotal)}</span>
                  </div>
                  <div className="flex items-center justify-between font-figtree text-[14px]">
                    <span className="text-[#3F3F47]">Add-ons</span>
                    <span className="text-[#71717B]">{addonsTotal > 0 ? formatPrice(addonsTotal) : "—"}</span>
                  </div>
                  <hr className="border-[#E4E4E7]" />
                  <div className="flex items-center justify-between">
                    <span>
                      <span className="block font-figtree text-[16px] font-semibold text-[#222]">Total</span>
                      <span className="block font-figtree text-[11px] text-[#71717B] underline">
                        incl. {gstPercent}% GST
                      </span>
                    </span>
                    <span className="font-figtree text-[20px] font-semibold text-[#222]">
                      {formatPrice(estimatedTotal)}
                    </span>
                  </div>
                  {cancellationTiers && (
                    <div className="flex items-center gap-2 rounded-xl bg-[#ECFDF3] px-3 py-2.5">
                      <ShieldCheck className="h-4 w-4 shrink-0 text-[#067647]" />
                      <p className="font-figtree text-[12px] leading-[17px] font-medium text-[#067647]">
                        Free cancellation till {formatDayMonth(cancellationTiers.fullRefundCutoff)}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {cartError && (
                <p className="mt-3 font-figtree text-[12px] font-medium text-error-700">{cartError}</p>
              )}
            </div>

            {/* Sheet footer (pinned) */}
            <div className="shrink-0 border-t border-[#E4E4E7] bg-white px-4 pt-3 pb-7">
              {detailsComplete ? (
                <>
                  <div className="flex gap-2.5">
                    <button
                      type="button"
                      onClick={requestAddToCart}
                      disabled={isSubmitting}
                      className="flex h-12 flex-1 items-center justify-center rounded-full border border-[#E4E4E7] font-figtree text-[16px] font-semibold text-[#3F3F47] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {justAdded
                        ? editItemId
                          ? "Saved ✓"
                          : "Added ✓"
                        : editItemId
                          ? "Save changes"
                          : inCartItemId
                            ? "View cart"
                            : "Add to cart"}
                    </button>
                    <button
                      type="button"
                      onClick={requestBookClick}
                      disabled={isSubmitting}
                      className="flex h-12 flex-1 items-center justify-center rounded-full bg-brand-primary font-figtree text-[16px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {liveTokenAmount > 0 ? `Book at ${formatPrice(liveTokenAmount)}` : "Book now"}
                    </button>
                  </div>
                  {liveTokenAmount > 0 && (
                    <p className="mt-2 text-center font-figtree text-[12px] text-[#71717B]">
                      Pay {formatPrice(liveTokenAmount)} today · {formatPrice(Math.max(estimatedTotal - liveTokenAmount, 0))}{" "}
                      due before your event
                    </p>
                  )}
                </>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-figtree text-[18px] font-semibold text-[#222]">{formatPrice(packageTotal)}</p>
                    <p className="truncate font-figtree text-[12px] text-[#71717B]">
                      {!step0Done
                        ? "Pick an event type to continue"
                        : !step1Done
                          ? "Add your event location to continue"
                          : "Pick a date and time to continue"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (activeStep === 0 && step0Done) setActiveStep(1);
                      else if (activeStep === 1 && step1Done) setActiveStep(2);
                    }}
                    disabled={
                      activeStep === null ||
                      (activeStep === 0 && !step0Done) ||
                      (activeStep === 1 && !step1Done) ||
                      (activeStep === 2 && !step2Done)
                    }
                    className="flex h-12 flex-1 items-center justify-center rounded-full bg-brand-primary font-figtree text-[16px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Continue
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
