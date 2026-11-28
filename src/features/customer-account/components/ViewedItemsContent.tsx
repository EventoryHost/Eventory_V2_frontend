"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  subscribe,
  getSnapshot,
  getServerSnapshot,
  type RecentlyViewedPackage,
} from "@/lib/recentlyViewed";
import { getPackageDetail } from "@/lib/customerPackageDetailApi";
import { getPackageCardStats, type RawPackage } from "@/lib/customerDiscoveryApi";
import { CATEGORY_META } from "@/lib/categoryMeta";
import { VENDOR_CATEGORIES } from "@/features/customer-vendors/data/filterConfig";
import AccountViewToggle, { type AccountViewMode } from "./AccountViewToggle";
import ProductCard from "@/features/customer-landing/components/ProductCard";
import RecentlyViewedCard from "./RecentlyViewedCard";

/** The design's tab order (node 1414:8182 onward) — "all" is dropped. */
const TAB_SLUGS = ["makeup-artist", "caterer", "venue-provider", "dj-artist", "decorator", "photographer"];

const TABS = TAB_SLUGS.map((slug) => ({
  slug,
  label: VENDOR_CATEGORIES.find((category) => category.id === slug)?.label ?? slug,
  icon: CATEGORY_META[slug]?.icon,
}));

/**
 * Entries saved before `categorySlug` existed only carry the display label,
 * so fall back to matching that rather than dropping them from every tab.
 */
function slugOf(item: RecentlyViewedPackage) {
  if (item.categorySlug) return item.categorySlug;
  return VENDOR_CATEGORIES.find((category) => category.label === item.categoryLabel)?.id ?? "";
}

type CardStats = ReturnType<typeof getPackageCardStats>;

/**
 * The viewed-items store only keeps what the PDP knew when it was opened, so
 * the setups / items / variants / "Customize it" facts the listing cards show
 * are read fresh from each package. Failures just leave that card without them.
 */
function useCardStats(packageIds: string[]) {
  const [stats, setStats] = useState<Record<string, CardStats>>({});
  const key = packageIds.join(",");

  useEffect(() => {
    let cancelled = false;
    for (const id of key ? key.split(",") : []) {
      getPackageDetail(id)
        .then(({ package: pkg }) => {
          if (cancelled) return;
          setStats((prev) => ({ ...prev, [id]: getPackageCardStats(pkg as unknown as RawPackage) }));
        })
        .catch(() => {});
    }
    return () => {
      cancelled = true;
    };
  }, [key]);

  return stats;
}

export default function ViewedItemsContent() {
  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [activeSlug, setActiveSlug] = useState(TAB_SLUGS[0]);
  const [view, setView] = useState<AccountViewMode>("grid");

  const visible = items.filter((item) => slugOf(item) === activeSlug);
  const cardStats = useCardStats(visible.map((item) => item.packageId));

  return (
    <>
      {/* Header + view toggle */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-[24px] font-semibold leading-8 text-[#030303]">Viewed Items</h1>
          <p className="text-[14px] leading-5 text-[#71717B]">
            All your Viewed Packages, Vendors and Essentials in one place.
          </p>
        </div>

        <AccountViewToggle value={view} onChange={setView} />
      </div>

      {/* Category tabs + cards, in one card per the design */}
      <div className="overflow-hidden rounded-[20px] border border-[#E4E4E7] bg-white">
        <div className="flex flex-col gap-1 pt-3">
          <div className="flex items-center justify-between overflow-x-auto">
            {TABS.map(({ slug, label, icon }) => {
              const isActive = slug === activeSlug;
              const count = items.filter((item) => slugOf(item) === slug).length;

              return (
                <button
                  key={slug}
                  type="button"
                  onClick={() => setActiveSlug(slug)}
                  aria-current={isActive ? "page" : undefined}
                  className={`flex shrink-0 items-center justify-center gap-2.5 px-5 py-2.5 text-[16px] leading-6 ${
                    isActive
                      ? "border-b-4 border-brand-primary font-semibold text-[#030303]"
                      : "font-medium text-[#3F3F47]"
                  }`}
                >
                  {icon && (
                    <Image src={icon} alt="" width={16} height={16} className="h-4 w-4 object-contain" />
                  )}
                  {label}
                  {/* The design badges the active tab only. */}
                  {isActive && count > 0 && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-[39px] bg-brand-primary px-1.5 text-[11px] font-semibold leading-4 text-[#FAFAFA]">
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <span aria-hidden className="h-px w-full bg-[#E4E4E7]" />
        </div>

        <div className="p-[19px]">
          {visible.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <p className="text-[14px] text-[#71717B]">
                You haven&apos;t viewed any {TABS.find((t) => t.slug === activeSlug)?.label} packages yet.
              </p>
              <Link
                href="/packages"
                className="rounded-full border border-[#E4E4E7] px-4 py-1.5 text-[14px] font-medium text-[#27272A] transition-colors hover:bg-[#FAFAFA]"
              >
                Browse packages
              </Link>
            </div>
          ) : view === "grid" ? (
            // The same shared card the package listing page uses, so a package looks identical everywhere.
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {visible.map((item) => (
                <ProductCard
                  key={item.packageId}
                  fullWidth
                  href={`/packages/${item.packageId}`}
                  image={item.image ?? "/images/customer/packages-pics.png"}
                  categoryLabel={item.categoryLabel}
                  categoryIcon={item.categoryIcon ?? "/images/customer/packages-pics.png"}
                  categoryGradientFrom={item.categoryGradientFrom}
                  tags={item.eventTags}
                  title={item.variantLabel ? `${item.title} - ${item.variantLabel}` : item.title}
                  rating={item.rating}
                  reviewCount={item.reviewCount}
                  duration=""
                  guestCapacity=""
                  price={item.price}
                  priceSuffix={item.priceSuffix}
                  locations={[]}
                  {...cardStats[item.packageId]}
                />
              ))}
            </div>
          ) : (
            // List mode isn't in this node; it reuses the horizontal card the
            // dashboard's "Recently Viewed" section already uses.
            <div className="flex flex-col gap-4">
              {visible.map((item) => (
                <RecentlyViewedCard key={item.packageId} item={item} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
