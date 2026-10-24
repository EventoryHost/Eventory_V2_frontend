"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeftRight, SlidersHorizontal } from "lucide-react";
import { browsePackages, getPackagesFilters, type BrowsePackagesParams } from "@/lib/customerDiscoveryApi";
import { groupEventCategories } from "@/lib/eventCategoryGroups";
import { CATEGORY_TO_VENDOR_TYPE, SORT_UI_TO_API } from "@/lib/vendorType";
import { getWishlist, addWishlistItem, removeWishlistItem } from "@/lib/customerWishlistApi";
import { addCompareItem, clearCompare, MAX_COMPARE_PACKAGES } from "@/lib/customerCompareApi";
import AuthModal from "@/features/customer-auth/components/AuthModal";
import { useCustomerSession } from "@/features/customer-auth/hooks/useCustomerSession";
import SearchBar from "@/features/customer-vendors/components/SearchBar";
import CategoryTabs from "@/features/customer-vendors/components/CategoryTabs";
import FilterSidebar from "@/features/customer-vendors/components/FilterSidebar";
import MobileFilterDrawer from "@/features/customer-vendors/components/MobileFilterDrawer";
import ActiveFilterChips, {
  type ActiveChip,
} from "@/features/customer-vendors/components/ActiveFilterChips";
import ResultsHeader from "@/features/customer-vendors/components/ResultsHeader";
import LoadMoreButton from "@/features/customer-vendors/components/LoadMoreButton";
import SortMenu from "./PackageSortMenu";
import PackageEmptyState from "./PackageEmptyState";
import PackageGrid from "./PackageGrid";
import ComparePackagesTray from "./ComparePackagesTray";
import { getPackageFilterSections, PACKAGES_PAGE_SIZE } from "../data/filterConfig";
import { filterPackages, packageFilterLabel } from "../utils/filterPackages";
import { mapPackageToListItem } from "../mappers";
import {
  EMPTY_PACKAGE_FILTERS,
  type PackageListingData,
  type PackageListItem,
  type PackageSelectedFilters,
  type PackageSortOption,
} from "../types";

const NO_BOOKMARKS: ReadonlySet<string> = new Set<string>();

/**
 * Progressive-relaxation search used by two entry points into this page:
 *   - "Popular Package Categories" chips (packages page) — category + q,
 *     where q is a package SETUP's contents ("Balloons"), not a title.
 *   - "Explore Packages" (events page's Featured Upcoming Events) —
 *     eventCategory + city, a real event type + its most-booked area.
 * Tries the full filter set first; if that finds nothing, drops `city` (the
 * narrowest, most specific signal) and retries; if still nothing, drops `q`
 * too and retries. `category`/`vendorType` is never auto-dropped — the tab
 * the customer is actually looking at stays selected throughout. Returns the
 * first non-empty result, or the final (possibly still empty) attempt along
 * with a one-line explanation of what had to be dropped to get there.
 */
async function fetchPackagesWithFallback(
  params: BrowsePackagesParams
): Promise<{
  response: Awaited<ReturnType<typeof browsePackages>>;
  notice: string | null;
  /** Whichever filter combination actually produced `response` — callers (e.g. "Load more") reuse this instead of the originally-requested params, so pagination stays consistent with a fallback that already happened on page 1. */
  effectiveParams: BrowsePackagesParams;
}> {
  const full = await browsePackages(params);
  if (full.packages.length > 0 || (!params.city && !params.q)) {
    return { response: full, notice: null, effectiveParams: params };
  }

  if (params.city) {
    const { city: _city, ...withoutCity } = params;
    const withoutCityResponse = await browsePackages(withoutCity);
    if (withoutCityResponse.packages.length > 0 || !params.q) {
      return {
        response: withoutCityResponse,
        notice:
          withoutCityResponse.packages.length > 0
            ? `No packages found in "${params.city}" — showing results for every location instead.`
            : null,
        effectiveParams: withoutCity,
      };
    }
    // City dropped and still empty, and there's also a `q` to drop — fall
    // through to the final attempt below with both dropped.
    const { q: _q, ...withoutCityOrQ } = withoutCity;
    const finalResponse = await browsePackages(withoutCityOrQ);
    return {
      response: finalResponse,
      notice:
        finalResponse.packages.length > 0
          ? `No packages found for "${params.q}" in "${params.city}" — showing all packages instead.`
          : null,
      effectiveParams: withoutCityOrQ,
    };
  }

  // No city, but q didn't match anything — drop q only.
  const { q: _q, ...withoutQ } = params;
  const withoutQResponse = await browsePackages(withoutQ);
  return {
    response: withoutQResponse,
    notice:
      withoutQResponse.packages.length > 0
        ? `No packages found matching "${params.q}" — showing all packages instead.`
        : null,
    effectiveParams: withoutQ,
  };
}

export default function PackageListingContent({ data }: { data: PackageListingData }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const [category, setCategory] = useState(searchParams.get("category") ?? "all");
  const [sort, setSort] = useState<PackageSortOption>(
    (searchParams.get("sort") as PackageSortOption) ?? "newest"
  );
  // Availability-aware date filter, forwarded straight to GET /customer/packages
  // (customerDiscoveryApi.ts's BrowsePackagesParams.date already supports
  // this server-side — it just had nothing on this page wiring a value into
  // it). Landing's EventSearchCard is the first thing that actually sets
  // this URL param.
  const [date, setDate] = useState(searchParams.get("date") ?? "");
  // "Explore Packages" from Featured Upcoming Events (events page) links here
  // with a real event type + its most-booked service area. Not a sidebar
  // filter and not kept in the URL-sync effect below — it's a one-time entry
  // param consumed by the cascading fetch below, same spirit as the
  // eventType seed two lines down.
  const [cityFilter] = useState(searchParams.get("city") ?? "");
  // Event type from the landing search reuses the sidebar's OWN existing
  // "eventType" filter section/state (already wired to chips, clearFilters,
  // filterPackages()) rather than a second, parallel mechanism — same ids
  // (raw event-category strings), same PackagesFiltersResponse.eventCategories
  // source EventSearchCard's own dropdown reads from.
  const [selected, setSelected] = useState<PackageSelectedFilters>(() => {
    const eventType = searchParams.get("eventType");
    return eventType ? { ...EMPTY_PACKAGE_FILTERS, eventType: [eventType] } : EMPTY_PACKAGE_FILTERS;
  });
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // "Compare Packages" — same /customer/compare session the wishlist's own
  // compare flow builds (WishlistContent.tsx), entered from this page's
  // header button instead. compareCategory locks the selection to one
  // vendor category client-side (the backend's own 409 is the same rule,
  // surfaced via compareMessage if it's somehow still hit).
  const [compareMode, setCompareMode] = useState(false);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [compareCategory, setCompareCategory] = useState<string | null>(null);
  const [compareBusy, setCompareBusy] = useState(false);
  const [compareMessage, setCompareMessage] = useState<string | null>(null);
  // Captured at the moment each package is ticked, NOT looked up from
  // `packages` when rendering the tray — changing the category tab/sort
  // refetches `packages` and a selected package can drop out of that array
  // entirely while still being part of the comparison, which would silently
  // make its tray slot (and the "Comparing N of 3" count) go wrong.
  const [compareDetails, setCompareDetails] = useState<Record<string, { image?: string; title: string }>>({});

  // Event Type options scoped to the active category tab (2026-10-14 —
  // PM-reported: the Decorator tab used to still offer "Workshop", a
  // category only a Photographer (PAV) package actually has, which then
  // correctly but confusingly resolved to "no packages found" for that
  // tab). Seeded from the server-rendered "All" list; refetched below
  // whenever the category tab changes.
  const [eventCategoryOptions, setEventCategoryOptions] = useState(data.eventCategoryOptions);

  const [packages, setPackages] = useState(data.packages);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(data.totalPages);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  // Set only when the cascading fallback below had to drop a filter to find
  // any results at all — cleared on every fetch that doesn't need it.
  const [fallbackNotice, setFallbackNotice] = useState<string | null>(null);
  // The filter combination that actually produced the current `packages` —
  // may be narrower than what category/sort/search/city/date currently ask
  // for, if the fallback above had to drop something. "Load more" reuses
  // this so page 2+ stays consistent with page 1 instead of re-widening or
  // re-narrowing mid-scroll.
  const effectiveParamsRef = useRef<BrowsePackagesParams>({});

  const { isLoggedIn } = useCustomerSession();
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const wishlistItemIdsRef = useRef(new Map<string, string>());
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const pendingBookmarkRef = useRef<string | null>(null);

  // Debounced so the server-side `q` search doesn't fire per keystroke.
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Keep the shareable URL in step with the state worth deep-linking.
  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (category !== "all") params.set("category", category);
    if (sort !== "newest") params.set("sort", sort);
    if (date) params.set("date", date);
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, category, sort, date]);

  // The sidebar's "Event Type" section, joined for the server call below.
  // REAL BUG FIXED 2026-10-14: this filter used to only ever narrow the
  // single already-loaded page client-side (see filterPackages.ts's old
  // eventType check) — a real, Live package tagged with the picked category
  // could easily not be on that page (e.g. a low-ranked "Baby Shower
  // Decoration" package when sorted "newest"), showing "no packages found"
  // for a category that was never actually empty. Every option this sidebar
  // offers only exists because at least one Live package has it (see
  // getPackageListingData.ts / the backend's liveEventCategoriesCache.js),
  // so picking one must reliably find that package regardless of
  // pagination/sort — hence refetching from the server, same as
  // category/sort/search/date below, instead of a client-only refinement.
  const eventTypeParam = (selected.eventType ?? []).join(",");

  // Refetch page 1 when category, sort, event type, or the debounced search
  // changes. Skipped on the very first run when they all match what the
  // server already rendered, so the page doesn't flash a reload of its own
  // data.
  const isFirstRun = useRef(true);
  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      if (category === "all" && sort === "newest" && !debouncedSearch && !date && !eventTypeParam && !cityFilter) return;
    }
    let cancelled = false;
    setIsLoading(true);
    fetchPackagesWithFallback({
      q: debouncedSearch || undefined,
      eventCategory: eventTypeParam || undefined,
      vendorType: category === "all" ? undefined : CATEGORY_TO_VENDOR_TYPE[category],
      city: cityFilter || undefined,
      sort: SORT_UI_TO_API[sort],
      date: date || undefined,
      page: 1,
      limit: PACKAGES_PAGE_SIZE,
    })
      .then(({ response, notice, effectiveParams }) => {
        if (cancelled) return;
        setPackages(response.packages.map(mapPackageToListItem));
        setPage(1);
        setTotalPages(response.totalPages);
        setFallbackNotice(notice);
        effectiveParamsRef.current = effectiveParams;
      })
      .catch(() => {
        if (!cancelled) setPackages([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, sort, debouncedSearch, date, eventTypeParam]);

  // Re-fetch the Event Type options scoped to whichever category tab is now
  // active (unscoped for "All"). Any currently-selected event type that
  // isn't in the new list is dropped too — an invisible chip still silently
  // filtering for an option the sidebar no longer even offers would be
  // confusing, not useful.
  const isFirstCategoryRun = useRef(true);
  useEffect(() => {
    if (isFirstCategoryRun.current) {
      isFirstCategoryRun.current = false;
      if (category === "all") return;
    }
    let cancelled = false;
    getPackagesFilters({ vendorType: category === "all" ? undefined : CATEGORY_TO_VENDOR_TYPE[category] })
      .then((response) => {
        if (cancelled) return;
        const options = groupEventCategories(response.filters.eventCategories);
        setEventCategoryOptions(options);
        setSelected((prev) => {
          const validIds = new Set(options.map((o) => o.id));
          const nextEventType = (prev.eventType ?? []).filter((id) => validIds.has(id));
          if (nextEventType.length === (prev.eventType ?? []).length) return prev;
          return { ...prev, eventType: nextEventType };
        });
      })
      .catch(() => {
        // Best-effort — keep whatever options were already showing.
      });
    return () => {
      cancelled = true;
    };
  }, [category]);

  // Wishlist is customer-only; packages are saved as itemType "Package".
  useEffect(() => {
    if (!isLoggedIn) {
      wishlistItemIdsRef.current.clear();
      return;
    }
    let cancelled = false;
    getWishlist()
      .then((response) => {
        if (cancelled) return;
        const ids = new Set<string>();
        wishlistItemIdsRef.current.clear();
        response.items.forEach((item) => {
          if (item.itemType === "Package" && item.packageId) {
            ids.add(item.packageId._id);
            wishlistItemIdsRef.current.set(item.packageId._id, item._id);
          }
        });
        setBookmarkedIds(ids);
      })
      .catch(() => {
        // Best-effort — bookmarks just stay unfilled if this fails.
      });
    return () => {
      cancelled = true;
    };
  }, [isLoggedIn]);

  // Derived, not synced: logged out means "nothing saved".
  const savedIds = isLoggedIn ? bookmarkedIds : NO_BOOKMARKS;

  async function toggleBookmark(packageId: string) {
    if (!isLoggedIn) {
      pendingBookmarkRef.current = packageId;
      setIsAuthOpen(true);
      return;
    }
    const isSaved = savedIds.has(packageId);
    try {
      if (isSaved) {
        const itemId = wishlistItemIdsRef.current.get(packageId);
        if (itemId) {
          await removeWishlistItem(itemId);
          wishlistItemIdsRef.current.delete(packageId);
        }
        setBookmarkedIds((prev) => {
          const next = new Set(prev);
          next.delete(packageId);
          return next;
        });
      } else {
        const result = await addWishlistItem({ itemType: "Package", packageId });
        wishlistItemIdsRef.current.set(packageId, result.item._id);
        setBookmarkedIds((prev) => new Set(prev).add(packageId));
      }
    } catch {
      // Best-effort — leave the bookmark state unchanged on failure.
    }
  }

  function activeCategoryLabelFor(categorySlug: string): string {
    return data.categories.find((item) => item.id === categorySlug)?.label ?? categorySlug;
  }

  function toggleCompareMode() {
    setCompareMode((isOn) => !isOn);
    setCompareMessage(null);
  }

  /**
   * Same "one category at a time" rule the compare session API enforces
   * server-side (409) — checked here first so the card's checkbox can
   * disable itself instead of letting the customer pick, then fail, on
   * "Compare now". The first selection decides the locked category; it
   * clears once the tray empties.
   */
  function toggleCompare(pkg: PackageListItem) {
    setCompareMessage(null);
    setCompareIds((selected) => {
      if (selected.includes(pkg.id)) {
        const next = selected.filter((id) => id !== pkg.id);
        if (next.length === 0) setCompareCategory(null);
        return next;
      }
      if (selected.length >= MAX_COMPARE_PACKAGES) return selected;
      if (compareCategory && pkg.category !== compareCategory) {
        setCompareMessage(`You can only compare ${activeCategoryLabelFor(compareCategory)} packages together — clear the tray to start a new comparison.`);
        return selected;
      }
      if (selected.length === 0) setCompareCategory(pkg.category);
      setCompareDetails((details) => ({ ...details, [pkg.id]: { image: pkg.image, title: pkg.name } }));
      return [...selected, pkg.id];
    });
  }

  function removeFromCompare(packageId: string) {
    setCompareMessage(null);
    setCompareIds((selected) => {
      const next = selected.filter((id) => id !== packageId);
      if (next.length === 0) setCompareCategory(null);
      return next;
    });
  }

  function clearCompareSelection() {
    setCompareIds([]);
    setCompareCategory(null);
    setCompareMessage(null);
    setCompareDetails({});
  }

  /** Builds the same server-side comparison session the wishlist's "Compare Packages" flow does (clearCompare, then add each id), then opens /compare. */
  async function handleCompareNow() {
    setCompareBusy(true);
    setCompareMessage(null);
    try {
      await clearCompare();
      for (const packageId of compareIds) {
        await addCompareItem(packageId);
      }
      router.push("/compare");
    } catch (err: unknown) {
      setCompareBusy(false);
      setCompareMessage(err instanceof Error ? err.message : "Could not build that comparison");
    }
  }

  // Sections depend on the active category: the design's Makeup Service /
  // Style / Hair sections belong to Makeup Artist only.
  const filterSections = useMemo(
    () => getPackageFilterSections({ eventCategoryOptions, categoryId: category }),
    [eventCategoryOptions, category]
  );

  const visiblePackages = useMemo(() => filterPackages(packages, selected), [packages, selected]);
  const hasMore = page < totalPages;

  const compareIdSet = useMemo(() => new Set(compareIds), [compareIds]);
  const compareItems = useMemo(
    () =>
      compareIds.map((id) => ({
        id,
        image: compareDetails[id]?.image,
        title: compareDetails[id]?.title ?? "Package",
      })),
    [compareIds, compareDetails]
  );

  function toggleOption(sectionId: string, optionId: string) {
    setSelected((prev) => {
      const current = prev[sectionId] ?? [];
      const next = current.includes(optionId)
        ? current.filter((id) => id !== optionId)
        : [...current, optionId];
      return { ...prev, [sectionId]: next };
    });
  }

  function clearFilters() {
    setSelected(EMPTY_PACKAGE_FILTERS);
  }

  function clearAll() {
    clearFilters();
    setSearch("");
  }

  async function handleLoadMore() {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    try {
      const nextPage = page + 1;
      // Reuses whatever filter combination page 1 actually resolved to
      // (effectiveParamsRef), not the raw current state — if the fallback
      // above had to drop `city` or `q` to find results, page 2+ must keep
      // matching page 1's results, not re-apply a filter that found nothing.
      const response = await browsePackages({
        ...effectiveParamsRef.current,
        page: nextPage,
        limit: PACKAGES_PAGE_SIZE,
      });
      setPackages((prev) => [...prev, ...response.packages.map(mapPackageToListItem)]);
      setPage(nextPage);
      setTotalPages(response.totalPages);
    } catch {
      // Leave the loaded results in place; the button stays available.
    } finally {
      setIsLoadingMore(false);
    }
  }

  const chips: ActiveChip[] = filterSections.flatMap((section) =>
    (selected[section.id] ?? []).map((id) => ({
      key: `${section.id}-${id}`,
      // Looked up from the section's own options first — eventType's ids
      // can now be a comma-joined group of raw values (see
      // lib/eventCategoryGroups.ts), so the human-readable label lives on
      // the option, not the id itself. packageFilterLabel is still the
      // right source for the few sections whose label table it owns,
      // falling back to the raw id only if neither finds a match.
      label: section.options.find((option) => option.id === id)?.label ?? packageFilterLabel(section.id, id),
      onRemove: () => toggleOption(section.id, id),
    }))
  );

  const activeCategoryLabel = data.categories.find((item) => item.id === category)?.label ?? "All";
  const heading = category === "all" ? "All Packages" : activeCategoryLabel;

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <div className="mx-auto flex w-full max-w-[1440px] gap-8 px-4 pt-8 pb-16 sm:px-6 lg:px-16">
        <FilterSidebar
          sections={filterSections}
          selected={selected}
          onToggleOption={toggleOption}
          onClear={clearFilters}
        />

        <MobileFilterDrawer
          isOpen={isMobileFilterOpen}
          onClose={() => setIsMobileFilterOpen(false)}
          sections={filterSections}
          selected={selected}
          onToggleOption={toggleOption}
          onClear={clearFilters}
          resultCount={visiblePackages.length}
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <SearchBar value={search} onChange={setSearch} />
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(true)}
                className="flex h-[48px] shrink-0 items-center gap-2 rounded-[14px] border border-[#f1f1f1] bg-white px-4 font-figtree text-[14px] font-semibold text-neutral-primary lg:hidden"
              >
                <SlidersHorizontal className="size-[18px]" />
                Filters
              </button>
            </div>

            <CategoryTabs categories={data.categories} activeId={category} onSelect={setCategory} />

            {fallbackNotice && (
              <div className="rounded-[14px] border border-[#FFE1A8] bg-[#FFF8EB] px-4 py-3 font-figtree text-[13px] font-medium text-[#8A5A00]">
                {fallbackNotice}
              </div>
            )}

            {chips.length > 0 && <ActiveFilterChips chips={chips} onClearAll={clearAll} />}

            <div className="flex flex-wrap items-center justify-between gap-4">
              <ResultsHeader heading={heading} resultCount={visiblePackages.length} />
              <div className="flex items-center gap-4">
                <SortMenu value={sort} onChange={setSort} />
                <button
                  type="button"
                  onClick={toggleCompareMode}
                  aria-pressed={compareMode}
                  className={`flex shrink-0 items-center gap-1.5 rounded-[10px] py-1.5 pl-2 pr-3 text-[14px] font-semibold transition-colors ${
                    compareMode
                      ? "bg-[#1E0306] text-white"
                      : "bg-brand-primary text-white hover:opacity-90"
                  }`}
                >
                  <ArrowLeftRight className="size-5" />
                  {compareMode ? "Exit Compare" : "Compare Packages"}
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6">
            {isLoading ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-[500px] animate-pulse rounded-2xl border border-black/5 bg-neutral-subtle/40"
                  />
                ))}
              </div>
            ) : visiblePackages.length === 0 ? (
              <PackageEmptyState onClearFilters={clearAll} />
            ) : (
              <>
                <PackageGrid
                  packages={visiblePackages}
                  bookmarkedIds={savedIds}
                  onToggleBookmark={toggleBookmark}
                  compareMode={compareMode}
                  compareIds={compareIdSet}
                  onToggleCompare={toggleCompare}
                />
                {hasMore && <LoadMoreButton onClick={handleLoadMore} isLoading={isLoadingMore} />}
              </>
            )}
          </div>

          {compareMode && (
            <ComparePackagesTray
              items={compareItems}
              onRemove={removeFromCompare}
              onClear={clearCompareSelection}
              onCompare={handleCompareNow}
              busy={compareBusy}
              message={compareMessage}
            />
          )}

          {/* "Recommendation" — a separate rating-sorted read, so it isn't
              the first page of results shown twice. */}
          {data.recommended.length > 0 && (
            <div className="mt-12 border-t border-[#e4e4e7] pt-8">
              <div className="mb-5 flex flex-col gap-0.5">
                <h2 className="font-figtree text-[20px] leading-[28px] font-semibold text-[#030303]">
                  Recommendation
                </h2>
                <p className="font-figtree text-[14px] leading-[20px] font-medium text-[#666666]">
                  Top-rated packages across Eventory
                </p>
              </div>
              <PackageGrid
                packages={data.recommended}
                bookmarkedIds={savedIds}
                onToggleBookmark={toggleBookmark}
              />
            </div>
          )}
        </div>
      </div>

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthenticated={() => {
          setIsAuthOpen(false);
          const id = pendingBookmarkRef.current;
          pendingBookmarkRef.current = null;
          if (id) void toggleBookmark(id);
        }}
      />
    </div>
  );
}
