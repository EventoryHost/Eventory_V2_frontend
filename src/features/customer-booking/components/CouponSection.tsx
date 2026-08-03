"use client";

import { useState } from "react";
import { Tag, ChevronDown } from "lucide-react";

export type CouponSectionProps = {
  onApply?: (code: string) => void;
};

export default function CouponSection({ onApply }: CouponSectionProps) {
  const [code, setCode] = useState("");

  return (
    <div className="flex w-full max-w-[376px] flex-col gap-3">
      <h3 className="font-figtree text-[15px] font-semibold leading-[24px] text-[#101828]">
        Apply Coupon
      </h3>

      <div
        className="flex h-11 w-full items-center justify-between rounded-[8px] border border-[#E5E5E5] pt-[10px] pr-4 pb-[10px] pl-4"
        style={{ backgroundColor: "#F4F4F580" }}
      >
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter coupon code"
          className="w-full bg-transparent font-figtree text-[14px] text-[#101828] placeholder:text-[#9CA3AF] outline-none"
        />
        <button
          type="button"
          onClick={() => onApply?.(code)}
          className="shrink-0 font-figtree text-[14px] font-medium text-blue-600"
        >
          Apply
        </button>
      </div>

      <button
        type="button"
        className="flex items-center gap-1.5 self-start font-figtree text-[12px] font-normal text-[#F59E0B]"
      >
        <Tag size={14} />
        View Available Offers
        <ChevronDown size={14} />
      </button>
    </div>
  );
}
