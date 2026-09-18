"use client";

import { useState, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  subscribe,
  getSnapshot,
  getServerSnapshot,
  type RecentlyViewedPackage,
} from "@/lib/recentlyViewed";
import { CATEGORY_META } from "@/lib/categoryMeta";
import { VENDOR_CATEGORIES } from "@/features/customer-vendors/data/filterConfig";
import AccountViewToggle, { type AccountViewMode } from "./AccountViewToggle";
import ViewedItemCard from "./ViewedItemCard";
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

export default function ViewedItemsContent() {
  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [activeSlug, setActiveSlug] = useState(TAB_SLUGS[0]);
  const [view, setView] = useState<AccountViewMode>("grid");

  const visible = items.filter((item) => slugOf(item) === activeSlug);

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
            <div className="flex flex-wrap gap-6">
              {visible.map((item) => (
                <ViewedItemCard key={item.packageId} item={item} />
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
