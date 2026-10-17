"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import {
  getPopularPackages,
  getPackageImage,
  getPackageStartingPrice,
  type RawPackage,
} from "@/lib/customerDiscoveryApi";
import { VENDOR_TYPE_TO_CATEGORY } from "@/lib/vendorType";
import { VENDOR_CATEGORIES } from "@/features/customer-vendors/data/filterConfig";

const FALLBACK_IMAGE = "/images/customer/packages-pics.png";

type TrendingPackage = {
  id: string;
  title: string;
  thumb: string;
  categoryLabel: string;
  price: string;
  href: string;
};

function toTrendingPackage(pkg: RawPackage): TrendingPackage {
  const categoryId = VENDOR_TYPE_TO_CATEGORY[pkg.vendorType];
  const categoryLabel = VENDOR_CATEGORIES.find((c) => c.id === categoryId)?.label ?? pkg.vendorType;
  return {
    id: pkg._id,
    title: pkg.step1_eventAndCrew?.packageName ?? "Package",
    thumb: getPackageImage(pkg) ?? FALLBACK_IMAGE,
    categoryLabel,
    price: `From ₹${getPackageStartingPrice(pkg).toLocaleString("en-IN")}`,
    href: `/packages/${pkg._id}`,
  };
}

// Figma: https://www.figma.com/design/fKzA9Z3TJHMEL93WM31azx/Customer-Side---Final-Dev?node-id=2679-31218
export default function BlogsSidebar() {
  const [trendingPackages, setTrendingPackages] = useState<TrendingPackage[]>([]);

  useEffect(() => {
    let cancelled = false;
    getPopularPackages({ limit: 4 })
      .then((response) => {
        if (!cancelled) setTrendingPackages(response.packages.map(toTrendingPackage));
      })
      .catch(() => {
        // Best-effort — the Trending section just stays empty on failure.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex w-full flex-col items-start gap-6">
      <div className="relative flex h-[600px] w-full flex-col justify-between overflow-hidden rounded-[20px] p-7">
        <Image
          src="/images/customer/blogs/sidebar-promo-banner.png"
          alt=""
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[rgba(61,5,13,0.05)] via-[45%] via-[rgba(61,5,13,0.35)] to-[rgba(61,5,13,0.92)]" />

        <div className="relative flex items-center justify-between">
          <span className="rounded-full bg-[#FFD230] px-3 py-1.5 font-figtree text-[12px] font-bold tracking-normal text-[#3C060D] uppercase">
            Festive offer
          </span>
          <span className="rounded-full bg-white px-2.5 py-1 font-figtree text-[12px] font-medium text-[#3C060D]">
            Ad
          </span>
        </div>

        <div className="relative flex flex-col gap-3.5">
          <p className="font-figtree text-[12px] font-bold tracking-normal text-[#FFD230] uppercase">
            Up to 20% off
          </p>
          <h3 className="font-figtree text-[26px] leading-[32px] font-semibold text-white sm:text-[32px] sm:leading-[36px]">
            Diwali packages for{" "}
            <span className="italic" style={{ fontFamily: "var(--font-lora)", color: "#FCDEE2" }}>
              every home
            </span>
          </h3>
          <p className="font-figtree text-[16px] leading-[24px] font-medium text-white">
            Décor, catering and DJ packages from verified vendors in Jaipur. Book by 25 Oct to lock your date.
          </p>
          <a
            href="/packages/browse"
            className="flex w-full items-center justify-center gap-2.5 rounded-full bg-white px-6 py-4 font-figtree text-[16px] font-semibold text-[#F0596F]"
          >
            Browse Diwali packages
            <ArrowRight size={16} />
          </a>
          <p className="font-figtree text-[12px] font-medium text-white opacity-85">
            Free cancellation on most packages &middot; T&amp;Cs apply
          </p>
        </div>
      </div>

      <div className="flex w-full flex-col items-start gap-[18px] rounded-2xl border border-[#F4F4F5] bg-white p-6">
        <p className="font-figtree text-[20px] font-semibold text-[#1E0306]">Trending this week</p>

        {trendingPackages.length === 0 ? (
          <p className="font-figtree text-[13px] text-[#9F9FA9]">No trending packages yet.</p>
        ) : (
          trendingPackages.map((pkg, index) => (
            <a key={pkg.id} href={pkg.href} className="flex w-full flex-col gap-[18px]">
              {index > 0 && <div className="h-px w-full bg-[#F4F4F5]" />}
              <div className="flex w-full items-center gap-3.5">
                <div className="relative size-[72px] shrink-0 overflow-hidden rounded-xl">
                  <Image src={pkg.thumb} alt={pkg.title} fill className="object-cover" />
                </div>
                <div className="flex flex-1 flex-col gap-1.5">
                  <p className="truncate font-figtree text-[14px] leading-[20px] font-semibold text-[#18181B]">
                    {pkg.title}
                  </p>
                  <p className="font-figtree text-[12px] font-medium text-[#71717B]">
                    {pkg.categoryLabel} &middot; {pkg.price}
                  </p>
                </div>
              </div>
            </a>
          ))
        )}
      </div>

      <div className="flex w-full flex-col items-start gap-3.5 rounded-2xl border border-[#FFFBEB] bg-[#FFFBEB] p-6">
        <p className="font-figtree text-[20px] font-semibold text-[#1E0306]">Event ideas in your inbox</p>
        <p className="font-figtree text-[14px] leading-[20px] font-medium text-[#71717B]">
          One email a month with seasonal themes, budgets and vendor offers.
        </p>
        <input
          type="email"
          placeholder="Your email address"
          className="h-12 w-full rounded-full border border-[#F4F4F5] bg-white px-4 font-figtree text-[14px] font-medium text-[#3F3F47] placeholder:text-[#9F9FA9] outline-none focus:border-[#F0596F]/40"
        />
        <button
          type="button"
          className="w-full rounded-full bg-[#F0596F] py-4 font-figtree text-[16px] font-semibold text-white"
        >
          Subscribe
        </button>
      </div>
    </div>
  );
}
