"use client";

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/apiClient";
import { getBookingSuccessData, type BookingSuccessData } from "../services/getBookingSuccessData";

/**
 * Fetches the real Booking(s) created by confirmCheckoutSessionOffline
 * (customer-contact/ContactPage.tsx) for the Booking Success page — bookingIds
 * arrive as a query param since checkout-session identity is gone by the time
 * this page loads (the session is Completed, its localStorage id cleared).
 */
export function useBookingSuccessData(bookingIds: string[]) {
  const [data, setData] = useState<BookingSuccessData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (bookingIds.length === 0) {
      setData(null);
      setError(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    getBookingSuccessData(bookingIds)
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof ApiError ? err.message : "Couldn't load your booking.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- bookingIds is a query-param-derived array; comparing by content (join) instead of identity
  }, [bookingIds.join(",")]);

  return { data, loading, error };
}
