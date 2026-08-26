"use client";

import Image from "next/image";
import { CalendarDays, Clock, MapPin, PartyPopper, Copy, ClipboardList } from "lucide-react";

export type BookedServiceStatus = "confirmed" | "pending" | "declined";

export type BookedServiceItem = {
  id: string;
  categoryLabel: string;
  categoryIcon: string;
  image: string;
  title: string;
  tier: string;
  date: string;
  time: string;
  location: string;
  eventType: string;
  status: BookedServiceStatus;
};

export type BookingSummaryCardProps = {
  bookingId: string;
  services: BookedServiceItem[];
  onDownloadReceipt?: () => void;
};

const STATUS_STYLES: Record<BookedServiceStatus, { bg: string; dot: string; text: string; label: string }> = {
  confirmed: { bg: "bg-[#F0FDF4]", dot: "bg-[#008236]", text: "text-[#008236]", label: "Confirmed" },
  pending: { bg: "bg-[#FFFBEB]", dot: "bg-[#BB4D00]", text: "text-[#BB4D00]", label: "Awaiting vendor confirmation" },
  declined: { bg: "bg-[#FEF2F2]", dot: "bg-[#B91C1C]", text: "text-[#B91C1C]", label: "Declined" },
};

function StatusBadge({ status }: { status: BookedServiceStatus }) {
  const style = STATUS_STYLES[status];
  return (
    <span className={`flex shrink-0 items-center gap-1.5 rounded-full ${style.bg} px-3 py-1`}>
      <span className={`h-[7px] w-[7px] rounded-full ${style.dot}`} />
      <span className={`font-figtree text-[14px] font-semibold ${style.text}`}>{style.label}</span>
    </span>
  );
}

function BookedServiceRow({ item }: { item: BookedServiceItem }) {
  return (
    <div className="flex w-full flex-col gap-4 border-b border-[#E4E4E7] pb-4 last:border-b-0 last:pb-0 sm:flex-row sm:items-center sm:gap-3">
      <div className="relative h-[130px] w-full shrink-0 overflow-hidden rounded-[8px] bg-[#F4F4F5] sm:w-[120px]">
        <Image src={item.image} alt={item.title} fill className="object-cover" />
      </div>

      <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="flex flex-col gap-3">
          <span
            className="flex h-6 w-fit items-center gap-2 rounded-full py-1 pr-3 pl-1"
            style={{ background: "linear-gradient(90deg, white 0%, #FFE5E9 80%)" }}
          >
            <Image src={item.categoryIcon} alt="" width={16} height={16} className="rounded-full object-cover" />
            <span className="font-figtree text-[12px] font-bold leading-[18px] text-[#3C060D]">
              {item.categoryLabel.toUpperCase()}
            </span>
          </span>

          <div className="flex flex-wrap items-center gap-1">
            <span className="font-figtree text-[16px] font-medium text-[#030303]">{item.title}</span>
            <span className="h-[3px] w-[3px] shrink-0 rounded-full bg-[#3F3F47]" />
            <span className="font-figtree text-[16px] font-medium text-[#71717B]">{item.tier}</span>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="flex items-center gap-2 font-figtree text-[14px] text-[#3F3F47]">
              <CalendarDays size={16} />
              {item.date}
            </span>
            {item.time && (
              <span className="flex items-center gap-2 font-figtree text-[14px] text-[#3F3F47]">
                <Clock size={16} />
                {item.time}
              </span>
            )}
            <span className="flex items-center gap-2 font-figtree text-[14px] text-[#3F3F47]">
              <MapPin size={16} />
              {item.location}
            </span>
            <span className="flex items-center gap-2 font-figtree text-[14px] text-[#3F3F47]">
              <PartyPopper size={16} />
              {item.eventType}
            </span>
          </div>
        </div>

        <StatusBadge status={item.status} />
      </div>
    </div>
  );
}

export default function BookingSummaryCard({ bookingId, services, onDownloadReceipt }: BookingSummaryCardProps) {
  return (
    <div className="flex w-full flex-col gap-4 rounded-[16px] border border-[#E4E4E7] bg-white p-4 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <ClipboardList size={24} className="shrink-0 text-[#030303]" />
          <div className="flex flex-col gap-1">
            <h2 className="font-figtree text-[18px] font-semibold leading-[28px] text-[#09090B] sm:text-[20px]">
              Booking Summary
            </h2>
            <div className="flex items-center gap-1.5">
              <span className="font-figtree text-[14px] font-medium text-[#3F3F47]">Booking ID:</span>
              <span className="font-figtree text-[14px] font-semibold text-[#3F3F47]">{bookingId}</span>
              <Copy size={14} className="cursor-pointer text-[#9F9FA9]" />
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onDownloadReceipt}
          className="font-figtree text-[14px] font-semibold text-[#3F3F47] underline sm:text-[16px]"
        >
          Download receipt
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {services.map((item) => (
          <BookedServiceRow key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
