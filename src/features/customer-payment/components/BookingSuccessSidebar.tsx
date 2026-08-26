"use client";

import Link from "next/link";
import { MessageCircle, Pencil } from "lucide-react";

export type BookingSuccessSidebarProps = {
  changeDeadlineLabel: string;
  onChangeBookingDetails?: () => void;
};

export default function BookingSuccessSidebar({
  changeDeadlineLabel,
  onChangeBookingDetails,
}: BookingSuccessSidebarProps) {
  return (
    <div className="flex w-full flex-col gap-8 rounded-[16px] border border-[#E4E4E7] bg-white p-5 sm:p-6">
      <div className="flex flex-col gap-3">
        <Link
          href="/dashboard/bookings"
          className="flex w-full items-center justify-center rounded-full bg-[#F0596F] px-7 py-3 font-figtree text-[16px] font-semibold text-white"
        >
          Go to My Bookings
        </Link>
        <button
          type="button"
          className="flex w-full items-center justify-center gap-2 rounded-full border border-[#D4D4D8] bg-white py-[15px] font-figtree text-[16px] font-semibold text-[#09090B]"
        >
          <MessageCircle size={18} />
          Chat with Event manager
        </button>
      </div>

      <div className="flex flex-col gap-4 rounded-[12px] bg-[#FAFAFA] p-5">
        <div className="flex flex-col gap-3">
          <h3 className="font-figtree text-[18px] font-semibold text-[#09090B] sm:text-[20px]">
            Booked the wrong date or event?
          </h3>
          <p className="font-figtree text-[14px] font-medium text-[#71717B]">
            You can still make free changes for the next 24 hours
          </p>
        </div>

        <p className="font-figtree text-[14px] leading-[22.4px] text-[#71717B]">
          Until <span className="font-medium text-[#030303]">{changeDeadlineLabel}</span>, you can change your{" "}
          <span className="font-medium text-[#030303]">event date</span>,{" "}
          <span className="font-medium text-[#030303]">event type</span>, or{" "}
          <span className="font-medium text-[#030303]">guest count</span> at no cost before your vendors start
          prepping. After that, our standard cancellation policy applies.
        </p>

        <button
          type="button"
          onClick={onChangeBookingDetails}
          className="flex w-full items-center justify-center gap-2 rounded-[12px] border border-[#E4E4E7] bg-white py-2.5 font-figtree text-[16px] font-medium text-[#030303]"
        >
          <Pencil size={18} />
          Change booking details
        </button>
      </div>
    </div>
  );
}
