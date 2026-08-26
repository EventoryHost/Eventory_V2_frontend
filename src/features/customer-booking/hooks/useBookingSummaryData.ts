"use client";

import { useCallback, useEffect, useState } from "react";
import { ApiError } from "@/lib/apiClient";
import { applyCoupon as applyCouponRequest, removeCoupon as removeCouponRequest } from "@/lib/customerCartApi";
import { useCustomerSession } from "@/features/customer-auth/hooks/useCustomerSession";
import { getBookingSummaryData } from "../services/getBookingSummaryData";
import type { BookingSummaryData } from "../types";

/**
 * Fetches the shared checkout summary (Review / Details / Payment all call
 * this) straight from the checkout-session endpoints — there's no
 * client-side cart store in this app, so each step re-fetches on mount, the
 * same way CartPageContent does for the Cart page itself.
 *
 * Checkout has no guest equivalent (every endpoint requires a logged-in
 * customer — see book-api.pdf's Auth model), unlike Cart, which is
 * soft-authed. Skips the fetch entirely while logged out rather than
 * letting it fail with a raw 401 — callers should pair this with
 * CheckoutLoginGate to show a login prompt instead of the page's normal
 * loading/error/empty states. Re-fetches automatically the moment
 * isLoggedIn flips true (login inside the gate's modal).
 */
export function useBookingSummaryData() {
  const { isLoggedIn } = useCustomerSession();
  const [data, setData] = useState<BookingSummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponFeedback, setCouponFeedback] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!isLoggedIn) {
      setData(null);
      setError(null);
      setLoading(false);
      return;
    }
    setError(null);
    try {
      const result = await getBookingSummaryData();
      setData(result);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't load your booking. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const applyCoupon = useCallback(
    async (code: string) => {
      if (!code.trim()) return;
      setCouponLoading(true);
      setCouponFeedback(null);
      try {
        // applyCouponRequest invalidates the locked checkout session as a
        // side effect (see customerCartApi.ts / invalidateCheckoutSession) —
        // refresh() below creates a fresh one so the discount actually shows up.
        await applyCouponRequest(code);
        await refresh();
        setCouponFeedback(`Coupon "${code}" applied.`);
      } catch (err) {
        setCouponFeedback(err instanceof ApiError ? err.message : "Couldn't apply that coupon.");
      } finally {
        setCouponLoading(false);
      }
    },
    [refresh]
  );

  const removeCoupon = useCallback(async () => {
    setCouponLoading(true);
    try {
      await removeCouponRequest();
    } finally {
      setCouponLoading(false);
      await refresh();
    }
  }, [refresh]);

  return { data, loading, error, refresh, applyCoupon, removeCoupon, couponLoading, couponFeedback };
}
