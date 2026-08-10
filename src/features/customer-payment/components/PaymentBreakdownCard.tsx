"use client";

import { Share2, Download } from "lucide-react";

export type PaymentBreakdownCardProps = {
  rows: { label: string; value: string }[];
  grandTotalLabel: string;
  grandTotalValue: string;
  onShare?: () => void;
  onDownload?: () => void;
};

export default function PaymentBreakdownCard({
  rows,
  grandTotalLabel,
  grandTotalValue,
  onShare,
  onDownload,
}: PaymentBreakdownCardProps) {
  return (
    <div className="flex w-full max-w-[760px] flex-col gap-3 rounded-[24px] border border-[#E4E4E7] bg-white p-6">
      <h2 className="font-figtree text-[16px] font-bold leading-[24px] tracking-[-0.24px] text-[#030303]">
        What&apos;s paid, what&apos;s next
      </h2>

      <div className="flex flex-col gap-3">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between">
            <span className="font-figtree text-[14px] font-normal leading-[20px] text-[#3F3F47]">
              {row.label}
            </span>
            <span className="font-figtree text-[14px] font-semibold leading-[20px] text-[#030303]">
              {row.value}
            </span>
          </div>
        ))}
      </div>

      <div className="h-px w-full bg-[#E4E4E7]" />

      <div className="flex items-center justify-between">
        <span className="font-figtree text-[16px] font-semibold leading-[24px] text-[#030303]">
          {grandTotalLabel}
        </span>
        <span className="font-figtree text-[18px] font-bold leading-[24px] text-[#030303]">
          {grandTotalValue}
        </span>
      </div>

      <div className="mt-1 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onShare}
          className="flex h-11 w-[228px] items-center justify-center gap-2 rounded-[8px] border border-[#EA1D3B] pt-[11px] pr-6 pb-[11px] pl-6 font-figtree text-[14px] font-medium text-[#EA1D3B]"
        >
          <Share2 size={16} />
          Share booking summary
        </button>

        <button
          type="button"
          onClick={onDownload}
          className="flex h-11 w-[228px] items-center justify-center gap-2 rounded-[8px] border border-[#E4E4E7] pt-[11px] pr-6 pb-[11px] pl-6 font-figtree text-[14px] font-medium text-[#030303]"
        >
          <Download size={16} />
          Download summary
        </button>
      </div>
    </div>
  );
}
