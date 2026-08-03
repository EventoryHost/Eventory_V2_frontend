"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export type UpiQrPanelProps = {
  amountLabel: string;
};

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export default function UpiQrPanel({ amountLabel }: UpiQrPanelProps) {
  const [secondsLeft, setSecondsLeft] = useState(300);
  const [upiId, setUpiId] = useState("");

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [secondsLeft]);

  return (
    <div className="grid w-full max-w-[754px] grid-cols-1 gap-8 sm:grid-cols-2">
      <div className="flex h-full max-w-[361px] flex-col items-center gap-4 rounded-[12px] border border-dashed border-[#C4C7C7] bg-[#F5F3F3] p-6">
        <div className="rounded-[8px] bg-white p-4 shadow-[0_1px_2px_0_#0000000D]">
          <Image
            src="/images/customer/payment/qr.png"
            alt="Scan to pay"
            width={160}
            height={160}
            className="h-[160px] w-[160px] object-contain"
          />
        </div>

        <p className="font-figtree text-[15px] font-semibold text-[#101828]">
          Scan to pay with any UPI App
        </p>

        <div className="flex items-center gap-2">
          {["GPay", "PhonePe", "Paytm"].map((app) => (
            <span
              key={app}
              className="rounded-[6px] border border-[#E5E5E5] bg-white px-2.5 py-1.5 font-figtree text-[11px] font-semibold text-[#374151]"
            >
              {app}
            </span>
          ))}
        </div>
      </div>

      <div className="flex w-full max-w-[361px] flex-col gap-3 py-[54px]">
        <label className="font-figtree text-[15px] font-normal text-[#101828]">
          or entre your UPI ID
        </label>
        <input
          type="text"
          value={upiId}
          onChange={(e) => setUpiId(e.target.value)}
          placeholder="yourname@bank"
          className="h-11 w-full rounded-[8px] border border-[#E5E5E5] px-4 font-figtree text-[14px] text-[#101828] placeholder:text-[#9CA3AF] outline-none"
        />

        <button
          type="button"
          style={{ fontFamily: "var(--font-inter)" }}
          className="mt-1 flex h-12 w-full items-center justify-center rounded-[8px] bg-[#0F172A] text-[16px] font-normal leading-[24px] tracking-[0px] text-white"
        >
          Verify &amp; Pay {amountLabel}
        </button>

        <p className="text-center font-figtree text-[13px] font-normal text-[#374151]">
          Transaction times out in{" "}
          <span className="font-semibold text-[#DC2626]">
            {formatTime(secondsLeft)}
          </span>
        </p>
      </div>
    </div>
  );
}
