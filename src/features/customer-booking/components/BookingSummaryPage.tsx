"use client";

import Link from "next/link";
import BookingSummaryHeader from "./BookingSummaryHeader";
import VendorSummaryRow from "./VendorSummaryRow";
import ServiceBookingCard from "./ServiceBookingCard";
import PaymentSummary from "./PaymentSummary";
import CheckoutLoginGate from "@/features/customer-checkout/components/CheckoutLoginGate";
import { useBookingSummaryData } from "../hooks/useBookingSummaryData";

export default function BookingSummaryPage() {
  const { data, loading, error, refresh, applyCoupon, couponLoading, couponFeedback } = useBookingSummaryData();

  const blockedServices =
    data && !data.readyForPayment ? data.vendorGroups.flatMap((g) => g.services).filter((s) => !s.isBookable) : [];

  return (
    <CheckoutLoginGate>
      <div className="mx-auto w-full max-w-[1320px] px-4 pt-8 pb-16 sm:px-6 lg:px-16">
        <BookingSummaryHeader />

        {loading && (
          <p className="mt-10 text-center font-figtree text-[14px] text-[#71717B]">
            Loading your booking…
          </p>
        )}

        {!loading && error && (
          <div className="mt-6 rounded-2xl border border-[#FCA5A5]/60 bg-[#FEF2F2] px-5 py-4 font-figtree text-[13px] text-[#B91C1C]">
            {error}
          </div>
        )}

        {!loading && !error && data && data.vendorGroups.length === 0 && (
          <div className="mt-10 flex flex-col items-center gap-3 rounded-3xl border border-[#E4E4E7] bg-white py-16 text-center">
            <p className="font-figtree text-[15px] text-[#3F3F47]">
              You don&apos;t have any packages selected for checkout yet.
            </p>
            <Link
              href="/cart"
              className="font-figtree text-[14px] font-semibold text-[#F0596F] underline"
            >
              Go back to your cart
            </Link>
          </div>
        )}

        {!loading && !error && data && data.vendorGroups.length > 0 && blockedServices.length > 0 && (
          <div className="mt-6 rounded-2xl border border-[#FDE68A] bg-[#FFFBEB] px-5 py-4 font-figtree text-[13px] text-[#92400E]">
            Can&apos;t continue yet — {blockedServices.map((s) => `${s.serviceName} (${s.vendorName})`).join(", ")}{" "}
            {blockedServices.length === 1 ? "doesn't" : "don't"} work with the current date, time or guest count. Edit
            the package&apos;s event details (via &quot;Edit Package&quot;) or remove it to continue.
          </div>
        )}

        {!loading && !error && data && (data.lineErrors?.length ?? 0) > 0 && (
          <div className="mt-6 flex flex-col gap-1 rounded-2xl border border-[#FDE68A] bg-[#FFFBEB] px-5 py-4 font-figtree text-[13px] text-[#92400E]">
            <span>You&apos;ll be blocked at the Details step until these are fixed (via &quot;Edit Package&quot;):</span>
            <ul className="list-disc pl-5">
              {data.lineErrors.map((message) => (
                <li key={message}>{message}</li>
              ))}
            </ul>
          </div>
        )}

        {!loading && !error && data && data.vendorGroups.length > 0 && (
          <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-start">
            <div className="flex w-full flex-col gap-8 lg:flex-1">
              {data.vendorGroups.map((group) => (
                <div key={group.vendorId} className="flex w-full flex-col gap-4">
                  <VendorSummaryRow
                    avatar={group.avatar}
                    avatarInitial={group.avatarInitial}
                    vendorName={group.vendorName}
                    rating={group.rating}
                    reviewCount={group.reviewCount}
                    eventsOnEventory={group.eventsOnEventory}
                    packageCount={group.packageCount}
                    subtotal={group.subtotal}
                  />
                  {group.services.map((service) => (
                    <ServiceBookingCard
                      key={service.lineId}
                      packageId={service.packageId}
                      sessionId={data.sessionId}
                      lineId={service.lineId}
                      image={service.image}
                      categoryLabel={service.categoryLabel}
                      categoryIcon={service.categoryIcon}
                      vendorName={service.vendorName}
                      serviceName={service.serviceName}
                      packageTier={service.packageTier}
                      date={service.date}
                      time={service.time}
                      location={service.location}
                      eventType={service.eventType}
                      cancellationNote={service.cancellationNote}
                      isBookable={service.isBookable}
                      price={service.price}
                      addons={service.addons}
                      note={service.note}
                      onUpdated={refresh}
                    />
                  ))}
                </div>
              ))}
            </div>

            <div className="w-full lg:w-[424px] lg:shrink-0">
              <PaymentSummary
                vendorCount={data.paymentSummary.vendorCount}
                packageCount={data.paymentSummary.packageCount}
                rows={data.paymentSummary.rows}
                grandTotal={data.paymentSummary.grandTotal}
                tokenAmount={data.paymentSummary.tokenAmount}
                payInFull={data.paymentSummary.payInFull}
                cancellationNote={data.paymentSummary.cancellationNote}
                ctaLabel="Continue to Details"
                ctaHref="/contact"
                // Not data.canContinue: that also requires contact.valid, which
                // can only become true after the Details step — gating this
                // button on it would make it impossible to ever reach Details.
                ctaDisabled={data.vendorGroups.length === 0 || !data.readyForPayment}
                onApplyCoupon={applyCoupon}
                couponLoading={couponLoading}
                couponFeedback={couponFeedback}
              />
            </div>
          </div>
        )}
      </div>
    </CheckoutLoginGate>
  );
}
