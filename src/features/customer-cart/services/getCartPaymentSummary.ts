import type { RawCartQuote } from "@/lib/customerCartApi";
import { buildConvenienceFeeRow } from "@/lib/convenienceFee";
import type { CartVendor } from "../types";
import type { BookingLineRow, BookingPaymentMilestone } from "@/features/customer-booking/types";
import { formatPrice } from "../utils/currency";
import {
  formatShortDate,
  getCancellationTiers,
  getCancellationTierStatus,
} from "@/features/customer-package-detail/utils/cancellationPolicy";

export interface CartPaymentSummary {
  rows: BookingLineRow[];
  grandTotal: string;
  tokenAmount: string;
  payInFull: boolean;
  isFreeCheckout: boolean;
  tokenConfigured: boolean;
  milestones: BookingPaymentMilestone[];
  cancellationNote: string;
}

// Same platform-wide cancellation window used everywhere else this is shown
// (PDP's StickyBookingCard, customer-booking's getBookingSummaryData.ts) —
// picks the earliest event date across all cart items since that's the one
// the promise has to hold for.
function earliestCancellationTiers(vendors: CartVendor[]) {
  const eventDateIsos = vendors
    .map((v) => v.eventDetails.date)
    .filter((date): date is string => date != null && !isNaN(new Date(date).getTime()));
  if (!eventDateIsos.length) return null;
  const earliestIso = eventDateIsos.reduce((earliest, current) =>
    new Date(current).getTime() < new Date(earliest).getTime() ? current : earliest
  );
  return getCancellationTiers(earliestIso);
}

/**
 * Cart's live quote (GET /customer/cart/quote) is the exact same shape as a
 * checkout session's lockedQuote — same math (getBookingSummaryData.ts)
 * reapplied here against cart items instead of a locked session's lines, so
 * the logged-in cart page's Payment Summary reads identically to Review's.
 */
export function buildCartPaymentSummary(quote: RawCartQuote | null, vendors: CartVendor[]): CartPaymentSummary {
  const payInFull = !quote || !quote.allTokensConfigured || quote.tokenAmountTotal == null;
  const cancellationTiers = earliestCancellationTiers(vendors);
  const cancellationStatus = cancellationTiers ? getCancellationTierStatus(cancellationTiers) : null;

  const rows: BookingLineRow[] = [];
  if (quote) {
    rows.push({ label: "Total booking amount", value: formatPrice(quote.subtotal) });
    const feeRow = buildConvenienceFeeRow(quote, formatPrice);
    if (feeRow) rows.push(feeRow);
    if (quote.discount) {
      rows.push({ label: "Discount", value: `-${formatPrice(quote.discount)}` });
    }
    const gstPercent = quote.lines.find((line) => line.gstRatePercent)?.gstRatePercent;
    if (quote.gstTotal) {
      rows.push({ label: `GST${gstPercent ? ` (${gstPercent}%)` : ""}`, value: formatPrice(quote.gstTotal) });
    }
  }

  const milestones: BookingPaymentMilestone[] = (quote?.lines ?? []).flatMap((quoteLine) => {
    const serviceName = vendors.find((v) => v.id === quoteLine.lineId)?.package.title ?? "Package";
    return (quoteLine.milestones ?? []).map((milestone) => ({
      serviceName,
      title: milestone.title,
      percentage: milestone.percentage,
      amount: milestone.amount != null ? formatPrice(milestone.amount) : null,
      due: milestone.dueDate ? formatShortDate(new Date(milestone.dueDate)) : (milestone.dueDaysRaw ?? null),
    }));
  });

  return {
    rows,
    grandTotal: formatPrice(quote?.grandTotal ?? 0),
    tokenAmount: formatPrice(payInFull ? (quote?.grandTotal ?? 0) : (quote?.tokenAmountTotal ?? 0)),
    payInFull,
    isFreeCheckout: quote?.tokenAmountTotal === 0,
    tokenConfigured: quote != null && quote.tokenAmountTotal != null,
    milestones,
    cancellationNote: payInFull
      ? cancellationTiers && cancellationStatus
        ? cancellationStatus === "full"
          ? `Free cancellation until ${formatShortDate(cancellationTiers.fullRefundCutoff)}. Held safely by Eventory until your event.`
          : cancellationStatus === "half"
            ? `50% refund if cancelled before ${formatShortDate(cancellationTiers.halfRefundCutoff)}.`
            : "No refund on cancellation — the event is too close."
        : "Free cancellation may apply — check each package's policy for exact dates."
      : quote?.note || "Free cancellation may apply — check each package's policy for exact dates.",
  };
}
