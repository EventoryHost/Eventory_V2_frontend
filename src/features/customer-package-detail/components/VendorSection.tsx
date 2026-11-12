import Link from "next/link";
import { BadgeCheck, Star } from "lucide-react";
import type { VendorInfo } from "../types";
import SectionHeading from "./SectionHeading";

// Platform-wide promises shown on every vendor card (Figma node 3233:26698).
const PROMISES = [
  { label: "Verified professionals", icon: "/images/customer/package-detail/promise-shield.svg" },
  { label: "On-time setup", icon: "/images/customer/package-detail/promise-clock.svg" },
  { label: "Same-day setup", icon: "/images/customer/package-detail/promise-bolt.svg" },
  { label: "Premium materials", icon: "/images/customer/package-detail/promise-star.svg" },
  { label: "Best price promise", icon: "/images/customer/package-detail/promise-tag.svg" },
];

export default function VendorSection({ vendor }: { vendor: VendorInfo }) {
  const subtitleParts = [
    vendor.eventsCount > 0 ? `${vendor.eventsCount} Events` : null,
    vendor.yearsExperience > 0 ? `${vendor.yearsExperience}+ Years of Experience` : null,
  ].filter((part): part is string => part !== null);

  // A stat only shows when the vendor actually has that number.
  const stats = [
    vendor.eventsCount > 0 ? { value: String(vendor.eventsCount), label: "Events done" } : null,
    vendor.yearsExperience > 0 ? { value: `${vendor.yearsExperience}+ yrs`, label: "Experience" } : null,
    vendor.teamSize ? { value: vendor.teamSize, label: "Team members" } : null,
  ].filter((stat): stat is { value: string; label: string } => stat !== null);

  return (
    <section id="vendor" className="border-t border-black/5 pt-8">
      {/* Desktop/tablet layout — Figma node 3233:26698. */}
      <div className="hidden md:block">
        <SectionHeading>Meet our Vendor</SectionHeading>

        <div className="overflow-hidden rounded-2xl border border-[#E4E4E7] bg-white">
          <div className="flex flex-col gap-5 px-6 pt-6 pb-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3.5">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#FEF5F7] font-figtree text-[20px] leading-7 font-semibold text-[#B91D34]">
                  {vendor.initials}
                </div>
                <div className="flex min-w-0 flex-col gap-0.5">
                  <h3 className="truncate font-figtree text-[20px] leading-7 font-semibold text-[#030303]">{vendor.name}</h3>
                  {vendor.verified && (
                    <span className="flex items-center gap-1 font-figtree text-[14px] leading-5 font-medium text-[#1447E6]">
                      <img src="/images/customer/package-detail/vendor-verified-circle.svg" alt="" className="h-[18px] w-[18px]" />
                      Eventory Verified
                    </span>
                  )}
                </div>
              </div>
              <Link
                href={vendor.href}
                className="shrink-0 rounded-xl border border-[#D4D4D8] px-4 py-2 font-figtree text-[14px] leading-5 font-medium text-[#030303] transition hover:bg-black/5"
              >
                View profile
              </Link>
            </div>

            {stats.length > 0 && (
              <div className="flex items-center rounded-xl bg-[#FAFAFA] py-3">
                {stats.map((stat, index) => (
                  <div key={stat.label} className="flex flex-1 items-center">
                    {index > 0 && <span className="h-8 w-px shrink-0 bg-[#E4E4E7]" />}
                    <div className="flex flex-1 flex-col gap-0.5 px-4">
                      <p className="font-figtree text-[20px] leading-7 font-semibold tracking-[-0.4px] whitespace-nowrap text-[#030303]">
                        {stat.value}
                      </p>
                      <p className="font-figtree text-[12px] leading-[18px] text-[#3F3F47]">{stat.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 border-t border-[#E4E4E7] bg-gradient-to-b from-[#FDEEF0]/0 to-[#FDEEF0] px-5 py-3">
            <p className="font-figtree text-[12px] leading-4 font-semibold text-[#B91D34] uppercase">Every Eventory booking</p>
            <div className="flex flex-wrap gap-x-3 gap-y-2">
              {PROMISES.map((promise) => (
                <div key={promise.label} className="flex items-center gap-2.5">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white">
                    <img src={promise.icon} alt="" className="h-[18px] w-[18px]" />
                  </span>
                  <span className="font-figtree text-[14px] leading-5 whitespace-nowrap text-[#3F3F47]">{promise.label}</span>
                </div>
              ))}
            </div>
          </div>
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
