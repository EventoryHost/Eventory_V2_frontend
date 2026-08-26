"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import BookingHeroBanner from "./BookingHeroBanner";
import BookingSummaryCard from "./BookingSummaryCard";
import YourPaymentsCard from "./YourPaymentsCard";
import WhatHappensNextCard from "./WhatHappensNextCard";
import BookingSuccessSidebar from "./BookingSuccessSidebar";
import { useBookingSuccessData } from "../hooks/useBookingSuccessData";

export default function BookingSuccessPage() {
  const searchParams = useSearchParams();
  const bookingIds = (searchParams.get("bookingIds") ?? "").split(",").filter(Boolean);
  const { data, loading, error } = useBookingSuccessData(bookingIds);

  if (bookingIds.length === 0) {
    return (
      <div className="mx-auto w-full max-w-[1320px] px-4 py-16 text-center sm:px-6 lg:px-16">
        <p className="font-figtree text-[15px] text-[#3F3F47]">
          We couldn&apos;t find a booking to show here.
        </p>
        <Link href="/cart" className="mt-3 inline-block font-figtree text-[14px] font-semibold text-[#F0596F] underline">
          Go back to your cart
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-[1320px] px-4 py-16 text-center sm:px-6 lg:px-16">
        <p className="font-figtree text-[14px] text-[#71717B]">Loading your booking…</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto w-full max-w-[1320px] px-4 py-16 text-center sm:px-6 lg:px-16">
        <p className="font-figtree text-[14px] text-[#B91C1C]">{error ?? "Couldn't load your booking."}</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-white">
      <BookingHeroBanner
        customerFirstName={data.customerFirstName}
        eventDateLabel={data.eventDateLabel}
        whatsappNumber={data.whatsappNumber}
      />

      <div className="mx-auto flex w-full max-w-[1320px] flex-col gap-8 px-4 pt-8 pb-16 sm:px-6 lg:flex-row lg:items-start lg:gap-10 lg:px-16">
        <div className="flex w-full flex-col gap-6 lg:max-w-[832px]">
          <BookingSummaryCard bookingId={data.bookingIdLabel} services={data.services} />

          <YourPaymentsCard
            totalCost={data.totalCost}
            paidToday={data.paidToday}
            stillToPay={data.stillToPay}
            nextPayments={data.nextPayments}
          />

          <WhatHappensNextCard />
        </div>

        <div className="w-full lg:sticky lg:top-6 lg:flex-1">
          <BookingSuccessSidebar changeDeadlineLabel={data.changeDeadlineLabel} />
        </div>
      </div>
    </div>
  );
}
