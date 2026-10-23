"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ArrowRight, Star } from "lucide-react";
import {
  getPopularPackages,
  getPackageImage,
  getPackageStartingPrice,
  type RawPackage,
} from "@/lib/customerDiscoveryApi";
import { VENDOR_TYPE_TO_CATEGORY } from "@/lib/vendorType";
import { VENDOR_CATEGORIES } from "@/features/customer-vendors/data/filterConfig";
import { CATEGORY_META } from "@/lib/categoryMeta";

const FALLBACK_IMAGE = "/images/customer/packages-pics.png";
const FALLBACK_CATEGORY_ICON = "/images/customer/packages-pics.png";

type TrendingPackage = {
  id: string;
  title: string;
  thumb: string;
  categoryLabel: string;
  categoryIcon: string;
  categoryGradientFrom: string;
  /** Omitted when the vendor has no real rating yet — never a fabricated "0.0". */
  rating?: number;
  priceValue: string;
  billingUnit?: string;
  href: string;
};

function toTrendingPackage(pkg: RawPackage): TrendingPackage {
  const categoryId = VENDOR_TYPE_TO_CATEGORY[pkg.vendorType];
  const categoryLabel = VENDOR_CATEGORIES.find((c) => c.id === categoryId)?.label ?? pkg.vendorType;
  const meta = categoryId ? CATEGORY_META[categoryId] : undefined;
  const rating = pkg.vendorId?.rating;
  const reviewCount = pkg.vendorId?.reviewsCount;

  return {
    id: pkg._id,
    title: pkg.step1_eventAndCrew?.packageName ?? "Package",
    thumb: getPackageImage(pkg) ?? FALLBACK_IMAGE,
    categoryLabel,
    categoryIcon: meta?.icon ?? FALLBACK_CATEGORY_ICON,
    categoryGradientFrom: meta?.gradientFrom ?? "#FFEDD6",
    // Only show a rating when there's at least one real review behind it —
    // a bare "0.0" or an unrated vendor's default reads as a real, bad
    // score rather than "no reviews yet".
    rating: rating && reviewCount ? rating : undefined,
    priceValue: `₹${getPackageStartingPrice(pkg).toLocaleString("en-IN")}`,
    billingUnit: pkg.step3_policiesAndCharges?.packagePricing?.billingUnit,
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
          <span className="rounded-full bg-[#790B1A] px-3 py-1.5 font-figtree text-[12px] font-bold tracking-normal text-white uppercase">
            Up to 20% off
          </span>
          <span className="rounded-full bg-white px-2.5 py-1 font-figtree text-[12px] font-medium text-[#3C060D]">
            Ad
          </span>
        </div>

        <div className="relative flex flex-col gap-3.5">
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

      <div className="flex w-full flex-col items-start gap-[18px] overflow-hidden rounded-2xl border border-[#F4F4F5] bg-white p-6">
        <p className="font-figtree text-[20px] font-semibold text-[#1E0306]">Trending Packages this week</p>

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
                <div className="flex min-w-0 flex-1 flex-col items-start gap-1.5">
                  <span
                    className="flex h-6 items-center gap-2 rounded-[52px] py-1 pr-3 pl-1"
                    style={{ background: `linear-gradient(to right, #ffffff, ${pkg.categoryGradientFrom} 80%)` }}
                  >
                    <Image
                      src={pkg.categoryIcon}
                      alt=""
                      width={16}
                      height={16}
                      className="size-4 shrink-0 rounded-full object-contain"
                    />
                    <span className="font-figtree text-[12px] font-bold tracking-[-0.12px] whitespace-nowrap text-[#3C060D] uppercase">
                      {pkg.categoryLabel}
                    </span>
                  </span>

                  <p className="truncate font-figtree text-[16px] leading-[22px] font-semibold tracking-[-0.16px] text-[#1A1A1A]">
                    {pkg.title}
                  </p>

                  <div className="flex items-center gap-1.5 font-figtree text-[12px] text-[#71717B]">
                    {pkg.rating && (
                      <>
                        <span className="flex items-center gap-1">
                          <Star className="size-3.5 fill-[#FFB800] text-[#FFB800]" />
                          {pkg.rating.toFixed(1)}
                        </span>
                        <span className="size-1 shrink-0 rounded-full bg-[#D9D9D9]" />
                      </>
                    )}
                    <span>
                      from <span className="font-semibold text-[#F0596F]">{pkg.priceValue}</span>
                      {pkg.billingUnit && `/${pkg.billingUnit}`}
                    </span>
                  </div>
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
