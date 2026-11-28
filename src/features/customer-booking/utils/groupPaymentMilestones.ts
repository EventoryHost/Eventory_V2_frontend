import type { BookingPaymentMilestone } from "../types";

export interface MilestoneLikeLine {
  milestones?:
    | {
        title: string;
        percentage: number | null;
        amount: number | null;
        dueDaysRaw?: string | null;
        dueDate?: string | null;
      }[]
    | null;
}

/**
 * Combines every line's own payment milestones into just two rows —
 * "Advance Payment" and "Final Payment" — for the "Payment Schedule"
 * modal. A multi-vendor booking previously listed each vendor's own
 * Token/Advance/Final milestones separately (e.g. "Advance payment 1",
 * "Final Payment 1", "Advance payment 2", "Final Payment 2" for two
 * vendors); PM wants these summed into one Advance figure and one Final
 * figure instead (PM decision 2026-10-11):
 *
 *   Advance payment 1 (10 Oct) 100      Advance payment (10 Oct) 400
 *   Final Payment 1   (20 Oct) 200   -> Final Payment   (20 Oct) 700
 *   Advance payment 2 (15 Oct) 300
 *   Final Payment 2   (30 Oct) 500
 *
 * Classification: within EACH line's own milestones array, the LAST entry
 * is that line's final settlement (percentages always sum to 100, and a
 * package's milestones are vendor-ordered chronologically) — every other
 * entry in that line (Token, Advance 1, Advance 2, …) is an advance.
 * Titles are free text set per-vendor, so this doesn't match on the word
 * "Advance"/"Final" — position within the line is the only reliable signal
 * every package schema already guarantees.
 *
 * This is PURELY a display grouping for the modal — the real, separately
 * payable milestones are untouched in the database (Booking.paymentMilestones
 * / the locked quote): each is still its own real Cashfree charge
 * (createMilestonePayment pays exactly one at a time), so merging them here
 * would break actual payment collection. Nothing to persist/no endpoint to
 * change — this function only reshapes already-fetched quote data for
 * display.
 */
export function groupPaymentMilestones(
  lines: MilestoneLikeLine[],
  formatPrice: (amount: number) => string,
  formatShortDate: (date: Date) => string
): BookingPaymentMilestone[] {
  const advanceItems: { amount: number | null; dueDate: Date | null; dueDaysRaw: string | null }[] = [];
  const finalItems: typeof advanceItems = [];

  for (const line of lines) {
    const milestones = line.milestones ?? [];
    milestones.forEach((milestone, index) => {
      const bucket = index === milestones.length - 1 ? finalItems : advanceItems;
      const parsedDate = milestone.dueDate ? new Date(milestone.dueDate) : null;
      bucket.push({
        amount: milestone.amount,
        dueDate: parsedDate && !isNaN(parsedDate.getTime()) ? parsedDate : null,
        dueDaysRaw: milestone.dueDaysRaw ?? null,
      });
    });
  }

  function buildRow(title: string, items: typeof advanceItems): BookingPaymentMilestone | null {
    if (items.length === 0) return null;

    const knownAmounts = items.filter((item) => item.amount != null);
    const amount = knownAmounts.length > 0 ? formatPrice(knownAmounts.reduce((sum, item) => sum + (item.amount ?? 0), 0)) : null;

    const datedItems = items.filter((item): item is { amount: number | null; dueDate: Date; dueDaysRaw: string | null } => item.dueDate != null);
    const earliest = datedItems.length > 0
      ? datedItems.reduce((earliestItem, item) => (item.dueDate < earliestItem.dueDate ? item : earliestItem))
      : null;
    const due = earliest ? formatShortDate(earliest.dueDate) : items.find((item) => item.dueDaysRaw)?.dueDaysRaw ?? null;

    return { title, amount, due };
  }

  return [buildRow("Advance Payment", advanceItems), buildRow("Final Payment", finalItems)].filter(
    (row): row is BookingPaymentMilestone => row !== null
  );
}


export interface TimelineQuote {
  lines: MilestoneLikeLine[];
  grandTotal: number;
  tokenAmountTotal: number | null;
  allTokensConfigured: boolean;
}

/**
 * The payment timeline the customer will actually follow, accounting for what
 * they pay TODAY at checkout. groupPaymentMilestones above only reshapes the
 * vendors' own milestone percentages (which add up to the whole amount), so
 * for a ₹4,500 booking with a ₹900 token it still said "Final Payment ₹4,500",
 * contradicting "pay ₹900 today". This builds:
 *
 *   1. Today: the token (or the full amount when no token split applies).
 *   2. Then the vendors' advance / final milestones with the token already
 *      credited against them in order (advance first, then final), so what is
 *      left sums to grandTotal minus today's payment and each row shows the
 *      date it falls due.
 *
 * A free checkout (token exactly 0) has nothing due today, so it keeps the
 * plain milestone rows.
 */
export function buildPaymentTimeline(
  quote: TimelineQuote | null,
  formatPrice: (amount: number) => string,
  formatShortDate: (date: Date) => string
): BookingPaymentMilestone[] {
  if (!quote) return [];
  const planned = groupPaymentMilestones(quote.lines ?? [], formatPrice, formatShortDate);

  const payInFull = !quote.allTokensConfigured || quote.tokenAmountTotal == null;
  const dueToday = payInFull ? quote.grandTotal : quote.tokenAmountTotal ?? 0;
  if (dueToday <= 0) return planned;

  const todayRow: BookingPaymentMilestone = {
    title: payInFull ? "Pay today to confirm" : "Token amount, pay today",
    amount: formatPrice(dueToday),
    due: "Today",
    isToday: true,
  };
  if (payInFull) return [todayRow];

  // The rest of the booking: credit today's payment against the planned rows in order.
  let credit = dueToday;
  const later: BookingPaymentMilestone[] = [];
  for (const row of planned) {
    const amount = row.amount ? Number(row.amount.replace(/[^\d.]/g, "")) : null;
    if (amount == null || Number.isNaN(amount)) {
      later.push(row);
      continue;
    }
    const applied = Math.min(credit, amount);
    credit -= applied;
    const left = amount - applied;
    if (left > 0.004) later.push({ ...row, amount: formatPrice(left) });
  }

  // No usable schedule from the vendor: the balance is still owed, just without a date.
  if (later.length === 0 && quote.grandTotal - dueToday > 0.004) {
    later.push({ title: "Remaining balance", amount: formatPrice(quote.grandTotal - dueToday), due: "closer to the event date" });
  }
  return [todayRow, ...later];
}
