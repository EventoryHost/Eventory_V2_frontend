"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import ProductCard, { type ProductCardProps } from "./ProductCard";
import {
  getPopularPackages,
  getPackageImage,
  getPackageStartingPrice,
  getPackageDurationLabel,
  getPackageCapacityLabel,
  type RawPackage,
} from "@/lib/customerDiscoveryApi";
import { VENDOR_TYPE_TO_CATEGORY } from "@/lib/vendorType";
import { VENDOR_CATEGORIES } from "@/features/customer-vendors/data/filterConfig";
import { CATEGORY_META } from "@/lib/categoryMeta";

const FALLBACK_IMAGE = "/images/customer/packages-pics.png";

function toProductCardProps(pkg: RawPackage): ProductCardProps {
  const categoryId = VENDOR_TYPE_TO_CATEGORY[pkg.vendorType];
  const meta = categoryId ? CATEGORY_META[categoryId] : undefined;
  const categoryLabel = VENDOR_CATEGORIES.find((c) => c.id === categoryId)?.label ?? pkg.vendorType;

  // Same source composition as the PDP header's locationSummary (city, then
  // service areas) — kept consistent between the two so a package's
  // "location" reads the same wherever it's shown.
  const locationList = [pkg.vendorId?.city, ...(pkg.vendorId?.serviceAreas ?? [])].filter(
    (location): location is string => Boolean(location)
  );

  return {
    image: getPackageImage(pkg) ?? FALLBACK_IMAGE,
    categoryLabel,
    categoryIcon: meta?.icon ?? FALLBACK_IMAGE,
    tags: pkg.step1_eventAndCrew?.eventCategories ?? [],
    title: pkg.step1_eventAndCrew?.packageName ?? "Package",
    rating: pkg.vendorId?.rating ?? 0,
    reviewCount: pkg.vendorId?.reviewsCount ?? 0,
    duration: getPackageDurationLabel(pkg),
    guestCapacity: getPackageCapacityLabel(pkg),
    price: `₹${getPackageStartingPrice(pkg).toLocaleString("en-IN")}`,
    locations: locationList.length > 0 ? locationList : ["—"],
    categoryGradientFrom: meta?.gradientFrom,
    href: `/packages/${pkg._id}`,
  };
}

// Static placeholder — shown until GET /customer/packages/popular resolves,
// or if it fails.
const FALLBACK_PACKAGES: ProductCardProps[] = Array.from({ length: 6 }, () => ({
  image: "/images/customer/packages-pics.png",
  categoryLabel: "Makeup Artist",
  categoryIcon: "/images/customer/makeup.png",
  tags: ["Wedding", "Anniversary", "Social Gathering", "Sangeet", "Reception"],
  title: "Neon Pulse Club & Wedding - Gold Package",
  rating: 4.5,
  reviewCount: 13,
  duration: "Full day (8 hrs)",
  guestCapacity: "Upto 300 guests",
  price: "₹15,999",
  locations: ["Delhi NCR", "New Delhi", "Gururgram"],
}));

const SCROLL_AMOUNT = 336;

export default function PackagesCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [packages, setPackages] = useState<ProductCardProps[]>(FALLBACK_PACKAGES);

  useEffect(() => {
    let cancelled = false;
    getPopularPackages({ limit: 6 })
      .then((response) => {
        if (cancelled || response.packages.length === 0) return;
        setPackages(response.packages.map(toProductCardProps));
      })
      .catch(() => {
        // Keep the static fallback on failure.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const scroll = (direction: "left" | "right") => {
    scrollRef.current?.scrollBy({
      left: direction === "left" ? -SCROLL_AMOUNT : SCROLL_AMOUNT,
      behavior: "smooth",
    });
  };

  return (
    <section className="mx-auto mt-16 w-full max-w-[1320px]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-figtree font-bold text-brand-950 text-[28px] sm:text-[32px] leading-[1.2] tracking-[-0.02em]">
            Packages Often Booked by our Customers
          </h2>
          <p className="mt-2 font-figtree font-normal text-[16px] leading-[1.35] tracking-[-0.02em] text-body-secondary">
            Book venues, decorators, caterers, entertainers, and photographers
            packages together.
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-3 shrink-0">
          <button
            type="button"
            aria-label="Scroll left"
            onClick={() => scroll("left")}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 text-brand-950"
          >
            <ArrowLeft size={18} />
          </button>
          <button
            type="button"
            aria-label="Scroll right"
            onClick={() => scroll("right")}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 text-brand-950"
          >
            <ArrowRight size={18} />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="mt-8 flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {packages.map((pkg, i) => (
          <div key={i} className="shrink-0 snap-start">
            <ProductCard {...pkg} />
          </div>
        ))}
      </div>
    </section>
  );
}
