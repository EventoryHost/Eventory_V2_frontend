import type { AppliedCoupon } from "../types";
import { mockCoupons } from "../data/mockCartData";

/**
 * Validates a coupon code. Swap the body for a real call — e.g.
 * `fetch(apiUrl("/cart/coupons/validate"), { method: "POST", ... })` — once
 * the backend endpoint exists.
 */
export async function applyCouponCode(code: string): Promise<AppliedCoupon> {
  await new Promise((resolve) => setTimeout(resolve, 600));

  const match = mockCoupons.find(
    (coupon) => coupon.code.toLowerCase() === code.trim().toLowerCase()
  );

  if (!match) {
    throw new Error("This coupon code is invalid or has expired.");
  }

  return {
    code: match.code,
    discountLabel: match.discountLabel,
    discountPercent: match.discountPercent,
    discountFlat: match.discountFlat,
  };
}
