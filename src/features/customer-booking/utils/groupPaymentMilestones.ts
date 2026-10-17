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
