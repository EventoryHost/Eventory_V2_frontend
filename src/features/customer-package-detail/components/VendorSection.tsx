import Link from "next/link";
import { BadgeCheck, Star } from "lucide-react";
import type { VendorInfo } from "../types";
import SectionHeading from "./SectionHeading";

export default function VendorSection({ vendor }: { vendor: VendorInfo }) {
  const subtitleParts = [
    vendor.eventsCount > 0 ? `${vendor.eventsCount} Events` : null,
    vendor.yearsExperience > 0 ? `${vendor.yearsExperience}+ Years of Experience` : null,
  ].filter((part): part is string => part !== null);

  return (
    <section id="vendor" className="border-t border-black/5 pt-8">
      {/* Desktop/tablet layout — unchanged. */}
      <div className="hidden md:block">
        <SectionHeading>Meet our Vendor</SectionHeading>

        <div className="flex flex-col items-start justify-between gap-4 rounded-3xl border border-black/10 p-6 md:flex-row md:items-center">
          <div className="flex items-center gap-4">
            <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#FFEDEF] font-figtree text-[18px] font-bold text-brand-primary">
              {vendor.initials}
              {vendor.rating > 0 && (
                <div className="absolute -bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-0.5 rounded-full bg-brand-950 px-2 py-0.5 font-figtree text-[10px] font-bold text-white">
                  {vendor.rating}
                  <Star className="h-2.5 w-2.5 fill-warning-500 text-warning-500" />
                </div>
              )}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-figtree text-[16px] font-bold text-brand-950">Served by {vendor.name}</h3>
                {vendor.verified && (
                  <span className="flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 font-figtree text-[12px] font-medium text-blue-600">
                    <BadgeCheck className="h-3.5 w-3.5 fill-blue-600 text-white" />
                    Eventory Verified
                  </span>
                )}
              </div>
              {subtitleParts.length > 0 && (
                <p className="mt-1 font-figtree text-[13px] text-neutral-tertiary">{subtitleParts.join(" • ")}</p>
              )}
            </div>
          </div>
          <Link href={vendor.href} className="font-figtree text-[13px] font-semibold text-brand-950 underline">
            Vendor info
          </Link>
        </div>
      </div>

      {/* Mobile layout (Figma node 2565:28382) — avatar carries the rating
          badge instead of the name row, "Served by" becomes "Hosted by",
          and "Vendor info" is a full-width outlined button instead of an
          underlined link. */}
      <div className="flex flex-col gap-[14px] md:hidden">
        <h2 className="flex items-center gap-2 font-figtree text-[18px] font-semibold text-[#222]">
          <span className="h-[22px] w-1 rounded-sm bg-[#F0596F]" />
          Meet our Vendor
        </h2>

        <div className="flex flex-col gap-[14px] rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="relative h-16 w-14 shrink-0">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FDEEF0] font-figtree text-[18px] font-semibold text-[#B4112A]">
                {vendor.initials}
              </div>
              {vendor.rating > 0 && (
                <div className="absolute top-[46px] left-1/2 flex -translate-x-1/2 items-center gap-0.5 rounded-full bg-[#222] px-1.5 py-0.5 font-figtree text-[11px] font-semibold text-white">
                  {vendor.rating}
                  <Star className="h-2.5 w-2.5 fill-white text-white" />
                </div>
              )}
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <p className="font-figtree text-[16px] font-medium whitespace-nowrap text-[#222]">
                  Hosted by {vendor.name}
                </p>
                {vendor.verified && (
                  <span className="flex items-center gap-1 rounded-full bg-[#EFF6FF] px-1.5 py-0.5 font-figtree text-[11px] whitespace-nowrap text-[#1D4ED8]">
                    <BadgeCheck className="h-3 w-3 fill-[#1447E6] text-white" />
                    Verified
                  </span>
                )}
              </div>
              {subtitleParts.length > 0 && (
                <p className="font-figtree text-[12px] whitespace-nowrap text-[#71717B]">
                  {subtitleParts.join(" • ")}
                </p>
              )}
            </div>
          </div>

          <Link
            href={vendor.href}
            className="flex h-[38px] w-full items-center justify-center rounded-full border border-[#222] font-figtree text-[14px] font-medium text-[#222]"
          >
            Vendor info
          </Link>
        </div>
      </div>
    </section>
  );
}
