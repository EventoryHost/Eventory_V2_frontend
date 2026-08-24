"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Calendar,
  Clock,
  MapPin,
  Tag,
  Pencil,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import ServiceDetailsModal from "./ServiceDetailsModal";
import AddOnRow from "./AddOnRow";
import type { BookingAddon } from "../types";

const FALLBACK_IMAGE = "/images/customer/packages-pics.png";

export type ServiceBookingCardProps = {
  packageId?: string;
  cartItemId?: string;
  image: string;
  categoryLabel: string;
  categoryIcon: string;
  vendorName: string;
  serviceName: string;
  packageTier: string;
  date: string;
  time: string;
  location: string;
  eventType?: string;
  cancellationNote: string;
  price: string;
  addons?: BookingAddon[];
  note?: string;
  onUpdated?: () => void;
};

export default function ServiceBookingCard({
  packageId,
  cartItemId,
  image,
  categoryLabel,
  categoryIcon,
  vendorName,
  serviceName,
  packageTier,
  date,
  time,
  location,
  eventType,
  cancellationNote,
  price,
  addons = [],
  note = "",
  onUpdated,
}: ServiceBookingCardProps) {
  const [isAddonsOpen, setIsAddonsOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  return (
    <div className="flex w-full max-w-[799px] flex-col overflow-hidden rounded-[24px] border border-[#E4E4E7] bg-white">
      <div className="flex flex-col gap-4 sm:h-[246px] sm:flex-row">
        <div className="relative h-[220px] w-full shrink-0 sm:h-full sm:w-[226px]">
          <Image src={image} alt={serviceName} fill className="object-cover" />
        </div>

        <div className="flex flex-1 flex-col justify-center gap-2 p-6 sm:overflow-hidden sm:py-4 sm:pr-6 sm:pl-0">
          <div className="flex items-start justify-between gap-4">
            <div
              className="flex w-fit shrink-0 items-center gap-2 rounded-[52px] pt-1 pr-3 pb-1 pl-1"
              style={{
                background: "linear-gradient(to left, #FFE5E9, #ffffff)",
              }}
            >
              <Image
                src={categoryIcon}
                alt={categoryLabel}
                width={16}
                height={16}
                className="h-4 w-4 rounded-full object-contain"
              />
              <span className="font-figtree text-[12px] font-semibold text-brand-950 uppercase whitespace-nowrap">
                {categoryLabel}
              </span>
            </div>

            <Link
              href="/cart"
              className="flex shrink-0 items-center gap-1.5 font-figtree text-[14px] font-semibold leading-[22px] text-[#3F3F47]"
            >
              <Pencil size={14} />
              Edit Package
            </Link>
          </div>

          <div className="flex flex-wrap items-baseline gap-1">
            <span className="font-figtree text-[16px] font-medium leading-none text-[#030303]">
              {serviceName}
            </span>
            <span className="font-figtree text-[16px] font-medium leading-none text-[#71717B]">
              &middot; {packageTier}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <span className="flex items-center gap-2 font-figtree text-[14px] font-normal leading-[22px] text-[#3F3F47]">
              <Calendar size={16} className="text-[#9F9FA9]" />
              {date}
            </span>
            <span className="flex items-center gap-2 font-figtree text-[14px] font-normal leading-[22px] text-[#3F3F47]">
              <Clock size={16} className="text-[#9F9FA9]" />
              {time}
            </span>
            <span className="flex items-center gap-2 font-figtree text-[14px] font-normal leading-[22px] text-[#3F3F47]">
              <MapPin size={16} className="text-[#9F9FA9]" />
              {location}
            </span>
          </div>

          {eventType && (
            <span className="flex items-center gap-2 font-figtree text-[14px] font-normal leading-[22px] text-[#3F3F47]">
              <Tag size={16} className="text-[#9F9FA9]" />
              {eventType}
            </span>
          )}

          <p className="font-figtree text-[14px] font-medium leading-[22px] text-[#008236]">
            {cancellationNote}
          </p>

          <p className="font-figtree text-[20px] font-bold leading-[32px] tracking-[-0.01em] text-[#030303]">
            {price}
          </p>

          <button
            type="button"
            onClick={() => setIsDetailsOpen(true)}
            className="flex w-fit items-center gap-1 font-figtree text-[14px] font-medium text-[#030303] underline"
          >
            View full details
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setIsAddonsOpen((v) => !v)}
        disabled={addons.length === 0}
        className="flex h-[45px] w-full items-center justify-between border-t border-[#E4E4E7] bg-[#FAFAFA] px-6 disabled:opacity-50"
      >
        <span className="font-figtree text-[14px] font-medium text-[#030303]">
          Add-ons {addons.length > 0 ? `(${addons.length})` : ""}
        </span>
        <ChevronDown
          size={16}
          className={`text-[#3F3F47] transition-transform ${
            isAddonsOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isAddonsOpen && addons.length > 0 && (
        <div className="flex flex-col gap-4 border-t border-[#E4E4E7] px-6 py-4">
          {addons.map((addon) => (
            <AddOnRow
              key={addon.id}
              image={FALLBACK_IMAGE}
              name={addon.name}
              quantity={addon.quantity}
              price={addon.price}
            />
          ))}
        </div>
      )}

      <ServiceDetailsModal
        packageId={packageId}
        cartItemId={cartItemId}
        vendorName={vendorName}
        serviceName={serviceName}
        packageTier={packageTier}
        date={date}
        time={time}
        location={location}
        eventType={eventType}
        price={price}
        addons={addons}
        note={note}
        onNoteSaved={onUpdated}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
      />
    </div>
  );
}
