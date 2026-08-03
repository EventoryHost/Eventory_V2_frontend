"use client";

import Image from "next/image";
import { Star, Pencil } from "lucide-react";
import type { ReactNode } from "react";

export type BookingVendorCardProps = {
  avatar: string;
  vendorName: string;
  rating: number;
  reviewCount: number;
  onEdit?: () => void;
  children?: ReactNode;
};

export default function BookingVendorCard({
  avatar,
  vendorName,
  rating,
  reviewCount,
  onEdit,
  children,
}: BookingVendorCardProps) {
  return (
    <div className="w-full max-w-[868px] rounded-[10px] border border-[#E5E7EB] pt-px pr-5 pb-6 pl-5">
      <div className="flex items-center justify-between gap-4 border-b border-[#E5E7EB] py-4">
        <div className="flex items-center gap-3">
          <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full">
            <Image src={avatar} alt={vendorName} fill className="object-cover" />
          </span>

          <div>
            <h3 className="font-figtree text-[20px] font-bold text-[#101828]">
              {vendorName}
            </h3>
            <div className="mt-1 flex items-center gap-1.5">
              <Star size={16} className="fill-[#EA1D3B] text-[#EA1D3B]" />
              <span className="font-figtree text-[14px] font-bold text-[#EA1D3B]">
                {rating}
              </span>
              <span className="font-figtree text-[14px] font-normal text-body-secondary">
                ({reviewCount} Reviews)
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onEdit}
          className="flex shrink-0 items-center gap-2 rounded-full border border-[#E5E7EB] px-4 py-2 font-figtree text-[14px] font-medium text-[#101828]"
        >
          <Pencil size={14} />
          Edit
        </button>
      </div>

      {children && <div className="pt-6">{children}</div>}
    </div>
  );
}
