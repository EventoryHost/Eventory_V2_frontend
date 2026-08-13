"use client";

import { useState } from "react";
import Link from "next/link";
import { Tag, ChevronRight, ShieldCheck, Info, ArrowRight } from "lucide-react";

export type PaymentSummaryProps = {
  vendorCount: number;
  packageCount: number;
  rows: { label: string; value: string }[];
  grandTotal: string;
  tokenAmount: string;
  cancellationNote: string;
  ctaLabel: string;
  ctaHref: string;
  onApplyCoupon?: (code: string) => void;
  onViewSchedule?: () => void;
};

export default function PaymentSummary({
  vendorCount,
  packageCount,
  rows,
  grandTotal,
  tokenAmount,
  cancellationNote,
  ctaLabel,
  ctaHref,
  onApplyCoupon,
  onViewSchedule,
}: PaymentSummaryProps) {
  const [code, setCode] = useState("");

  return (
    <div className="w-full max-w-[360px] rounded-[24px] border border-[#E4E4E7] bg-white p-5">
      <div className="flex w-full max-w-[318px] flex-col gap-4">
        <div className="flex flex-col gap-0.5">
          <h2 className="font-figtree text-[16px] font-semibold leading-[24px] tracking-[-0.24px] text-[#030303]">
            Payment summary
          </h2>
          <p className="font-figtree text-[12px] font-normal leading-[18px] text-[#71717B]">
            {vendorCount} vendors &middot; {packageCount} packages
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-11 min-h-11 flex-1 items-center gap-2 rounded-[16px] border border-[#E4E4E7] pt-[1px] pr-3 pb-[1px] pl-3">
              <Tag size={16} className="shrink-0 text-[#71717B]" />
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Coupon code"
                className="w-full bg-transparent font-figtree text-[14px] font-normal leading-none text-[#71717B] placeholder:text-[#71717B] outline-none"
              />
            </div>

            <button
              type="button"
              disabled={!code}
              onClick={() => onApplyCoupon?.(code)}
              className="flex h-11 w-[72px] shrink-0 items-center justify-center rounded-xl border border-[#FCDEE2] pt-3 pr-2 pb-3 pl-2 font-figtree text-[12px] font-medium text-[#FCDEE2] transition-colors enabled:border-[#F0596F] enabled:text-[#F0596F]"
            >
              Apply
            </button>
          </div>

          <button
            type="button"
            className="flex w-fit items-center gap-1 font-figtree text-[12px] font-semibold leading-[18px] text-[#F0596F]"
          >
            View available offers
            <ChevronRight size={14} />
          </button>
        </div>

        <div className="h-px w-full bg-[#E4E4E7]" />

        <div className="flex flex-col gap-4">
          {rows.map((row) => (
            <div key={row.label} className="flex items-center justify-between">
              <span className="font-figtree text-[12px] font-normal leading-[18px] text-[#71717B]">
                {row.label}
              </span>
              <span className="font-figtree text-[12px] font-normal leading-[18px] text-[#3F3F47]">
                {row.value}
              </span>
            </div>
          ))}
        </div>

        <div className="h-px w-full bg-[#E4E4E7]" />

        <div className="flex items-center justify-between">
          <span className="font-figtree text-[15px] font-semibold leading-[1.3] text-[#030303]">
            Grand total
          </span>
          <span className="font-figtree text-[16px] font-semibold leading-[1.3] text-[#030303]">
            {grandTotal}
          </span>
        </div>

        <div className="w-full max-w-[318px] overflow-hidden rounded-[16px] border border-[#E4E4E7]">
          <div className="flex flex-col gap-3 p-4">
            <span className="flex items-center gap-1.5 font-figtree text-[11px] font-semibold tracking-[0.03em] text-[#71717B] uppercase">
              <ShieldCheck size={14} />
              Pay now to confirm
            </span>

            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-figtree text-[32px] font-semibold leading-[32px] tracking-[-0.02em] text-[#030303]">
                {tokenAmount}
              </span>

              <span className="flex w-fit items-center gap-1 rounded-full bg-[#EFF6FF] pt-1 pr-2.5 pb-1 pl-2.5">
                <Info size={12} className="text-[#1447E6]" />
                <span className="font-figtree text-[11px] font-semibold leading-[16.5px] text-[#1447E6]">
                  Token Amount
                </span>
              </span>
            </div>
          </div>

          <div className="h-px w-full bg-[#E4E4E7]" />

          <div className="px-4 pt-3 pb-2">
            <p className="font-figtree text-[12px] font-medium leading-[19.5px] text-[#3F3F47]">
              Pay just {tokenAmount} today to lock in your event. The rest is
              due closer to the date.
            </p>
          </div>
        </div>

        <Link
          href={ctaHref}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-full border-t border-[#030303] bg-[#F0596F] px-6 py-2.5 font-figtree text-[15px] font-semibold text-white"
        >
          {ctaLabel}
        </Link>

        <span className="flex items-start gap-2">
          <ShieldCheck size={16} className="mt-0.5 shrink-0 text-[#16A34A]" />
          <span className="font-figtree text-[12px] font-normal leading-[18px] text-[#71717B]">
            {cancellationNote}
          </span>
        </span>

        <button
          type="button"
          onClick={onViewSchedule}
          className="flex w-fit items-center gap-2 font-figtree text-[14px] font-medium leading-[20px] text-[#3F3F47]"
        >
          See full payment schedule
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
