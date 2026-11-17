"use client";

import { X } from "lucide-react";

/**
 * Shown above the Contact step when the customer comes back from Cashfree
 * without a completed payment (cancelled, failed or expired). The booking
 * session is still saved, so the message says so and points at the payment
 * button to try again.
 */
export default function PaymentFailedBanner({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div role="alert" className="relative rounded-2xl border border-[#E7000B] bg-[#FEF2F2] px-6 py-5">
      <button
        type="button"
        aria-label="Dismiss"
        onClick={onDismiss}
        className="absolute top-4 right-4 flex h-6 w-6 items-center justify-center text-[#030303] transition hover:opacity-70"
      >
        <X size={18} />
      </button>
      <div className="flex items-center gap-3 pr-8">
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#C10007] font-figtree text-[12px] leading-none font-bold text-white">
          i
        </span>
        <p className="font-figtree text-[20px] leading-7 font-semibold text-[#C10007]">Your payment didn&apos;t go through</p>
      </div>
      <p className="mt-2 pl-8 font-figtree text-[15px] leading-6 text-[#B91C1C] pr-8">
        Your payment couldn&apos;t be completed this time. Your booking is still saved, and if any amount was deducted,
        it&apos;ll be refunded automatically. Choose a payment method below and try once more.
      </p>
    </div>
  );
}
