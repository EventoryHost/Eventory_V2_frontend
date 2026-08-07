"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";
import type { FilterSectionConfig, SortOption, VendorFilters, VendorsPageData, ViewMode } from "../types";
import { getFilterSectionsForCategory, eventTypeLabel, serviceLabel } from "../data/filterConfig";
import { filterVendors, priceRangeLabel } from "../utils/filterVendors";
import SearchBar from "./SearchBar";
import ViewToggle from "./ViewToggle";
import CategoryTabs from "./CategoryTabs";
import FilterSidebar from "./FilterSidebar";
import MobileFilterDrawer from "./MobileFilterDrawer";
import ActiveFilterChips, { type ActiveChip } from "./ActiveFilterChips";
import SortMenu from "./SortMenu";
import ResultsHeader from "./ResultsHeader";
import VendorGrid from "./VendorGrid";
import VendorList from "./VendorList";
import VendorCardSkeletonGroup from "./VendorCardSkeleton";
import VendorEmptyState from "./VendorEmptyState";
import LoadMoreButton from "./LoadMoreButton";
import type { SelectedFilters } from "./FilterPanelContent";

const DEFAULT_CITY = "Ghaziabad";
const PAGE_SIZE = 9;

const EMPTY_SELECTED: SelectedFilters = { eventType: [], service: [], pricing: [] };

export default function VendorsPageContent({ data }: { data: VendorsPageData }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const [category, setCategory] = useState(searchParams.get("category") ?? "all");
  const [sort, setSort] = useState<SortOption>((searchParams.get("sort") as SortOption) ?? "newest");
  const [view, setView] = useState<ViewMode>((searchParams.get("view") as ViewMode) ?? "grid");

  const [selected, setSelected] = useState<SelectedFilters>(EMPTY_SELECTED);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(
    () => new Set(data.vendors.filter((vendor) => vendor.isBookmarked).map((vendor) => vendor.id))
  );
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [isLoading, setIsLoading] = useState(false);

  // Keep the shareable URL in sync with the state that's meaningful to deep-link
  // (category, search, sort, view). Checkbox filters stay local-only.
  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (category !== "all") params.set("category", category);
    if (sort !== "newest") params.set("sort", sort);
    if (view !== "grid") params.set("view", view);
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, category, sort, view]);

  // Simulate a network round-trip when the category changes, so the loading
  // skeleton has somewhere real to show. Swap for the actual fetch-pending
  // state once `getVendorsPageData` hits a live endpoint. `isLoading` is
  // flipped on by the category-change handlers below; this effect only
  // schedules turning it back off.
  useEffect(() => {
    if (!isLoading) return;
    const timeout = setTimeout(() => setIsLoading(false), 400);
    return () => clearTimeout(timeout);
  }, [isLoading]);

  const filterSections = useMemo(() => getFilterSectionsForCategory(category), [category]);

  const filters: VendorFilters = useMemo(
    () => ({
      search,
      category,
      eventTypes: selected.eventType,
      services: selected.service,
      priceRanges: selected.pricing,
      sort,
    }),
    [search, category, selected, sort]
  );

  const filteredVendors = useMemo(() => filterVendors(data.vendors, filters), [data.vendors, filters]);
  const visibleVendors = filteredVendors.slice(0, visibleCount);
  const hasMore = visibleCount < filteredVendors.length;

  const activeCategoryLabel = data.categories.find((item) => item.id === category)?.label ?? "All";
  const heading =
    category === "all" ? `Vendors In ${DEFAULT_CITY}` : `${activeCategoryLabel} In ${DEFAULT_CITY}`;

  function handleSearchChange(value: string) {
    setSearch(value);
    setVisibleCount(PAGE_SIZE);
  }

  function handleCategorySelect(id: string) {
    setCategory(id);
    setIsLoading(true);
    setVisibleCount(PAGE_SIZE);
  }

  function handleSortChange(nextSort: SortOption) {
    setSort(nextSort);
    setVisibleCount(PAGE_SIZE);
  }

  function toggleOption(sectionId: FilterSectionConfig["id"], optionId: string) {
    setSelected((prev) => {
      const current = prev[sectionId];
      const next = current.includes(optionId)
        ? current.filter((id) => id !== optionId)
        : [...current, optionId];
      return { ...prev, [sectionId]: next };
    });
    setVisibleCount(PAGE_SIZE);
  }

  function clearFilters() {
    setSelected(EMPTY_SELECTED);
    setVisibleCount(PAGE_SIZE);
  }

  function clearAll() {
    clearFilters();
    setSearch("");
  }

  function toggleBookmark(vendorId: string) {
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(vendorId)) next.delete(vendorId);
      else next.add(vendorId);
      return next;
    });
  }

  const chips: ActiveChip[] = [
    ...selected.eventType.map((id) => ({
      key: `eventType-${id}`,
      label: eventTypeLabel(id),
      onRemove: () => toggleOption("eventType", id),
    })),
    ...selected.service.map((id) => ({
      key: `service-${id}`,
      label: serviceLabel(id),
      onRemove: () => toggleOption("service", id),
    })),
    ...selected.pricing.map((id) => ({
      key: `pricing-${id}`,
      label: priceRangeLabel(id),
      onRemove: () => toggleOption("pricing", id),
    })),
  ];

  return (
    <div className="mx-auto flex w-full max-w-[1440px] gap-8 px-4 pt-8 pb-16 sm:px-6 lg:px-8">
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
        resultCount={filteredVendors.length}
      />

      <div className="min-w-0 flex-1">
        <div className="flex flex-col gap-6">
          {/* Search + view controls */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <SearchBar value={search} onChange={handleSearchChange} />
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(true)}
                className="flex h-[48px] items-center gap-2 rounded-xl border border-black/10 bg-white px-4 font-figtree text-[14px] font-semibold text-neutral-primary lg:hidden"
              >
                <SlidersHorizontal className="h-[18px] w-[18px]" />
                Filters
              </button>
              <ViewToggle value={view} onChange={setView} />
            </div>
          </div>

          <CategoryTabs
            categories={data.categories}
            activeId={category}
            onSelect={handleCategorySelect}
          />

          <div className="flex flex-wrap items-center justify-between gap-4">
            <ActiveFilterChips chips={chips} onClearAll={clearAll} />
            <SortMenu value={sort} onChange={handleSortChange} />
          </div>

          <ResultsHeader heading={heading} resultCount={filteredVendors.length} />
        </div>

        <div className="mt-6">
          {isLoading ? (
            <VendorCardSkeletonGroup view={view} />
          ) : filteredVendors.length === 0 ? (
            <VendorEmptyState onClearFilters={clearAll} />
          ) : (
            <>
              {view === "grid" ? (
                <VendorGrid
                  vendors={visibleVendors}
                  bookmarkedIds={bookmarkedIds}
                  onToggleBookmark={toggleBookmark}
                />
              ) : (
                <VendorList
                  vendors={visibleVendors}
                  bookmarkedIds={bookmarkedIds}
                  onToggleBookmark={toggleBookmark}
                />
              )}
              {hasMore && (
                <LoadMoreButton onClick={() => setVisibleCount((count) => count + PAGE_SIZE)} />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
