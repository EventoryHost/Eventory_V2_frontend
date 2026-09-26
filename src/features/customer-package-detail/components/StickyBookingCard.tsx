"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, MapPin, ShieldCheck, Check, Users, Loader2 } from "lucide-react";
import AuthModal from "@/features/customer-auth/components/AuthModal";
import { useCustomerSession } from "@/features/customer-auth/hooks/useCustomerSession";
import { addCartItem, getCart, updateCartItem, type RawCartEventDetails, type RawCustomizeRequest } from "@/lib/customerCartApi";
import { getConvenienceFeePreview, getPackageServiceability, getPackageSlots, type RawPdpConvenienceFee } from "@/lib/customerPackageDetailApi";
import { detectCurrentLocation } from "@/lib/geocoding";
import { ApiError } from "@/lib/apiClient";
import type { CustomizeRequest, IncludedItemEntry, SelectedAddon } from "../types";
import { formatPrice } from "../utils/formatPrice";
import { formatDayMonth, getCancellationTiers } from "../utils/cancellationPolicy";
import PriceBreakdownDialog from "./PriceBreakdownDialog";
import CancellationPolicyDialog from "./CancellationPolicyDialog";
import VendorNotePromptModal from "./VendorNotePromptModal";
import SearchDropdown from "@/features/customer-landing/components/SearchDropdown";
import SearchDatePicker from "@/features/customer-landing/components/SearchDatePicker";
import { useSelectedCity, setSelectedCity } from "@/features/customer-landing/hooks/useSelectedCity";

import EventTimingSlots, { type SlotsState } from "./EventTimingSlots";
import LocationServiceability, { type ServiceabilityState } from "./LocationServiceability";

export default function StickyBookingCard({
  packageId,
  packageTotal,
  teamAndEquipmentCharge,
  teamAndEquipmentBillingUnit,
  overtimeChargeRate,
  overtimeBillingUnit,
  gstPercent,
  tokenAmount,
  tokenType,
  tokenValue,
  requiresGuestCount = true,
  eventCategories,
  selectedAddons,
  includedItems,
  customizeRequests,
  vendorNote,
  onVendorNoteChange,
  vendorNoteAttachments,
  onVendorNoteAttachmentsChange,
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
  /** Server-computed at page load, before any add-ons — only used as a fallback when tokenType/tokenValue are null (no token configured). See liveTokenAmount below for the figure actually shown. */
  tokenAmount: number;
  tokenType: "Percentage" | "Fixed" | null;
  tokenValue: number | null;
  /** Decorator / DJ / Photographer hide the guest-count field (and don't require it). */
  requiresGuestCount?: boolean;
  /** This package's own event categories (step1_eventAndCrew.eventCategories, via PackageDetail.eventCategories) — scopes the Event Type dropdown to occasions this package is actually tagged for, instead of a fixed made-up list. */
  eventCategories: string[];
  selectedAddons: SelectedAddon[];
  includedItems: IncludedItemEntry[];
  /** The PDP "Customize items" workshop's live requests (useCustomizeWorkshop, lifted up in PackageDetailPage) — sent as customizeRequests in the add/update cart payload below so they're no longer silently discarded on navigation. */
  customizeRequests: CustomizeRequest[];
  vendorNote: string;
  onVendorNoteChange: (note: string) => void;
  /** Uploaded S3 URLs for the "Notes for vendor" section's image attachments — lifted up to PackageDetailPage alongside vendorNote so both the inline PDP section and this card's own prompt modal write to the same list. */
  vendorNoteAttachments: string[];
  onVendorNoteAttachmentsChange: (attachments: string[]) => void;
  cancellationPolicyText?: string;
  /** Set when editing an existing cart line (see PackageDetailPage) — routes saves to updateCartItem instead of creating a new cart item. */
  editItemId?: string;
  /** This cart item's already-saved event details, to prefill the fields below instead of starting blank. */
  prefillEventDetails?: RawCartEventDetails;
}) {
  const eventTypeOptions = useMemo(
    () => eventCategories.map((category) => ({ value: category, label: category })),
    [eventCategories]
  );
  const [eventType, setEventType] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [slotsState, setSlotsState] = useState<SlotsState>({ status: "idle" });
  const [serviceability, setServiceability] = useState<ServiceabilityState>({ status: "idle" });
  // Latest selected slot, readable from the slots-fetch effect without
  // making that effect re-run on every selection.
  const selectedSlotRef = useRef("");
  selectedSlotRef.current = startTime && endTime ? `${startTime} - ${endTime}` : "";
  const [location, setLocation] = useState("");
  // True while `location` still holds the auto-detected value untouched —
  // clicking into the field then clears it outright (rather than leaving
  // the customer to select-all/backspace it themselves) so they can just
  // start typing their real address straight away.
  const [isLocationAutoFilled, setIsLocationAutoFilled] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [locationDetectError, setLocationDetectError] = useState<string | null>(null);
  const [guestCount, setGuestCount] = useState("");
  const [isBreakdownOpen, setIsBreakdownOpen] = useState(false);
  const [isCancellationOpen, setIsCancellationOpen] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cartError, setCartError] = useState<string | null>(null);
  const [inCartItemId, setInCartItemId] = useState<string | null>(null);
  const [isNotePromptOpen, setIsNotePromptOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<"cart" | "book" | null>(null);
  const [conveniencePreview, setConveniencePreview] = useState<RawPdpConvenienceFee | null>(null);
  const router = useRouter();
  const { isLoggedIn } = useCustomerSession();
  // Shared with the navbar's own location picker (useSelectedCity.ts) —
  // module-scoped, so mounting this hook here doesn't fire a second browser
  // geolocation request; it just reads the navbar's own in-flight/already-
  // resolved result (or triggers the ONE shared request if neither has run
  // yet). See the mount effect below for why this replaced this card's own
  // independent detectCurrentLocation() call.
  const { city: navbarCity } = useSelectedCity();

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
    if (prefillEventDetails.location) {
      setLocation(prefillEventDetails.location);
      // This is the customer's own previously-saved address, not an
      // auto-detected guess — focusing the field shouldn't wipe it.
      setIsLocationAutoFilled(false);
    }
    if (prefillEventDetails.guestCount != null) setGuestCount(String(prefillEventDetails.guestCount));
  }, [prefillEventDetails]);

  // Same auto-detect flow as the navbar's location picker (see
  // useSelectedCity.ts / lib/geocoding.ts), and skipped entirely once
  // editItemId is known (editing an existing cart line prefills its own
  // real saved location instead). On mount this stays quiet on failure —
  // same "best-effort default" call the navbar makes — but the explicit
  // icon click always surfaces why it didn't work (denied/imprecise/
  // unsupported/error), the same messages LocationPickerModal shows,
  // instead of just doing nothing with no visible feedback.
  async function detectAndFillLocation(showErrors: boolean) {
    setIsDetectingLocation(true);
    if (showErrors) setLocationDetectError(null);
    const outcome = await detectCurrentLocation();
    setIsDetectingLocation(false);
    if (outcome.status === "success") {
      setLocation(outcome.label);
      setIsLocationAutoFilled(true);
      // Keep the navbar's shared value in sync too — otherwise a manual
      // re-detect here (a fresher/more precise fix than whatever the
      // navbar has) would silently drift the two apart again, the exact
      // "different address than the navbar" bug this card's mount effect
      // was rewritten to avoid.
      setSelectedCity(outcome.label);
      return;
    }
    if (!showErrors) return;
    setLocationDetectError(
      outcome.status === "denied"
        ? "Location access was denied — allow it in your browser, or type your address instead."
        : outcome.status === "imprecise"
          ? "Couldn't get a precise enough fix — try typing your address instead."
          : outcome.status === "unsupported"
            ? "Your browser doesn't support location detection — type your address instead."
            : "Couldn't detect your location — try typing your address instead."
    );
  }

  // REAL BUG FIXED (2026-09-26, product-manager-reported): this used to run
  // its own independent detectCurrentLocation() call on every PDP mount —
  // a second, separate browser geolocation request alongside the navbar's
  // own auto-detect (useSelectedCity.ts). Two independent fixes for the
  // same "where is the customer" question don't always agree (different
  // GPS/network fix at a slightly different moment), so the field here
  // could silently show a different place than the navbar, and could fail
  // with "imprecise" even when the navbar's own attempt had already
  // succeeded moments earlier. Reading the navbar's shared value instead —
  // rather than asking the browser twice — makes both the mismatch and
  // most of the spurious "imprecise" failures structurally impossible: at
  // most one browser geolocation request ever fires per page load,
  // deduped by useSelectedCity's own module-level guard, and this field
  // always shows exactly what the navbar shows.
  useEffect(() => {
    if (editItemId) return;
    if (!navbarCity) return;
    // Only auto-fill while the field is still blank or still holding a
    // previous auto-fill — never stomp something the customer typed
    // themselves (see the onFocus handler below, which is the only other
    // place isLocationAutoFilled goes back to false).
    if (location && !isLocationAutoFilled) return;
    setLocation(navbarCity);
    setIsLocationAutoFilled(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editItemId, navbarCity]);

  const gstAmount = Math.round((packageTotal * gstPercent) / 100);
  // Recomputed live off the current packageTotal (which already reacts to
  // add-ons — see PackageDetailPage's packageTotal) instead of the static
  // `tokenAmount` prop from page load, which only ever reflected the price
  // before any add-ons were picked and never updated afterward — that's
  // exactly why this button used to show the pre-add-on figure until the
  // customer went to cart and saw the real one there instead.
  const tokenBase = packageTotal + gstAmount;
  const liveTokenAmount =
    tokenType === "Percentage" && tokenValue != null
      ? Math.round((tokenBase * tokenValue) / 100)
      : tokenType === "Fixed" && tokenValue != null
        ? Math.min(tokenValue, tokenBase)
        : tokenAmount;
  const validEventDate = eventDate && !isNaN(Date.parse(eventDate)) ? eventDate : null;
  const cancellationTiers = validEventDate ? getCancellationTiers(validEventDate) : null;

  // Platform fee depends on the event date (and the vendor/price band), so
  // it can only be previewed once a date is picked — the page itself is
  // server-rendered with none. Re-fetched per date, cleared when it's unset.
  // `configured: false` means "no date yet", not "fee is 0".
  useEffect(() => {
    if (!validEventDate) {
      setConveniencePreview(null);
      return;
    }
    let cancelled = false;
    getConvenienceFeePreview(packageId, validEventDate).then((preview) => {
      if (!cancelled) setConveniencePreview(preview);
    });
    return () => {
      cancelled = true;
    };
  }, [packageId, validEventDate]);

  // Is this vendor available at the customer's event location? Runs once the
  // location text (typed, auto-detected, or prefilled) contains a 6-digit
  // pincode — the endpoint 400s without one, so no pincode just shows a
  // prompt to add one. Debounced so typing doesn't fire a request per key.
  // Informational only: booking isn't blocked on the result.
  useEffect(() => {
    const trimmed = location.trim();
    if (!trimmed) {
      setServiceability({ status: "idle" });
      return;
    }
    const pincode = trimmed.match(/\b\d{6}\b/)?.[0];
    if (!pincode) {
      setServiceability({ status: "no-pincode" });
      return;
    }
    let cancelled = false;
    setServiceability({ status: "loading" });
    const timer = setTimeout(() => {
      getPackageServiceability(packageId, pincode)
        .then((data) => {
          if (!cancelled) setServiceability({ status: "ready", data });
        })
        .catch(() => {
          if (!cancelled) setServiceability({ status: "error" });
        });
    }, 500);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [packageId, location]);

  // The vendor's slots for the picked date. Re-fetched whenever the date
  // changes; a previously selected slot that the new date doesn't offer
  // (or offers as unavailable) is cleared, while a still-valid one — e.g.
  // the one prefilled when editing a cart item — is kept.
  useEffect(() => {
    if (!validEventDate) {
      setSlotsState({ status: "idle" });
      return;
    }
    let cancelled = false;
    setSlotsState({ status: "loading" });
    getPackageSlots(packageId, validEventDate)
      .then((data) => {
        if (cancelled) return;
        setSlotsState({ status: "ready", data });
        const stillOffered = data.slots.some(
          (slot) => slot.available && slot.value === selectedSlotRef.current
        );
        if (!stillOffered) {
          setStartTime("");
          setEndTime("");
        }
      })
      .catch(() => {
        if (!cancelled) setSlotsState({ status: "error" });
      });
    return () => {
      cancelled = true;
    };
  }, [packageId, validEventDate]);

  const convenienceFee =
    conveniencePreview?.configured && validEventDate ? conveniencePreview.fee : 0;
  const estimatedTotal = packageTotal + gstAmount + convenienceFee;
  const parsedGuestCount = Number(guestCount);
  const validGuestCount = guestCount.trim() && Number.isFinite(parsedGuestCount) && parsedGuestCount > 0;
  // Cart's own "Event Details Missing" warning used to exist because this
  // form never actually required (or even collected) a guest count, so
  // every cart item was missing it regardless of what the customer filled
  // in here — requiring it here instead is the real fix; see WarningCard's
  // removal in CartPageContent.tsx. Decorator / DJ / Photographer opt out
  // entirely (requiresGuestCount false) — the field is hidden and not required.
  const guestCountComplete = requiresGuestCount ? Boolean(validGuestCount) : true;
  // Timing comes from the vendor's own slots for the picked date. FULL_DAY
  // packages have none to pick; TIME_SLOTS packages need one chosen; and
  // nothing is bookable until the slot lookup has actually answered (or if
  // that date is unavailable), so the button can't be used on a guess.
  const timingComplete =
    slotsState.status === "ready" &&
    slotsState.data.dayAvailable &&
    // Full-day packages now get generated slots too, so a slot is needed
    // whenever any are offered.
    (slotsState.data.slots.length === 0 || Boolean(startTime && endTime));
  const detailsComplete = Boolean(
    eventType && validEventDate && timingComplete && location.trim() && guestCountComplete
  );

  function buildCartPayload(noteOverride?: string, noteAttachmentsOverride?: string[]) {
    const timeSlot =
      // The offered slot's value, rebuilt from the same "HH:MM - HH:MM" pair
      // it was split from — the server compares it against its own slots.
      slotsState.status === "ready" && slotsState.data.slots.length > 0 && startTime && endTime
        ? `${startTime} - ${endTime}`
        : undefined;
    const note = noteOverride ?? vendorNote;
    const noteAttachments = noteAttachmentsOverride ?? vendorNoteAttachments;
    return {
      packageId,
      date: validEventDate ?? undefined,
      timeSlot,
      location: location || undefined,
      eventType: eventType || undefined,
      guests: requiresGuestCount && validGuestCount ? parsedGuestCount : undefined,
      specialRequest: note || undefined,
      noteAttachments: noteAttachments.length > 0 ? noteAttachments : undefined,
      selectedAddOns: selectedAddons.map((addon) => ({
        addOnId: addon.id,
        name: addon.title,
        price: addon.price,
        quantity: addon.quantity,
        // category/subCategory come straight from the addon's own catalog
        // entry (stable facts, not a per-booking choice). color is the
        // specific swatch the customer picked in AddonDetailsModal — the
        // one piece that's genuinely a selection, not catalog data — left
        // unset when this addon has no color options at all.
        category: addon.category || undefined,
        subCategory: addon.subCategory || undefined,
        color: addon.color,
        image: addon.image,
      })),
      // Real, persisted backend field (CartItem.js's customizeRequestSchema)
      // that the PDP's "Customize items" workshop never actually sent here
      // before — its requests were computed correctly (useCustomizeWorkshop)
      // but simply discarded on navigation, which is why nothing ever
      // showed up in booking summary despite that read-side already working.
      customizeRequests: customizeRequests.map((request) => ({
        setupId: request.setupId,
        itemId: request.itemId,
        requestType: request.requestType,
        label: request.item.label,
        quantity: request.item.qty,
        type: request.item.type,
        // Real colour names, not the slugified ids useCustomizeWorkshop uses
        // internally — that's what the backend schema and vendor-facing
        // display expect.
        colours: request.item.colours?.map(
          (id) => request.item.colourOptions?.find((c) => c.id === id)?.label ?? id
        ),
        volume: request.item.volume,
      })) satisfies RawCustomizeRequest[],
    };
  }

  // A 400 from add/update usually means the chosen slot was taken or no
  // longer offered since it was picked — refresh the slots, drop the
  // selection, and ask the customer to pick again.
  async function handleCartError(error: unknown, fallback: string) {
    if (error instanceof ApiError && error.status === 400 && validEventDate && slotsState.status === "ready") {
      try {
        const data = await getPackageSlots(packageId, validEventDate);
        setSlotsState({ status: "ready", data });
      } catch {
        // Keep the current chips; the message below still applies.
      }
      setStartTime("");
      setEndTime("");
      setCartError("That time slot is no longer available. Please pick a slot again.");
      return;
    }
    setCartError(error instanceof ApiError ? error.message : fallback);
  }

  async function performAddToCart(noteOverride?: string, noteAttachmentsOverride?: string[]) {
    setCartError(null);
    setIsSubmitting(true);
    try {
      if (editItemId) {
        await updateCartItem(editItemId, buildCartPayload(noteOverride, noteAttachmentsOverride));
        setInCartItemId(editItemId);
      } else {
        const result = await addCartItem(buildCartPayload(noteOverride, noteAttachmentsOverride));
        setInCartItemId(result.itemId);
      }
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 2000);
    } catch (error) {
      await handleCartError(error, "Couldn't add to cart. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function performBookClick(noteOverride?: string, noteAttachmentsOverride?: string[]) {
    setCartError(null);
    setIsSubmitting(true);
    try {
      if (editItemId) {
        await updateCartItem(editItemId, buildCartPayload(noteOverride, noteAttachmentsOverride));
      } else {
        await addCartItem(buildCartPayload(noteOverride, noteAttachmentsOverride));
      }
      router.push("/cart");
    } catch (error) {
      await handleCartError(error, "Couldn't start booking. Please try again.");
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

  function resolvePendingAction(noteOverride?: string, noteAttachmentsOverride?: string[]) {
    setIsNotePromptOpen(false);
    if (pendingAction === "cart") void performAddToCart(noteOverride, noteAttachmentsOverride);
    if (pendingAction === "book") void performBookClick(noteOverride, noteAttachmentsOverride);
    setPendingAction(null);
  }

  function handleNotePromptSkip() {
    resolvePendingAction();
  }

  function handleNotePromptSave(note: string, attachments: string[]) {
    onVendorNoteChange(note);
    onVendorNoteAttachmentsChange(attachments);
    resolvePendingAction(note, attachments);
  }

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
            onSelect={(value) => {
              const [start, end] = value.split(" - ");
              setStartTime(start.trim());
              setEndTime(end.trim());
            }}
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
            {requiresGuestCount
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
        teamAndEquipmentCharge={teamAndEquipmentCharge}
        teamAndEquipmentBillingUnit={teamAndEquipmentBillingUnit}
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
