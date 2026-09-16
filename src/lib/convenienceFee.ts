import type { RawCartQuote } from "./customerCartApi";

const HINT =
  "A platform service & security fee. It varies by the vendor's size and track record, the package price, and how close to the event you book.";

const PENDING_VALUE = "Set your event date";

/**
 * The "Service & security fee" line for a cart / checkout Payment Summary,
 * from a live quote (GET /customer/cart/quote or a checkout session's
 * lockedQuote — identical shape). Returns null when the fee doesn't apply
 * to this order at all (kill-switch off, or no eligible line).
 *
 * When `convenienceFeeComplete` is false, at least one line couldn't
 * compute its fee yet (missing event date), so we show a "set your event
 * date" prompt rather than a misleading ₹0 — the backend's own guidance.
 */
export function buildConvenienceFeeRow(
  quote: Pick<RawCartQuote, "convenienceFee" | "convenienceFeeConfigured" | "convenienceFeeComplete">,
  formatPrice: (n: number) => string
): { label: string; value: string; hint: string } | null {
  if (!quote.convenienceFeeConfigured) return null;
  return {
    label: "Service & security fee",
    value: quote.convenienceFeeComplete ? formatPrice(quote.convenienceFee) : PENDING_VALUE,
    hint: HINT,
  };
}
