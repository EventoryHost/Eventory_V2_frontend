// Eventory's standard cancellation cut-off windows. The backend only stores
// a free-text policy blob per package (see RawPolicySlot in
// customerPackageDetailApi.ts) — there's no structured per-vendor refund
// percentage/day schema to read a real timeline from, so the three tiers
// below are Eventory's platform-wide default window, not vendor-specific
// data. The vendor's own written cancellation policy (when present) is
// shown alongside it rather than being replaced by these tiers.
const FULL_REFUND_DAYS_BEFORE = 14;
const HALF_REFUND_DAYS_BEFORE = 3;

export interface CancellationTiers {
  eventDate: Date;
  fullRefundCutoff: Date;
  halfRefundCutoff: Date;
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function getCancellationTiers(eventDateIso: string): CancellationTiers | null {
  const eventDate = new Date(eventDateIso);
  if (isNaN(eventDate.getTime())) return null;
  return {
    eventDate,
    fullRefundCutoff: addDays(eventDate, -FULL_REFUND_DAYS_BEFORE),
    halfRefundCutoff: addDays(eventDate, -HALF_REFUND_DAYS_BEFORE),
  };
}

export function formatShortDate(date: Date): string {
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function formatDayMonth(date: Date): string {
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "long" });
}
