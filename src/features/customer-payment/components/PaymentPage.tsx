"use client";

import PaymentPageHeader from "./PaymentPageHeader";
import PaymentMethodSelector from "./PaymentMethodSelector";
import PaymentSummary from "@/features/customer-booking/components/PaymentSummary";
import { useBookingSummaryData } from "@/features/customer-booking/hooks/useBookingSummaryData";

export default function PaymentPage() {
  const { data, loading, error, applyCoupon, couponLoading, couponFeedback } = useBookingSummaryData();

  return (
    <div className="mx-auto w-full max-w-[1320px] px-4 pt-8 pb-16 sm:px-6 lg:px-16">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
        <div className="flex w-full flex-col gap-6 lg:flex-1">
          <PaymentPageHeader />
          <PaymentMethodSelector />
        </div>

        <div className="w-full lg:w-[424px] lg:shrink-0">
          {loading && (
            <p className="text-center font-figtree text-[13px] text-[#71717B]">Loading summary…</p>
          )}
          {!loading && error && (
            <p className="text-center font-figtree text-[13px] text-[#B91C1C]">{error}</p>
          )}
          {!loading && !error && data && (
            <PaymentSummary
              vendorCount={data.paymentSummary.vendorCount}
              packageCount={data.paymentSummary.packageCount}
              rows={data.paymentSummary.rows}
              grandTotal={data.paymentSummary.grandTotal}
              tokenAmount={data.paymentSummary.tokenAmount}
              payInFull={data.paymentSummary.payInFull}
              cancellationNote={data.paymentSummary.cancellationNote}
              ctaLabel="Pay Now"
              ctaHref="/booking-success"
              ctaDisabled={data.vendorGroups.length === 0}
              onApplyCoupon={applyCoupon}
              couponLoading={couponLoading}
              couponFeedback={couponFeedback}
            />
          )}
        </div>
      </div>
    </div>
  );
}
