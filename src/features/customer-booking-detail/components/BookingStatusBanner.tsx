"use client";

import Image from "next/image";
import type { BookingBanner } from "../utils/bookingBanner";

const ART: Record<BookingBanner["variant"], string> = {
  confirming: "/images/customer/booking-confirming.png",
  "advance-due": "/images/customer/booking-advance-due.png",
  proposal: "/images/customer/booking-proposal.png",
  "requests-open": "/images/customer/booking-requests-open.png",
  complete: "/images/customer/booking-complete.png",
};

/**
 * The banner above the booking's tabs, in the five states its component set
 * defines (node 1644:10229). Which one shows is decided by bookingBanner.ts;
 * this only renders it.
 */
export default function BookingStatusBanner({
  banner,
  onAction,
  isBusy,
  error,
}: {
  banner: BookingBanner | null;
  onAction: () => void;
  isBusy?: boolean;
  error?: string | null;
}) {
  if (!banner) return null;

  const { action } = banner;
  const isPrimary = action.style === "primary";

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#E4E4E7] bg-[#FAFAFA] py-4 pl-3 pr-4">
        <div className="flex items-center gap-3">
          <Image
            src={ART[banner.variant]}
            alt=""
            width={88}
            height={64}
            className="h-16 w-[88px] shrink-0 object-contain"
          />
          <div className="flex flex-col gap-1.5">
            <p className="text-[18px] font-medium leading-[1.35] tracking-[-0.02em] text-[#030303]">
              {banner.title}
            </p>
            <p className="text-[14px] leading-[21px] text-[#71717B]">{banner.description}</p>
          </div>
        </div>

        {action.disabledReason ? (
          // Designed CTA with nothing behind it yet — inert rather than a
          // button that silently does nothing.
          <span
            title={action.disabledReason}
            className={`cursor-default rounded-full px-5 py-2 text-[14px] font-medium leading-5 ${
              isPrimary ? "bg-brand-primary/60 text-white" : "border border-[#EA1D3B]/50 text-[#EA1D3B]/60"
            }`}
          >
            {action.label}
          </span>
        ) : (
          <button
            type="button"
            onClick={onAction}
            disabled={isBusy}
            className={`rounded-full text-[14px] font-medium leading-5 transition-colors disabled:opacity-60 ${
              isPrimary
                ? "bg-brand-primary px-3 py-2 text-white hover:bg-[#E14E64]"
                : "border border-[#EA1D3B] px-5 py-2 text-[#EA1D3B] hover:bg-[#FEF2F3]"
            }`}
          >
            {isBusy ? "Opening…" : action.label}
          </button>
        )}
      </div>

      {error && <p className="text-[12px] leading-4 text-[#C81E0D]">{error}</p>}
    </div>
  );
}
