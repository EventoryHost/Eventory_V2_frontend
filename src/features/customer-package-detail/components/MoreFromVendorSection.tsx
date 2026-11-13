"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { browsePackages, type RawPackage } from "@/lib/customerDiscoveryApi";
import ProductCard from "@/features/customer-landing/components/ProductCard";
import type { PackageDetail } from "../types";
import SectionHeading from "./SectionHeading";
import { toProductCardProps } from "./RecommendedPackagesSection";

const CARD_COUNT = 4;

/**
 * "Explore more packages" (Figma node 3233:35908): a vendor strip, then the
 * same vendor's other live packages as the standard package cards. Hidden when
 * the vendor has no other package.
 */
export default function MoreFromVendorSection({ current }: { current: PackageDetail }) {
  const [state, setState] = useState<{ packages: RawPackage[]; total: number } | null>(null);
  const vendor = current.vendor;

  useEffect(() => {
    let cancelled = false;
    if (!vendor.id) return;
    browsePackages({ vendorId: vendor.id, limit: 24 })
      .then((response) => {
        if (cancelled) return;
        // The current package and its own tiers (Basic/Premium...) are not "more".
        const ownIds = new Set([current.id, ...current.variants.map((variant) => variant.id)]);
        const others = response.packages.filter((pkg) => !ownIds.has(pkg._id));
        setState({ packages: others.slice(0, CARD_COUNT), total: response.total });
      })
      .catch(() => {
        if (!cancelled) setState({ packages: [], total: 0 });
      });
    return () => {
      cancelled = true;
    };
  }, [vendor.id, current.id, current.variants]);

  if (!state || state.packages.length === 0) return null;

  return (
    <section id="more-from-vendor" className="mx-auto mt-12 w-full max-w-[1280px]">
      <SectionHeading>Explore more packages</SectionHeading>

      <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-[#E4E4E7] bg-white p-5">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#F0596F] font-figtree text-[28px] leading-9 font-semibold text-[#FDE2E6]">
          {vendor.initials}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-figtree text-[20px] leading-7 font-semibold text-[#030303]">More from {vendor.name}</p>
            {vendor.verified && (
              <span className="flex min-h-6 items-center gap-2 rounded-full bg-[#EFF6FF] py-0.5 pr-3 pl-2.5 font-figtree text-[14px] leading-5 text-[#1447E6]">
                <Image src="/images/customer/package-detail/vendor-verified-circle.svg" alt="" width={16} height={16} />
                Eventory Verified
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2 font-figtree text-[14px] leading-5">
            {current.reviewCount > 0 && (
              <span className="flex items-center gap-1.5">
                <Image src="/images/customer/package-detail/card-star.svg" alt="" width={16} height={16} />
                <span className="font-semibold text-[#030303]">{current.rating}</span>
                <span className="text-[#71717B] underline">({current.reviewCount} reviews)</span>
              </span>
            )}
            <span className="text-[#3F3F47]">
              {current.reviewCount > 0 && "· "}
              {state.total} package{state.total === 1 ? "" : "s"}
              {vendor.eventsCount > 0 && ` · ${vendor.eventsCount} events`}
            </span>
          </div>
        </div>
        <Link
          href={vendor.href}
          className="shrink-0 rounded-xl border border-[#D4D4D8] px-4 py-2 font-figtree text-[14px] leading-5 font-medium text-[#030303] transition hover:bg-black/5"
        >
          View all {state.total} package{state.total === 1 ? "" : "s"}
        </Link>
      </div>

      {/* Same grid as SimilarFromOthersSection, so the cards are exactly the same size in both. */}
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {state.packages.map((pkg) => (
          <ProductCard key={pkg._id} fullWidth {...toProductCardProps(pkg)} />
        ))}
      </div>
    </section>
  );
}
