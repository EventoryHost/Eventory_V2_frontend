"use client";

import Link from "next/link";
import { Send, Headphones } from "lucide-react";

export type PaymentActionsProps = {
  onContinue?: () => void;
  onContactSupport?: () => void;
};

export default function PaymentActions({
  onContinue,
  onContactSupport,
}: PaymentActionsProps) {
  return (
    <div className="flex w-full max-w-[376px] flex-col items-center gap-4">
      <Link
        href="/payment"
        onClick={onContinue}
        style={{ fontFamily: "var(--font-inter)" }}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-[8px] bg-[#F0596F] pt-[13.5px] pb-[14.5px] text-[14px] font-bold leading-[20px] tracking-[0.14px] text-white shadow-md transition-colors hover:bg-[#E43F58]"
      >
        Continue
        <Send size={16} />
      </Link>

      <button
        type="button"
        onClick={onContactSupport}
        style={{ fontFamily: "var(--font-inter)" }}
        className="flex items-center gap-2 text-[14px] font-bold leading-[20px] tracking-[0.14px] text-[#0448FF] transition-colors hover:text-[#0336CC]"
      >
        <Headphones size={16} />
        Contact EMS Support
      </button>

      <p
        style={{ fontFamily: "var(--font-inter)" }}
        className="text-center text-[12px] font-normal leading-[16px] tracking-[0px] text-[#444748]"
      >
        By proceeding, you agree to Eventory&apos;s{" "}
        <a href="#" className="underline">
          Terms of Service
        </a>{" "}
        and Vendor&apos;s cancellation policy.
      </p>
    </div>
  );
}
