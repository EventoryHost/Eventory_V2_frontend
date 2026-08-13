"use client";

import { Loader2 } from "lucide-react";
import type { AppliedCoupon } from "../types";

export default function CouponInput({
  code,
  onCodeChange,
  onApply,
  isLoading,
  error,
  appliedCoupon,
  onRemove,
}: {
  code: string;
  onCodeChange: (value: string) => void;
  onApply: () => void;
  isLoading: boolean;
  error?: string | null;
  appliedCoupon?: AppliedCoupon | null;
  onRemove: () => void;
}) {
  if (appliedCoupon) {
    return (
      <div className="flex items-center justify-between rounded-xl border border-success-700/30 bg-success-subtle px-4 py-3">
        <div>
          <p className="font-figtree text-[13px] font-bold text-success-700">
            {appliedCoupon.code} applied
          </p>
          <p className="font-figtree text-[12px] text-neutral-secondary">
            {appliedCoupon.discountLabel}
          </p>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="font-figtree text-[12px] font-bold text-brand-primary hover:underline"
        >
          Remove
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex gap-2">
        <label className="flex-1">
          <span className="sr-only">Coupon code</span>
          <input
            type="text"
            value={code}
            onChange={(event) => onCodeChange(event.target.value)}
            placeholder="Enter coupon code"
            className="w-full rounded-xl border border-neutral-subtle bg-[#F9F9F9] px-4 py-3 font-figtree text-[14px] text-neutral-primary outline-none focus:border-brand-primary"
          />
        </label>
        <button
          type="button"
          onClick={onApply}
          disabled={isLoading || code.trim().length === 0}
          className="flex shrink-0 items-center gap-1.5 rounded-xl border border-brand-primary px-5 py-3 font-figtree text-[13px] font-bold text-brand-primary transition-colors hover:bg-brand-primary/5 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          Apply
        </button>
      </div>
      {error && <p className="mt-2 font-figtree text-[12px] font-medium text-error-700">{error}</p>}
    </div>
  );
}
