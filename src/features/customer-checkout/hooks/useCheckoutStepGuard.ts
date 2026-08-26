"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { BookingSummaryData } from "@/features/customer-booking/types";

/**
 * Bounces the customer back to /booking-summary if they land on /contact
 * directly (typed URL, bookmark, back/forward) without having satisfied
 * Review's prerequisites yet. Nothing server-side stops this at the page
 * level — the backend only rejects the actual mutating call (PATCH
 * .../contact) — so this is purely a frontend UX guard, not a security
 * boundary.
 *
 * Mirrors the same flag the Review CTA is already gated on (see
 * BookingSummaryPage.tsx): readyForPayment must hold to leave Review. An
 * empty cart bounces to /booking-summary, which already has its own
 * "nothing selected" empty state + link back to /cart.
 */
export function useCheckoutStepGuard(data: BookingSummaryData | null, loading: boolean, error: string | null) {
  const router = useRouter();

  const redirectTo =
    !loading && !error && data
      ? data.vendorGroups.length === 0 || !data.readyForPayment
        ? "/booking-summary"
        : null
      : null;

  useEffect(() => {
    if (redirectTo) router.replace(redirectTo);
  }, [redirectTo, router]);

  return { redirecting: redirectTo !== null };
}
