"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { getBookings, type RawBookingsResponse } from "@/lib/customerBookingApi";
import { getCart } from "@/lib/customerCartApi";
import { getWishlist } from "@/lib/customerWishlistApi";
import {
  subscribe as subscribeRecentlyViewed,
  getSnapshot as getRecentlyViewedSnapshot,
  getServerSnapshot as getRecentlyViewedServerSnapshot,
} from "@/lib/recentlyViewed";
import { groupBookingsByEvent } from "../utils/groupBookings";

interface DashboardCounts {
  bookings: number;
  cartItems: number;
  wishlist: number;
}

/**
 * Loads everything the account dashboard shows. Every call here is
 * customer-scoped and needs a bearer token, so callers must gate on
 * isLoggedIn — `enabled: false` keeps the hook inert until then rather than
 * firing four 401s.
 *
 * Counts are fetched independently of each other: a failing wishlist call
 * shouldn't blank out the bookings list, so each settles on its own and the
 * card just shows 0.
 */
export function useAccountDashboard({ enabled }: { enabled: boolean }) {
  const [bookingsResponse, setBookingsResponse] = useState<RawBookingsResponse | null>(null);
  const [counts, setCounts] = useState<DashboardCounts>({ bookings: 0, cartItems: 0, wishlist: 0 });
  const [error, setError] = useState<string | null>(null);
  // Flipped only from the bookings promise's callbacks, never synchronously
  // in the effect body — loading is derived from it below rather than being
  // a second piece of state the effect has to keep in step.
  const [hasSettled, setHasSettled] = useState(false);

  const recentlyViewed = useSyncExternalStore(
    subscribeRecentlyViewed,
    getRecentlyViewedSnapshot,
    getRecentlyViewedServerSnapshot
  );

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    const bookingsPromise = getBookings({ tab: "active", sort: "eventDate_asc", limit: 50 });

    bookingsPromise
      .then((response) => {
        if (cancelled) return;
        setBookingsResponse(response);
        setError(null);
        setCounts((current) => ({
          ...current,
          // "Your Bookings" spans every tab, not just the active list below.
          bookings: Object.values(response.counts ?? {}).reduce((sum, value) => sum + value, 0),
        }));
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Could not load your bookings");
      });

    getCart()
      .then((cart) => {
        if (cancelled) return;
        setCounts((current) => ({ ...current, cartItems: cart.itemCount ?? 0 }));
      })
      .catch(() => {
        // Leave the tile at 0 — a cart read failing isn't worth an error banner.
      });

    getWishlist()
      .then((wishlist) => {
        if (cancelled) return;
        setCounts((current) => ({ ...current, wishlist: wishlist.count ?? wishlist.items.length }));
      })
      .catch(() => {
        // Same — the tile stays at 0.
      });

    bookingsPromise.finally(() => {
      if (!cancelled) setHasSettled(true);
    });

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return {
    isLoading: enabled && !hasSettled,
    error,
    orders: groupBookingsByEvent(bookingsResponse?.bookings ?? []),
    activeBookingCount: bookingsResponse?.counts?.active ?? 0,
    recentlyViewed,
    counts: { ...counts, viewedItems: recentlyViewed.length },
  };
}
