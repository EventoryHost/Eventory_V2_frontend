"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useCustomerSession } from "@/features/customer-auth/hooks/useCustomerSession";
import { addCartItem, getCart, updateCartItem, type RawCartEventDetails, type RawCustomizeRequest, type RawColourPreference } from "@/lib/customerCartApi";
import { getConvenienceFeePreview, getPackageServiceability, getPackageSlots, type RawPdpConvenienceFee } from "@/lib/customerPackageDetailApi";
import { detectCurrentLocation } from "@/lib/geocoding";
import { ApiError } from "@/lib/apiClient";
import type { CustomizeRequest, IncludedItemEntry, SelectedAddon } from "../types";
import { toCustomizeRequestPayload } from "../utils/customizeRequestPayload";
import { getCancellationTiers } from "../utils/cancellationPolicy";
import { isSafeInternalPath } from "@/lib/isSafeInternalPath";
import { useSelectedCity, setSelectedCity } from "@/features/customer-landing/hooks/useSelectedCity";

import type { SlotsState } from "../components/EventTimingSlots";
import type { ServiceabilityState } from "../components/LocationServiceability";

/**
 * All the booking-form state + logic StickyBookingCard (desktop) used to own
 * directly — lifted out so the mobile sticky bar / bottom sheet (Figma nodes
 * 2548:28662 onward) can drive the exact same booking state instead of
 * running a second, independent copy of this whole flow. Both components
 * are for the SAME in-flight booking on the SAME page, so there can only
 * ever be one source of truth for it.
 */
export function useBookingForm({
  packageId,
  packageTotal,
  gstPercent,
  tokenAmount,
  tokenType,
  tokenValue,
  requiresGuestCount = true,
  eventCategories,
  selectedAddons,
  customizeRequests,
  colourPreferences,
  vendorNote,
  onVendorNoteChange,
  vendorNoteAttachments,
  onVendorNoteAttachmentsChange,
  editItemId,
  returnTo,
  prefillEventDetails,
}: {
  packageId: string;
  packageTotal: number;
  gstPercent: number;
  tokenAmount: number;
  tokenType: "Percentage" | "Fixed" | null;
  tokenValue: number | null;
  requiresGuestCount?: boolean;
  eventCategories: string[];
  selectedAddons: SelectedAddon[];
  customizeRequests: CustomizeRequest[];
  colourPreferences: { setupId: string; itemId: string; itemLabel: string; colours: string[] }[];
  vendorNote: string;
  onVendorNoteChange: (note: string) => void;
  vendorNoteAttachments: string[];
  onVendorNoteAttachmentsChange: (attachments: string[]) => void;
  editItemId?: string;
  returnTo?: string;
  prefillEventDetails?: RawCartEventDetails;
}) {
  // PM reversal (2026-10-14): show every category the vendor set, including
  // ones previously hidden/merged as duplicates (e.g. "Birthday" alongside
  // "Birthday Party") — no longer filtered.
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
  const selectedSlotRef = useRef("");
  selectedSlotRef.current = startTime && endTime ? `${startTime} - ${endTime}` : "";
  const [location, setLocation] = useState("");
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
  const { city: navbarCity } = useSelectedCity();

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
      setIsLocationAutoFilled(false);
    }
    if (prefillEventDetails.guestCount != null) setGuestCount(String(prefillEventDetails.guestCount));
  }, [prefillEventDetails]);

  async function detectAndFillLocation(showErrors: boolean) {
    setIsDetectingLocation(true);
    if (showErrors) setLocationDetectError(null);
    const outcome = await detectCurrentLocation();
    setIsDetectingLocation(false);
    if (outcome.status === "success") {
      setLocation(outcome.label);
      setIsLocationAutoFilled(true);
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

  useEffect(() => {
    if (editItemId) return;
    if (!navbarCity) return;
    if (location && !isLocationAutoFilled) return;
    setLocation(navbarCity);
    setIsLocationAutoFilled(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editItemId, navbarCity]);

  const gstAmount = Math.round((packageTotal * gstPercent) / 100);
  const tokenBase = packageTotal + gstAmount;
  const liveTokenAmount =
    tokenType === "Percentage" && tokenValue != null
      ? Math.round((tokenBase * tokenValue) / 100)
      : tokenType === "Fixed" && tokenValue != null
        ? Math.min(tokenValue, tokenBase)
        : tokenAmount;
  const validEventDate = eventDate && !isNaN(Date.parse(eventDate)) ? eventDate : null;
  const cancellationTiers = validEventDate ? getCancellationTiers(validEventDate) : null;

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

  const rawConvenienceFee =
    conveniencePreview?.configured && validEventDate ? conveniencePreview.fee : 0;
  const rawEstimatedTotal = packageTotal + gstAmount + rawConvenienceFee;
  const estimatedTotal = rawEstimatedTotal > 0 ? Math.ceil(rawEstimatedTotal / 100) * 100 : 0;
  const roundOffGap = estimatedTotal - rawEstimatedTotal;
  const convenienceFee =
    conveniencePreview?.configured && validEventDate ? rawConvenienceFee + roundOffGap : 0;
  const parsedGuestCount = Number(guestCount);
  const validGuestCount = guestCount.trim() && Number.isFinite(parsedGuestCount) && parsedGuestCount > 0;
  const guestCountComplete = requiresGuestCount ? Boolean(validGuestCount) : true;
  // `slots.length === 0` is checked for "nothing offered, nothing to pick"
  // in general — NOT as a FULL_DAY proxy. The backend now generates AUTO
  // slots (6 AM–midnight, 3-hour blocks) for full-day packages too when the
  // vendor hasn't set custom ones, so an empty array is a genuine edge case
  // (e.g. no price to derive slots from) rather than the normal full-day
  // case it used to be — this still requires picking one of whatever IS
  // offered, full-day packages included, and only skips the requirement
  // when the vendor's slots endpoint truly has nothing to show.
  const timingComplete =
    slotsState.status === "ready" &&
    slotsState.data.dayAvailable &&
    (slotsState.data.slots.length === 0 || Boolean(startTime && endTime));
  const detailsComplete = Boolean(
    eventType && validEventDate && timingComplete && location.trim() && guestCountComplete
  );

  function buildCartPayload(noteOverride?: string, noteAttachmentsOverride?: string[]) {
    const timeSlot =
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
        category: addon.category || undefined,
        subCategory: addon.subCategory || undefined,
        color: addon.color,
        image: addon.image,
      })),
      customizeRequests: customizeRequests.map(toCustomizeRequestPayload) satisfies RawCustomizeRequest[],
      colourPreferences: colourPreferences satisfies RawColourPreference[],
    };
  }

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
        router.push(isSafeInternalPath(returnTo) ? returnTo : "/cart");
        return;
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

  return {
    eventTypeOptions,
    eventType,
    setEventType,
    eventDate,
    setEventDate,
    startTime,
    endTime,
    onSelectSlot(value: string) {
      const [start, end] = value.split(" - ");
      setStartTime(start.trim());
      setEndTime(end.trim());
    },
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
    pendingAction,
    setPendingAction,
    gstAmount,
    liveTokenAmount,
    validEventDate,
    cancellationTiers,
    estimatedTotal,
    convenienceFee,
    conveniencePreview,
    guestCountComplete,
    timingComplete,
    detailsComplete,
    requestAddToCart,
    requestBookClick,
    handleNotePromptSkip,
    handleNotePromptSave,
  };
}

export type UseBookingFormResult = ReturnType<typeof useBookingForm>;
