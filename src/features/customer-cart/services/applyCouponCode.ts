import type { AppliedCoupon } from "../types";
import { applyCoupon as applyCouponReal, removeCoupon as removeCouponReal } from "@/lib/customerCartApi";

/**
 * Applies a coupon code via the real POST /api/customer/cart/coupon.
 * HONEST LIMITATION (per the backend's own docs): there is no Coupon/Offer
 * model yet, so this always stores the code with a 0 discount — the
 * backend's own explanatory message is surfaced as the label instead of a
 * fabricated percent/flat discount.
 */
export async function applyCouponCode(code: string): Promise<AppliedCoupon> {
  const payload = await applyCouponReal(code.trim());
  return {
    code: payload.coupon?.code ?? code.trim().toUpperCase(),
    discountLabel: payload.message ?? "Applied",
  };
}

export async function removeCouponCode(): Promise<void> {
  await removeCouponReal();
}
