import type { ReactNode } from "react";

export type PaymentSummaryProps = {
  vendorCount: number;
  children?: ReactNode;
};

export default function PaymentSummary({
  vendorCount,
  children,
}: PaymentSummaryProps) {
  return (
    <div className="flex w-full max-w-[424px] flex-col gap-6">
      <div className="flex max-w-[376px] flex-col gap-1">
        <h2 className="font-figtree text-[18px] font-semibold leading-[1.3] text-[#101828]">
          Payment Summary
        </h2>
        <p className="font-figtree text-[14px] font-normal text-body-secondary">
          {vendorCount} vendor selected
        </p>
      </div>

      <div className="h-px w-full bg-[#E5E7EB]" />

      {children}
    </div>
  );
}
