"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getBookingDetail,
  getCancellationPreview,
  type CancellationTerms,
  type RawBooking,
  type RawBookingMilestone,
} from "@/lib/customerBookingApi";
import type { HelpBookingContext } from "../helpContext";

// Booking help (v6f9) needs each package's own numbers — paid, due,
// cancellation terms, Event Manager — which the booking page only loads
// for the booking it was opened with. Loaded when the panel opens on a
// booking page, and again after the panel changes something.

export type BookingHelpPackage = HelpBookingContext["packages"][number] & {
  booking: RawBooking;
  terms: CancellationTerms | null;
  /** Can still be cancelled online (not terminal, before the cut-off). */
  cancellable: boolean;
  cancelled: boolean;
  paid: number;
  total: number;
  remaining: number;
  /** The next milestone still to pay, if any. */
  nextDue: RawBookingMilestone | null;
};

export type BookingHelpData = {
  packages: BookingHelpPackage[];
  /** The event's Event Manager: the first package with one assigned. */
  emName: string | null;
  /** Still to pay across the event. */
  remaining: number;
  /** Earliest due date among unpaid milestones. */
  nextDueDate: string | null;
};

export function useBookingHelpData(ctx: HelpBookingContext | null, active: boolean) {
  const [data, setData] = useState<BookingHelpData | null>(null);
  const [error, setError] = useState(false);
  const [version, setVersion] = useState(0);
  const refs = ctx?.packages.map((p) => p.reference).join(",") ?? "";

  useEffect(() => {
    if (!ctx || !active) return;
    let stale = false;
    Promise.all(
      ctx.packages.map(async (p): Promise<BookingHelpPackage> => {
        const [detail, preview] = await Promise.all([
          getBookingDetail(p.reference),
          getCancellationPreview(p.reference).catch(() => null),
        ]);
        const b = detail.booking;
        const total = b.totalAmount || 0;
        const paid = b.totalReceived || 0;
        const nextDue =
          [...(b.paymentMilestones ?? [])]
            .filter((m) => m.status !== "Received")
            .sort((x, y) => new Date(x.dueDate ?? 0).getTime() - new Date(y.dueDate ?? 0).getTime())[0] ?? null;
        const cancelled = b.status === "Cancelled" || b.status === "Declined";
        return {
          ...p,
          booking: b,
          terms: preview?.terms ?? null,
          cancellable: Boolean(preview?.cancellable),
          cancelled,
          paid,
          total,
          remaining: cancelled ? 0 : Math.max(0, total - paid),
          nextDue: cancelled ? null : nextDue,
        };
      }),
    ).then(
      (packages) => {
        if (stale) return;
        const dueDates = packages.map((p) => p.nextDue?.dueDate).filter((d): d is string => Boolean(d)).sort();
        setData({
          packages,
          emName: packages.map((p) => p.booking.assignedEmName).find(Boolean) ?? null,
          remaining: packages.reduce((t, p) => t + p.remaining, 0),
          nextDueDate: dueDates[0] ?? null,
        });
        setError(false);
      },
      () => !stale && setError(true),
    );
    return () => {
      stale = true;
    };
    // ctx is re-published on every booking page render; the refs say whether it changed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refs, active, version]);

  const reload = useCallback(() => setVersion((v) => v + 1), []);
  return { data: ctx ? data : null, error, reload };
}
