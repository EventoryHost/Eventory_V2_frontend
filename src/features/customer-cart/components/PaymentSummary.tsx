import Link from "next/link";
import { Headset, Loader2 } from "lucide-react";
import type { AppliedCoupon } from "../types";
import { formatPrice } from "../utils/currency";
import CouponInput from "./CouponInput";

export default function PaymentSummary({
  vendorCount,
  itemCount,
  subtotal,
  discount,
  total,
  couponCode,
  onCouponCodeChange,
  onApplyCoupon,
  couponLoading,
  couponError,
  appliedCoupon,
  onRemoveCoupon,
  onContinue,
  continueLoading,
  continueDisabled,
  continueMessage,
}: {
  vendorCount: number;
  itemCount: number;
  subtotal: number;
  discount: number;
  total: number;
  couponCode: string;
  onCouponCodeChange: (value: string) => void;
  onApplyCoupon: () => void;
  couponLoading: boolean;
  couponError?: string | null;
  appliedCoupon?: AppliedCoupon | null;
  onRemoveCoupon: () => void;
  onContinue: () => void;
  continueLoading: boolean;
  continueDisabled: boolean;
  continueMessage?: string | null;
}) {
  return (
    <div className="rounded-2xl border border-neutral-subtle bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="font-figtree text-[24px] font-bold text-neutral-primary">
          Payment Summary
        </h2>
        <p className="font-figtree text-[13px] text-neutral-secondary">
          {itemCount} {itemCount === 1 ? "item" : "items"} • {vendorCount}{" "}
          {vendorCount === 1 ? "vendor" : "vendors"}
        </p>
      </div>

      <div className="mb-8">
        <CouponInput
          code={couponCode}
          onCodeChange={onCouponCodeChange}
          onApply={onApplyCoupon}
          isLoading={couponLoading}
          error={couponError}
          appliedCoupon={appliedCoupon}
          onRemove={onRemoveCoupon}
        />
      </div>

      <div className="mb-6 space-y-2 border-t border-neutral-subtle pt-6">
        <div className="flex items-center justify-between font-figtree text-[13px] text-neutral-secondary">
          <span>Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        {discount > 0 && (
          <div className="flex items-center justify-between font-figtree text-[13px] text-success-700">
            <span>Discount</span>
            <span>-{formatPrice(discount)}</span>
          </div>
        )}
        <div className="flex items-center justify-between pt-2">
          <span className="font-figtree text-[14px] font-semibold tracking-wider text-neutral-secondary uppercase">
            Total
          </span>
          <span className="font-figtree text-[28px] font-bold text-neutral-primary">
            {formatPrice(total)}
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={onContinue}
        disabled={continueDisabled || continueLoading}
        className="mb-6 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-primary py-4 font-figtree text-[18px] font-semibold text-white shadow-md transition-all hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
      >
        {continueLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        Continue
      </button>

      {continueMessage && (
        <p className="mb-6 text-center font-figtree text-[13px] font-medium text-success-700">
          {continueMessage}
        </p>
      )}

      <div className="space-y-4 text-center">
        <Link
          href="mailto:support@eventory.in"
          className="flex items-center justify-center gap-2 font-figtree text-[14px] font-semibold text-neutral-secondary transition-colors hover:text-brand-primary"
        >
          <Headset className="h-5 w-5" /> Contact EMS Support
        </Link>
        <p className="px-4 font-figtree text-[12px] leading-relaxed text-neutral-tertiary">
          By proceeding, you agree to Eventory&apos;s{" "}
          <Link href="/terms-of-service" className="underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/cancellation-policy" className="underline">
            Cancellation policy
          </Link>
        </p>
      </div>
    </div>
  );
}
