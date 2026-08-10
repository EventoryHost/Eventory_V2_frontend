"use client";

import { useState } from "react";

export type TokenPaymentSectionProps = {
  percentageLabel: string;
  amount: string;
  onNotesChange?: (notes: string) => void;
};

export default function TokenPaymentSection({
  percentageLabel,
  amount,
  onNotesChange,
}: TokenPaymentSectionProps) {
  const [notes, setNotes] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value);
    onNotesChange?.(e.target.value);
  };

  return (
    <div className="flex w-full max-w-[376px] flex-col gap-4 border-t border-[#E5E5E5] pt-8 pb-4">
      <div className="flex w-full max-w-[376px] flex-col gap-4 rounded-[8px] border border-[#FFEBCC] bg-[#FFFBF5] pt-3 pr-4 pb-3 pl-4">
        <div className="flex w-full max-w-[342px] items-center justify-between border-b border-[#FFEBCC] py-2">
          <span className="font-figtree text-[15px] font-normal text-[#131414]">
            {percentageLabel}
          </span>
          <span className="font-figtree text-[20px] font-bold text-[#F0596F]">
            {amount}
          </span>
        </div>

        <p className="w-full max-w-[342px] font-figtree text-[14px] font-normal text-[#444748] opacity-80">
          Pay only the <span className="font-bold">Token amount</span> now to
          confirm your Booking.
        </p>
      </div>

      <p className="text-center font-figtree text-[12px] font-normal text-[#444748]">
        *Any changes or req of Advance payments will be informed within 1-2
        days.
      </p>

      <div className="flex flex-col gap-1">
        <h4 className="font-figtree text-[13px] font-medium text-[#101828]">
          Add Booking Notes
        </h4>

        <textarea
          value={notes}
          onChange={handleChange}
          placeholder="Specify any special requests or instructions..."
          className="h-24 w-full resize-none rounded-[8px] bg-[#F4F4F5] px-4 py-3 font-figtree text-[15px] font-normal text-[#101828] placeholder:text-[#9F9FA9] outline-none"
        />
      </div>
    </div>
  );
}
