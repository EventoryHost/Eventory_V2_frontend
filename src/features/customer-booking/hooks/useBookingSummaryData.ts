"use client";

import { useCallback, useEffect, useState } from "react";
import { ApiError } from "@/lib/apiClient";
import { applyCoupon as applyCouponRequest, removeCoupon as removeCouponRequest } from "@/lib/customerCartApi";
import { getBookingSummaryData } from "../services/getBookingSummaryData";
import type { BookingSummaryData } from "../types";

/**
 * Fetches the shared checkout summary (Review / Details / Payment all call
 * this) straight from the cart + cart-quote endpoints — there's no
 * client-side cart store in this app, so each step re-fetches on mount, the
 * same way CartPageContent does for the Cart page itself.
 */
export function useBookingSummaryData() {
  const [data, setData] = useState<BookingSummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponFeedback, setCouponFeedback] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setError(null);
    try {
      const result = await getBookingSummaryData();
      setData(result);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't load your booking. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const applyCoupon = useCallback(
    async (code: string) => {
      if (!code.trim()) return;
      setCouponLoading(true);
      setCouponFeedback(null);
      try {
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
