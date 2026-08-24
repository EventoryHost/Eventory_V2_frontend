"use client";

import Link from "next/link";
import BookingSummaryHeader from "./BookingSummaryHeader";
import VendorSummaryRow from "./VendorSummaryRow";
import ServiceBookingCard from "./ServiceBookingCard";
import PaymentSummary from "./PaymentSummary";
import { useBookingSummaryData } from "../hooks/useBookingSummaryData";

export default function BookingSummaryPage() {
  const { data, loading, error, refresh, applyCoupon, couponLoading, couponFeedback } = useBookingSummaryData();

  return (
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
                    key={service.cartItemId}
                    packageId={service.packageId}
                    cartItemId={service.cartItemId}
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
              onApplyCoupon={applyCoupon}
              couponLoading={couponLoading}
              couponFeedback={couponFeedback}
            />
          </div>
        </div>
      )}
    </div>
  );
}
