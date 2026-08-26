"use client";

import { Wallet, Info, ChevronRight } from "lucide-react";

export type VendorNextPayment = {
  id: string;
  vendorName: string;
  status: "due";
  dueLabel: string;
  amount: string;
};

export type YourPaymentsCardProps = {
  totalCost: string;
  paidToday: string;
  stillToPay: string;
  nextPayments: VendorNextPayment[];
  onSeeFullSchedule?: () => void;
};

function AmountRow({ label, value, valueClassName = "text-[#09090B]" }: { label: string; value: string; valueClassName?: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-3">
      <span className="font-figtree text-[15px] font-medium text-[#3F3F47] sm:text-[16px]">{label}</span>
      <span className={`font-figtree text-[18px] font-semibold sm:text-[20px] ${valueClassName}`}>{value}</span>
    </div>
  );
}

function NextPaymentRow({ payment }: { payment: VendorNextPayment }) {
  return (
    <div className="rounded-[12px] border-l-2 border-[#BB4D00]">
      <div className="flex items-center justify-between gap-3 rounded-[12px] border border-[#E4E4E7] bg-white px-4 py-3.5">
        <div className="flex flex-col gap-1.5">
          <span className="font-figtree text-[16px] font-semibold text-black">{payment.vendorName}</span>
          <span className="flex items-center gap-1.5 font-figtree text-[14px] font-normal text-[#71717B]">
            Next payment
            <span className="h-[2.5px] w-[2.5px] rounded-full bg-[#9F9FA9]" />
            {payment.dueLabel}
          </span>
        </div>
        <span className="shrink-0 font-figtree text-[18px] font-semibold text-black sm:text-[20px]">
          {payment.amount}
        </span>
      </div>
    </div>
  );
}

export default function YourPaymentsCard({
  totalCost,
  paidToday,
  stillToPay,
  nextPayments,
  onSeeFullSchedule,
}: YourPaymentsCardProps) {
  return (
    <div className="flex w-full flex-col rounded-[16px] border border-[#E4E4E7] bg-white p-4 sm:p-6">
      <div className="flex items-center gap-2">
        <Wallet size={24} className="shrink-0 text-[#030303]" />
        <h2 className="font-figtree text-[18px] font-semibold leading-[28px] text-[#09090B] sm:text-[20px]">
          Your payments
        </h2>
      </div>

      <div className="flex flex-col divide-y divide-[#E4E4E7]">
        <AmountRow label="Total cost of packages" value={totalCost} valueClassName="text-black" />
        <AmountRow label="Amount paid today (token to lock your date)" value={paidToday} valueClassName="text-[#008236]" />
      </div>
      <div className="pt-5">
        <AmountRow label="Still to pay" value={stillToPay} />
      </div>

      {nextPayments.length > 0 ? (
        <div className="flex flex-col gap-4 pt-4">
          <span className="font-figtree text-[15px] font-semibold text-[#3F3F47] sm:text-[16px]">
            Next payment for each vendor
          </span>
          <div className="flex flex-col gap-4">
            {nextPayments.map((payment) => (
              <NextPaymentRow key={payment.id} payment={payment} />
            ))}
          </div>

          <button
            type="button"
            onClick={onSeeFullSchedule}
            className="flex items-center gap-2 self-start font-figtree text-[14px] text-[#71717B]"
          >
            Each vendor sets its own payment timeline.
            <span className="flex items-center gap-1 font-semibold text-[#3F3F47]">
              See full schedule
              <ChevronRight size={16} />
            </span>
          </button>
        </div>
      ) : (
        <p className="pt-4 font-figtree text-[14px] font-medium text-[#008236]">
          You&apos;re paid in full — nothing else is due.
        </p>
      )}

      <div className="flex items-start gap-2 pt-5">
        <Info size={18} className="mt-0.5 shrink-0 text-[#71717B]" />
        <p className="font-figtree text-[14px] font-normal text-[#71717B]">
          We&apos;ll handle the rest on each vendor&apos;s schedule — and remind you before every payment.
        </p>
      </div>
    </div>
  );
}
