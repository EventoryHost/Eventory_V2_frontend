"use client";

import { useState } from "react";
import { ChevronDown, Loader2 } from "lucide-react";
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
  const [isExpanded, setIsExpanded] = useState(Boolean(appliedCoupon));

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
      <button
        type="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        aria-expanded={isExpanded}
        className="flex items-center gap-1 font-figtree text-[13px] font-bold text-brand-primary hover:underline"
      >
        Apply Coupon
        <ChevronDown
          className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
        />
      </button>

      {isExpanded && (
        <div className="mt-3">
          <label className="block">
            <span className="sr-only">Coupon code</span>
            <div className="relative flex items-center">
              <input
                type="text"
                value={code}
                onChange={(event) => onCodeChange(event.target.value)}
                placeholder="Enter coupon code"
                className="w-full rounded-xl border border-neutral-subtle bg-[#F9F9F9] px-4 py-3 pr-20 font-figtree text-[14px] text-neutral-primary outline-none focus:border-brand-primary"
              />
              <button
                type="button"
                onClick={onApply}
                disabled={isLoading || code.trim().length === 0}
                className="absolute right-3 flex items-center gap-1 font-figtree text-[12px] font-bold tracking-wider text-brand-primary uppercase transition-opacity hover:opacity-80 disabled:opacity-40"
              >
                {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Apply
              </button>
            </div>
          </label>
          {error && (
            <p className="mt-2 font-figtree text-[12px] font-medium text-error-700">{error}</p>
          )}
        </div>
      )}
    </div>
  );
}
