"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import ProductCard, { type ProductCardProps } from "@/features/customer-landing/components/ProductCard";
import {
  browsePackages,
  getPopularPackages,
  getPackageImage,
  getPackageStartingPrice,
  getPackageDurationLabel,
  getPackageCapacityLabel,
  type RawPackage,
} from "@/lib/customerDiscoveryApi";
import { CATEGORY_TO_VENDOR_TYPE, VENDOR_TYPE_TO_CATEGORY } from "@/lib/vendorType";
import { VENDOR_CATEGORIES } from "@/features/customer-vendors/data/filterConfig";
import { CATEGORY_META } from "@/lib/categoryMeta";
import { sanitizeCityName } from "@/lib/vendorLocation";

const FALLBACK_IMAGE = "/images/customer/packages-pics.png";
const RECOMMENDED_COUNT = 5;
const SCROLL_AMOUNT = 336;

function toProductCardProps(pkg: RawPackage): ProductCardProps {
  const categoryId = VENDOR_TYPE_TO_CATEGORY[pkg.vendorType];
  const meta = categoryId ? CATEGORY_META[categoryId] : undefined;
  const categoryLabel = VENDOR_CATEGORIES.find((c) => c.id === categoryId)?.label ?? pkg.vendorType;
  const locationList = [sanitizeCityName(pkg.vendorId?.city), ...(pkg.vendorId?.serviceAreas ?? [])].filter(
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

/**
 * Simple recommendation logic: packages from the SAME vendor category as the
 * one being viewed (same service — a Decorator PDP recommends other
 * Decorator packages) are the most relevant "you might also like" set.
 * Backfills with site-wide popular packages (ranked by real booking volume)
 * if that category alone doesn't have enough live packages, since a
 * thin category should never render fewer than RECOMMENDED_COUNT cards
 * just because it's small. The current package is always excluded —
 * neither browsePackages nor getPopularPackages support excluding an id
 * server-side, so that filtering happens here instead.
 */
async function loadRecommendedPackages(currentPackageId: string, categorySlug: string): Promise<RawPackage[]> {
  const vendorType = CATEGORY_TO_VENDOR_TYPE[categorySlug];
  const seen = new Set([currentPackageId]);
  const results: RawPackage[] = [];

  if (vendorType) {
    const sameCategory = await browsePackages({ vendorType, limit: RECOMMENDED_COUNT + 1 }).catch(
      () => null
    );
    for (const pkg of sameCategory?.packages ?? []) {
      if (seen.has(pkg._id)) continue;
      seen.add(pkg._id);
      results.push(pkg);
    }
  }

  if (results.length < RECOMMENDED_COUNT) {
    const popular = await getPopularPackages({ limit: RECOMMENDED_COUNT + 1 }).catch(() => null);
    for (const pkg of popular?.packages ?? []) {
      if (results.length >= RECOMMENDED_COUNT) break;
      if (seen.has(pkg._id)) continue;
      seen.add(pkg._id);
      results.push(pkg);
    }
  }

  return results.slice(0, RECOMMENDED_COUNT);
}

export default function RecommendedPackagesSection({
  currentPackageId,
  categorySlug,
}: {
  currentPackageId: string;
  categorySlug: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [packages, setPackages] = useState<ProductCardProps[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadRecommendedPackages(currentPackageId, categorySlug)
      .then((pkgs) => {
        if (!cancelled) setPackages(pkgs.map(toProductCardProps));
      })
      .catch(() => {
        if (!cancelled) setPackages([]);
      });
    return () => {
      cancelled = true;
    };
  }, [currentPackageId, categorySlug]);

  const scroll = (direction: "left" | "right") => {
    scrollRef.current?.scrollBy({
      left: direction === "left" ? -SCROLL_AMOUNT : SCROLL_AMOUNT,
      behavior: "smooth",
    });
  };

  if (packages !== null && packages.length === 0) return null;

  return (
    <section className="mx-auto mt-16 w-full max-w-[1280px]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-figtree font-bold text-brand-950 text-[24px] sm:text-[28px] leading-[1.2] tracking-[-0.02em]">
            You Might Also Like
          </h2>
          <p className="mt-2 font-figtree font-normal text-[16px] leading-[1.35] tracking-[-0.02em] text-body-secondary">
            More packages worth comparing before you book.
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
        {(packages ?? []).map((pkg, i) => (
          <div key={i} className="shrink-0 snap-start">
            <ProductCard {...pkg} />
          </div>
        ))}
      </div>
    </section>
  );
}
