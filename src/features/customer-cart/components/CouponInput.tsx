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
      <div className="flex items-center justify-between rounded-lg border border-success-700/30 bg-success-subtle px-4 py-3">
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
            placeholder="Apply Coupon"
            className="w-full rounded-lg border border-neutral-subtle px-3.5 py-2.5 font-figtree text-[13px] text-neutral-primary outline-none focus:border-brand-primary"
          />
        </label>
        <button
          type="button"
          onClick={onApply}
          disabled={isLoading || code.trim().length === 0}
          className="flex shrink-0 items-center gap-1.5 rounded-lg border border-brand-primary px-4 py-2.5 font-figtree text-[13px] font-bold text-brand-primary transition-colors hover:bg-brand-subtle disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          Apply
        </button>
      </div>
      {error && <p className="mt-2 font-figtree text-[12px] font-medium text-error-700">{error}</p>}
    </div>
  );
}
