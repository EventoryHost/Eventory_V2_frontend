import type { RawCartQuote } from "@/lib/customerCartApi";
import type { CartVendor } from "../types";
import type { BookingLineRow, BookingPaymentMilestone } from "@/features/customer-booking/types";
import { formatPrice } from "../utils/currency";
import { formatShortDate, getCancellationTiers } from "@/features/customer-package-detail/utils/cancellationPolicy";

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
function earliestFullRefundCutoff(vendors: CartVendor[]): Date | null {
  const eventDateIsos = vendors
    .map((v) => v.eventDetails.date)
    .filter((date): date is string => date != null && !isNaN(new Date(date).getTime()));
  if (!eventDateIsos.length) return null;
  const earliestIso = eventDateIsos.reduce((earliest, current) =>
    new Date(current).getTime() < new Date(earliest).getTime() ? current : earliest
  );
  return getCancellationTiers(earliestIso)?.fullRefundCutoff ?? null;
}

/**
 * Cart's live quote (GET /customer/cart/quote) is the exact same shape as a
 * checkout session's lockedQuote — same math (getBookingSummaryData.ts)
 * reapplied here against cart items instead of a locked session's lines, so
 * the logged-in cart page's Payment Summary reads identically to Review's.
 */
export function buildCartPaymentSummary(quote: RawCartQuote | null, vendors: CartVendor[]): CartPaymentSummary {
  const payInFull = !quote || !quote.allTokensConfigured || quote.tokenAmountTotal == null;
  const fullRefundCutoff = earliestFullRefundCutoff(vendors);

  const rows: BookingLineRow[] = [];
  if (quote) {
    rows.push({ label: "Total booking amount", value: formatPrice(quote.subtotal) });
    if (quote.convenienceFeeConfigured) {
      rows.push({ label: "Service & security fee", value: formatPrice(quote.convenienceFee) });
    }
    if (quote.discount) {
      rows.push({ label: "Discount", value: `-${formatPrice(quote.discount)}` });
    }
    const gstPercent = quote.lines.find((line) => line.gstRatePercent)?.gstRatePercent;
    if (quote.gstTotal) {
      rows.push({ label: `GST${gstPercent ? ` (${gstPercent}%)` : ""}`, value: formatPrice(quote.gstTotal) });
    }
  }

  const milestones: BookingPaymentMilestone[] = (quote?.lines ?? []).flatMap((quoteLine) => {
    const serviceName = vendors.find((v) => v.id === quoteLine.cartItemId)?.package.title ?? "Package";
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
      ? fullRefundCutoff
        ? `Free cancellation until ${formatShortDate(fullRefundCutoff)}. Held safely by Eventory until your event.`
        : "Free cancellation may apply — check each package's policy for exact dates."
      : quote?.note || "Free cancellation may apply — check each package's policy for exact dates.",
  };
}
