"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import type { BudgetEstimator } from "../types";
import { formatBudgetRange } from "../utils/formatPrice";
import { browsePackages, getPackagesFilters, getPackageStartingPrice } from "@/lib/customerDiscoveryApi";
import { CATEGORY_TO_VENDOR_TYPE } from "@/lib/vendorType";
import { SERVICE_AREAS } from "@/features/customer-become-vendor/data/serviceAreas";
import BudgetEventTypeField from "./BudgetEventTypeField";
import BudgetVendorTypeField from "./BudgetVendorTypeField";
import BudgetLocationField from "./BudgetLocationField";
import BudgetSuggestionCard from "./BudgetSuggestionCard";

const AVATAR_IMAGES = [
  "/images/customer/packages/budget-avatar-1.png",
  "/images/customer/packages/budget-avatar-2.png",
  "/images/customer/packages/budget-avatar-3.png",
  "/images/customer/packages/budget-avatar-4.png",
];

type Estimate = {
  min: number;
  max: number;
  tags: string[];
  insight: string;
  /** No real package matched the filters — show the insight text instead of a ₹0 - ₹0 range. */
  empty: boolean;
};

export default function BudgetEstimatorSection({ data }: { data: BudgetEstimator }) {
  // Real, live data for the two dropdown fields — fetched once on mount,
  // same source (GET /customer/packages/filters) the landing page's own
  // Event Type search uses. Best-effort: a failed fetch just leaves both
  // dropdowns empty rather than breaking the section.
  const [rawEventCategories, setRawEventCategories] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    getPackagesFilters()
      .then((response) => {
        if (!cancelled) setRawEventCategories(response.filters.eventCategories);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // The real NCR areas Eventory operates in — same list as the About page's
  // "We are live in 200+ Localities" section (SERVICE_AREAS) — rather than
  // GET /customer/packages/filters' cities, which right now only reflects 3
  // messy, free-typed strings off the handful of packages already live
  // (e.g. "sec 45 noida "), not the actual service footprint.
  const cities = useMemo(() => SERVICE_AREAS.map((district) => district.area), []);

  const [eventTypeId, setEventTypeId] = useState("");
  const [eventTypeLabel, setEventTypeLabel] = useState("");
  const [guests, setGuests] = useState("");
  const [location, setLocation] = useState("");
  const [vendorTypeId, setVendorTypeId] = useState("");
  const [vendorTypeLabel, setVendorTypeLabel] = useState("");

  const [estimate, setEstimate] = useState<Estimate>({
    min: data.estimatedMin,
    max: data.estimatedMax,
    tags: data.tags,
    insight: data.marketInsight,
    empty: false,
  });
  const [loading, setLoading] = useState(false);

  const [activeGroupId, setActiveGroupId] = useState(data.vendorGroups[0]?.categoryId);
  const activeGroup = useMemo(
    () => data.vendorGroups.find((group) => group.categoryId === activeGroupId) ?? data.vendorGroups[0],
    [data.vendorGroups, activeGroupId]
  );

  async function handleEstimate() {
    setLoading(true);
    try {
      const tags = [eventTypeLabel, vendorTypeLabel, location.trim()].filter(Boolean);
      const guestsNum = Number(guests);
      const hasGuests = guests.trim() !== "" && Number.isFinite(guestsNum) && guestsNum > 0;

      // GET /customer/packages' `city` filter is an exact, case-sensitive
      // match against whatever free-text a vendor typed at onboarding — real
      // data is messy ("sec 45 noida ") and almost never matches a clean
      // locality name like "Noida", so an exact-match attempt on location
      // routinely comes back empty even though real packages DO exist
      // nearby. Rather than call that "no packages" outright, this tries
      // progressively broader real queries (dropping city, then guests, then
      // event type, then vendor type) until one returns real packages,
      // being honest in the copy about which filter had to be relaxed.
      const tiers: { params: Partial<Parameters<typeof browsePackages>[0]>; describe: () => string }[] = [
        {
          params: {
            ...(eventTypeId && { eventCategory: eventTypeId }),
            ...(vendorTypeId && { vendorType: CATEGORY_TO_VENDOR_TYPE[vendorTypeId] }),
            ...(location.trim() && { city: location.trim() }),
            ...(hasGuests && { guests: guestsNum }),
          },
          describe: () => "matching your filters",
        },
        {
          params: {
            ...(eventTypeId && { eventCategory: eventTypeId }),
            ...(vendorTypeId && { vendorType: CATEGORY_TO_VENDOR_TYPE[vendorTypeId] }),
            ...(hasGuests && { guests: guestsNum }),
          },
          describe: () =>
            location.trim()
              ? `elsewhere — none of our live packages are tagged for ${location.trim()} yet`
              : "matching your filters",
        },
        {
          params: {
            ...(eventTypeId && { eventCategory: eventTypeId }),
            ...(vendorTypeId && { vendorType: CATEGORY_TO_VENDOR_TYPE[vendorTypeId] }),
          },
          describe: () => "for your event and vendor type, regardless of guest count or location",
        },
        {
          params: { ...(vendorTypeId && { vendorType: CATEGORY_TO_VENDOR_TYPE[vendorTypeId] }) },
          describe: () => "for your chosen vendor type, across every event and location",
        },
        {
          params: {},
          describe: () => "across the whole Eventory catalog — no exact matches for your filters yet",
        },
      ];

      for (const tier of tiers) {
        // Skip a tier that's identical to one already tried (e.g. no filters
        // were set at all, so every tier is the same unfiltered query).
        const response = await browsePackages({ ...tier.params, sort: "price_asc", limit: 50 });
        const prices = response.packages.map(getPackageStartingPrice).filter((price) => price > 0);
        if (prices.length > 0) {
          setEstimate({
            min: Math.min(...prices),
            max: Math.max(...prices),
            tags,
            insight: `Based on ${prices.length} real package${prices.length === 1 ? "" : "s"} ${tier.describe()}.`,
            empty: false,
          });
          break;
        }
        if (tier === tiers[tiers.length - 1]) {
          // Only reachable if the entire catalog is empty — a real,
          // honest state, not a fabricated one.
          setEstimate({
            min: 0,
            max: 0,
            tags,
            insight: "No live packages on Eventory yet — check back soon.",
            empty: true,
          });
        }
      }

      if (vendorTypeId) setActiveGroupId(vendorTypeId);
    } catch {
      // Best-effort — keep showing the previous estimate on failure.
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
      <div className="mb-6 sm:mb-8">
        <h2 className="font-figtree text-[20px] font-bold text-brand-950 sm:text-[28px]">{data.heading}</h2>
        <p className="mt-1 font-figtree text-[13px] font-medium text-neutral-tertiary sm:text-[14px]">
          {data.subheading}
        </p>
      </div>

      <div className="rounded-3xl bg-white p-4 shadow-[0px_4px_20px_rgba(0,0,0,0.04)] sm:rounded-[32px] sm:p-5">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          <BudgetEventTypeField
            rawEventCategories={rawEventCategories}
            selectedId={eventTypeId}
            selectedLabel={eventTypeLabel}
            onSelect={(id, label) => {
              setEventTypeId(id);
              setEventTypeLabel(label);
            }}
          />

          <label className="relative block rounded-2xl border border-[#E4E4E7] bg-white px-4 py-3 transition-colors focus-within:border-brand-primary">
            <span className="block font-figtree text-[13px] text-[#71717B] sm:text-[16px]">How many Guests?</span>
            <input
              type="number"
              min={1}
              inputMode="numeric"
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
              placeholder="e.g. 150"
              className="w-full bg-transparent font-figtree text-[14px] font-medium text-[#9F9FA9] outline-none sm:text-[16px]"
            />
          </label>

          <BudgetLocationField cities={cities} value={location} onChange={setLocation} />

          <BudgetVendorTypeField
            selectedId={vendorTypeId}
            selectedLabel={vendorTypeLabel}
            onSelect={(id, label) => {
              setVendorTypeId(id);
              setVendorTypeLabel(label);
            }}
          />
        </div>

        {/* Divider with the "Get your Budget" pill button floating centered on top of it, straddling the line — matches the Figma layering (button vertically centered on the hairline). */}
        <div className="mt-6 border-t border-black/10 sm:mt-8" />
        <div className="-mt-6 mb-6 flex justify-center sm:mb-8">
          <button
            type="button"
            onClick={handleEstimate}
            disabled={loading}
            className="flex items-center gap-2 rounded-full bg-brand-primary px-9 py-4 font-figtree text-[14px] font-semibold text-white shadow-md transition-colors hover:bg-brand-primary/90 disabled:opacity-70"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Get your Budget
          </button>
        </div>

        <div className="rounded-2xl border border-[#FCDEE2] sm:rounded-3xl">
          <div className="relative m-[15px] overflow-hidden rounded-[20px] p-6 sm:p-8">
            <div
              className="absolute inset-0"
              style={{
                background: "linear-gradient(103deg, #FF667D 1.75%, #FCDEE2 98.25%)",
              }}
            />

            <Image
              src="/images/customer/packages/budget-cash-hand.png"
              alt=""
              width={139}
              height={138}
              className="pointer-events-none absolute top-1/2 right-[-17px] hidden -translate-y-1/2 sm:block"
            />
            <Image
              src="/images/customer/packages/budget-cash-bill.png"
              alt=""
              width={81}
              height={81}
              className="pointer-events-none absolute top-[35px] right-[90px] hidden rotate-180 sm:block"
            />
            <Image
              src="/images/customer/packages/budget-cash-bill.png"
              alt=""
              width={43}
              height={43}
              className="pointer-events-none absolute top-[14px] right-[55px] hidden rotate-180 sm:block"
            />

            <div className="relative z-10">
              <p className="font-figtree text-[14px] font-semibold tracking-widest text-white uppercase sm:text-[16px]">
                Estimated Budget
              </p>
              {estimate.empty ? (
                <h3 className="mt-2 font-figtree text-[18px] font-bold text-white sm:text-[22px]">
                  {estimate.insight}
                </h3>
              ) : (
                <>
                  <h3 className="mt-2 font-figtree text-[26px] font-bold text-white sm:text-[36px]">
                    {formatBudgetRange(estimate.min, estimate.max)}
                  </h3>
                  <p className="mt-1 font-figtree text-[13px] text-white/85">{estimate.insight}</p>
                </>
              )}
              {estimate.tags.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-3">
                  {estimate.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-2xl border border-brand-primary bg-[#FAFAFA] px-3 py-1.5 font-figtree text-[14px] font-medium text-[#3C060D]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {data.vendorGroups.length > 0 && (
            <div className="border-t border-[#FCDEE2] px-4 pb-4 sm:px-5 sm:pb-5">
              <div className="mb-4 flex gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {data.vendorGroups.map((group) => {
                  const isActive = group.categoryId === activeGroup?.categoryId;
                  return (
                    <button
                      key={group.categoryId}
                      type="button"
                      onClick={() => setActiveGroupId(group.categoryId)}
                      className={`shrink-0 px-2 pb-2.5 font-figtree text-[14px] whitespace-nowrap transition-colors ${
                        isActive
                          ? "border-b-2 border-brand-primary font-semibold text-[#030303]"
                          : "font-medium text-[#262626] hover:text-brand-950"
                      }`}
                    >
                      {group.categoryLabel}
                    </button>
                  );
                })}
              </div>

              {activeGroup && activeGroup.suggestions.length > 0 ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {activeGroup.suggestions.map((suggestion, i) => (
                    <BudgetSuggestionCard key={suggestion.id} suggestion={suggestion} seed={i} />
                  ))}
                </div>
              ) : (
                <p className="py-6 text-center font-figtree text-[14px] text-neutral-tertiary">
                  No live {activeGroup?.categoryLabel.toLowerCase()} packages yet — check back soon.
                </p>
              )}
            </div>
          )}
        </div>

        <div className="mt-6 flex items-center gap-2 rounded-xl border border-[#CCF] bg-[#F0F0FF] p-4 sm:mt-8">
          <div className="flex shrink-0 items-center">
            {AVATAR_IMAGES.map((avatar, i) => (
              <span
                key={avatar}
                className="relative h-6 w-6 shrink-0 overflow-hidden rounded-full border border-[#D9D9D9] shadow-[0px_0px_4px_0px_rgba(0,0,0,0.1)]"
                style={i === 0 ? undefined : { marginLeft: "-12px" }}
              >
                <Image src={avatar} alt="" fill sizes="24px" className="object-cover" />
              </span>
            ))}
          </div>
          <p className="font-figtree text-[14px] font-semibold text-[#3355FF]">{data.marketInsight}</p>
        </div>
      </div>
    </section>
  );
}
