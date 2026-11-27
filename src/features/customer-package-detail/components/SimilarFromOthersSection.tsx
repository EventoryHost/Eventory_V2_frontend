"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { browsePackages, type RawPackage } from "@/lib/customerDiscoveryApi";
import { CATEGORY_TO_VENDOR_TYPE } from "@/lib/vendorType";
import ProductCard from "@/features/customer-landing/components/ProductCard";
import type { PackageDetail } from "../types";
import { findSimilarPackages } from "../utils/findSimilarPackages";
import SectionHeading from "./SectionHeading";
import { toProductCardProps } from "./RecommendedPackagesSection";

const CARD_COUNT = 8;

/**
 * "Similar packages from other <category>s" (Figma node 3233:35938): up to two
 * rows of the standard package card, ranked by shared event types, budget and
 * city, never from this package's own vendor. Replaces the older "You might
 * also like" strip.
 */
export default function SimilarFromOthersSection({ current }: { current: PackageDetail }) {
  const [state, setState] = useState<{ packages: RawPackage[]; total: number } | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const vendorType = CATEGORY_TO_VENDOR_TYPE[current.categorySlug];
      const [packages, all] = await Promise.all([
        findSimilarPackages(current, { count: CARD_COUNT, otherVendorsOnly: true }),
        vendorType ? browsePackages({ vendorType, limit: 1 }).catch(() => null) : Promise.resolve(null),
      ]);
      if (!cancelled) setState({ packages, total: Math.max(all?.total ?? 0, packages.length) });
    })().catch(() => {
      if (!cancelled) setState({ packages: [], total: 0 });
    });
    return () => {
      cancelled = true;
    };
  }, [current]);

  if (!state || state.packages.length === 0) return null;

  const plural = `${current.categoryLabel.toLowerCase()}s`;

  return (
    <section id="similar-from-others" className="mx-auto mt-12 w-full max-w-[1280px]">
      {/* Phone heading (Figma node 3642:98001): accent bar + one wrapping 18px title; no subtitle or "View all". */}
      <h2 className="mb-3 flex items-center gap-3 font-figtree text-[18px] font-semibold text-[#222] md:hidden">
        <span className="h-6 w-[5px] shrink-0 rounded-sm bg-[#F0596F]" />
        <span className="min-w-0 flex-1">Similar packages from other {plural}</span>
      </h2>

      <div className="mb-6 hidden items-end justify-between gap-4 md:flex">
        <div>
          <SectionHeading>Similar packages from other {plural}</SectionHeading>
          <p className="-mt-4 pl-[17px] font-figtree text-[14px] leading-5 text-[#3F3F47]">
            Same event type and budget band, available on your date
          </p>
        </div>
        <Link
          href={`/packages/browse?category=${current.categorySlug}`}
          className="flex shrink-0 items-center gap-2 font-figtree text-[14px] leading-5 text-[#D92640]"
        >
          View all {state.total}
          <Image src="/images/customer/package-detail/policy-arrow-right.svg" alt="" width={16} height={16} className="h-4 w-4" />
        </Link>
      </div>

      <div className="hidden grid-cols-2 gap-4 md:grid lg:grid-cols-4">
        {state.packages.map((pkg) => (
          <ProductCard key={pkg._id} fullWidth {...toProductCardProps(pkg)} />
        ))}
      </div>

      {/* Phones: the cards swipe sideways, one 300px card with the next peeking in. */}
      <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto [scrollbar-width:none] md:hidden [&::-webkit-scrollbar]:hidden">
        {state.packages.map((pkg) => (
          <div key={pkg._id} className="shrink-0 snap-start">
            <ProductCard compactOnMobile {...toProductCardProps(pkg)} />
          </div>
        ))}
      </div>
    </section>
  );
}
