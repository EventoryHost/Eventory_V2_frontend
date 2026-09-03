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
              <h3 className="font-figtree text-[16px] font-bold text-brand-950">Hosted by {vendor.name}</h3>
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
    </section>
  );
}
