"use client";

import Image from "next/image";
import type { BookingPackageRow } from "../types";

const TONE_CLASS: Record<BookingPackageRow["statusTone"], string> = {
  pending: "bg-[#FFF7ED] text-[#BB4D00]",
  confirmed: "bg-[#ECFDF3] text-[#008236]",
  cancelled: "bg-[#FEF2F2] text-[#C81E0D]",
  completed: "bg-[#F4F4F5] text-[#3F3F47]",
};

/**
 * The "Your Packages" tab — one row per package in the event, with the
 * vendor's own status. Each row opens that package's full panel.
 */
export default function BookingPackagesList({
  packages,
  onOpen,
}: {
  packages: BookingPackageRow[];
  onOpen: (reference: string) => void;
}) {
  if (packages.length === 0) {
    return <p className="text-[14px] leading-5 text-[#71717B]">No packages on this booking.</p>;
  }

  return (
    <ul className="flex flex-col gap-4">
      {packages.map((row) => (
        <li key={row.id}>
          <button
            type="button"
            onClick={() => onOpen(row.reference)}
            className="flex w-full items-center gap-4 rounded-2xl border border-[#E4E4E7] bg-white p-3.5 text-left transition-colors hover:border-[#D4D4D8]"
          >
            <div className="relative h-[66px] w-[67px] shrink-0 overflow-hidden rounded-xl bg-[#F4F4F5]">
              {row.image && (
                <Image src={row.image} alt={row.name} fill sizes="67px" className="object-cover" />
              )}
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <p className="truncate text-[14px] font-semibold leading-[21px] text-[#030303]">
                {row.name}
                {row.variantLabel ? ` · ${row.variantLabel}` : ""}
              </p>
              {row.vendorName && (
                <p className="truncate text-[14px] leading-5 text-[#71717B]">{row.vendorName}</p>
              )}
              <p className="text-[12px] leading-[18px] text-[#9F9FA9]">{row.reference}</p>
            </div>

            <span
              className={`shrink-0 rounded-md px-2.5 py-1 text-[12px] font-semibold leading-[17px] ${TONE_CLASS[row.statusTone]}`}
            >
              {row.statusLabel}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
