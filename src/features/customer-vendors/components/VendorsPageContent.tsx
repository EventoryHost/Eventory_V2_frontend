"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";
import type { FilterSectionConfig, SortOption, VendorFilters, VendorsPageData, ViewMode } from "../types";
import { getFilterSectionsForCategory, VENDORS_PAGE_SIZE } from "../data/filterConfig";
import { filterVendors, priceRangeLabel } from "../utils/filterVendors";
import { mapPackageToVendor } from "../mappers";
import { browsePackages } from "@/lib/customerDiscoveryApi";
import { getWishlist, addWishlistItem, removeWishlistItem } from "@/lib/customerWishlistApi";
import { CATEGORY_TO_VENDOR_TYPE, SORT_UI_TO_API } from "@/lib/vendorType";
import AuthModal from "@/features/customer-auth/components/AuthModal";
import { useCustomerSession } from "@/features/customer-auth/hooks/useCustomerSession";
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
import VendorGridCard from "./VendorGridCard";
import VendorCardSkeletonGroup from "./VendorCardSkeleton";
import VendorEmptyState from "./VendorEmptyState";
import LoadMoreButton from "./LoadMoreButton";
import type { SelectedFilters } from "./FilterPanelContent";

const DEFAULT_CITY = "Ghaziabad";

const EMPTY_SELECTED: SelectedFilters = { eventType: [], pricing: [] };

export default function VendorsPageContent({ data }: { data: VendorsPageData }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const [category, setCategory] = useState(searchParams.get("category") ?? "all");
  const [sort, setSort] = useState<SortOption>((searchParams.get("sort") as SortOption) ?? "newest");
  const [view, setView] = useState<ViewMode>((searchParams.get("view") as ViewMode) ?? "grid");

  // Deep-link-only params from the landing page search card — `eventCategory`
  // and `date` aren't exposed as in-page controls here (event type is a
  // multi-select checkbox that stays client-side, see filterVendors.ts), so
  // they're captured once from the URL and threaded straight into every
  // browsePackages call below rather than kept as reactive state.
  const initialEventCategory = useRef(searchParams.get("eventType") ?? undefined);
  const initialDate = useRef(searchParams.get("date") ?? undefined);

  const [selected, setSelected] = useState<SelectedFilters>(() =>
    initialEventCategory.current ? { eventType: [initialEventCategory.current], pricing: [] } : EMPTY_SELECTED
  );
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const { isLoggedIn } = useCustomerSession();
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const wishlistItemIdsRef = useRef(new Map<string, string>());
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const pendingBookmarkRef = useRef<string | null>(null);

  // Wishlist is customer-only — load (and reset) it as login state changes,
  // building a packageId -> wishlistItemId map (bookmark cards are really
  // packages here, per the Vendor type's own comment) since removing a
  // saved item needs its wishlist item id, not the packageId.
  useEffect(() => {
    if (!isLoggedIn) {
      setBookmarkedIds(new Set());
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
            ids.add(item.packageId);
            wishlistItemIdsRef.current.set(item.packageId, item._id);
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

  const [vendors, setVendors] = useState(data.vendors);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(data.totalPages);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Debounced so the server-side `q` search doesn't fire a request per
  // keystroke — only once typing pauses.
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

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

  // Refetch page 1 from the real API whenever category, sort, or the
  // debounced search term changes. Skips the very first run when
  // category/sort/search all match what the server already fetched into
  // `data` ("all"/"newest"/"") — refetching immediately would just flash a
  // skeleton over data we already have. A deep link like
  // /vendors?category=caterer or ?q=... differs from that default, so it
  // still fetches on mount to actually apply the requested filter.
  const isFirstRun = useRef(true);
  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      if (
        category === "all" &&
        sort === "newest" &&
        !debouncedSearch &&
        !initialEventCategory.current &&
        !initialDate.current
      )
        return;
    }
    let cancelled = false;
    setIsLoading(true);
    browsePackages({
      q: debouncedSearch || undefined,
      vendorType: category === "all" ? undefined : CATEGORY_TO_VENDOR_TYPE[category],
      eventCategory: initialEventCategory.current,
      date: initialDate.current,
      sort: SORT_UI_TO_API[sort],
      page: 1,
      limit: VENDORS_PAGE_SIZE,
    })
      .then((response) => {
        if (cancelled) return;
        setVendors(response.packages.map(mapPackageToVendor));
        setPage(1);
        setTotalPages(response.totalPages);
      })
      .catch(() => {
        if (!cancelled) setVendors([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [category, sort, debouncedSearch]);

  async function handleLoadMore() {
    if (isLoadingMore || page >= totalPages) return;
    setIsLoadingMore(true);
    try {
      const nextPage = page + 1;
      const response = await browsePackages({
        q: debouncedSearch || undefined,
        vendorType: category === "all" ? undefined : CATEGORY_TO_VENDOR_TYPE[category],
        eventCategory: initialEventCategory.current,
        date: initialDate.current,
        sort: SORT_UI_TO_API[sort],
        page: nextPage,
        limit: VENDORS_PAGE_SIZE,
      });
      setVendors((prev) => [...prev, ...response.packages.map(mapPackageToVendor)]);
      setPage(nextPage);
      setTotalPages(response.totalPages);
    } catch {
      // Leave the current results as-is on failure — the button stays available to retry.
    } finally {
      setIsLoadingMore(false);
    }
  }

  const filterSections = useMemo(() => getFilterSectionsForCategory(data.eventCategoryOptions), [data.eventCategoryOptions]);

  const filters: VendorFilters = useMemo(
    () => ({
      search,
      category,
      eventTypes: selected.eventType,
      priceRanges: selected.pricing,
      sort,
    }),
    [search, category, selected, sort]
  );

  const filteredVendors = useMemo(() => filterVendors(vendors, filters), [vendors, filters]);
  const hasMore = page < totalPages;

  const activeCategoryLabel = data.categories.find((item) => item.id === category)?.label ?? "All";
  const heading =
    category === "all" ? `Vendors In ${DEFAULT_CITY}` : `${activeCategoryLabel} In ${DEFAULT_CITY}`;

  function handleSearchChange(value: string) {
    setSearch(value);
  }

  function handleCategorySelect(id: string) {
    setCategory(id);
  }

  function handleSortChange(nextSort: SortOption) {
    setSort(nextSort);
  }

  function toggleOption(sectionId: FilterSectionConfig["id"], optionId: string) {
    setSelected((prev) => {
      const current = prev[sectionId];
      const next = current.includes(optionId)
        ? current.filter((id) => id !== optionId)
        : [...current, optionId];
      return { ...prev, [sectionId]: next };
    });
  }

  function clearFilters() {
    setSelected(EMPTY_SELECTED);
  }

  function clearAll() {
    clearFilters();
    setSearch("");
  }

  async function toggleBookmark(vendorId: string) {
    if (!isLoggedIn) {
      pendingBookmarkRef.current = vendorId;
      setIsAuthOpen(true);
      return;
    }
    const isSaved = bookmarkedIds.has(vendorId);
    try {
      if (isSaved) {
        const itemId = wishlistItemIdsRef.current.get(vendorId);
        if (itemId) {
          await removeWishlistItem(itemId);
          wishlistItemIdsRef.current.delete(vendorId);
        }
        setBookmarkedIds((prev) => {
          const next = new Set(prev);
          next.delete(vendorId);
          return next;
        });
      } else {
        const result = await addWishlistItem({ itemType: "Package", packageId: vendorId });
        wishlistItemIdsRef.current.set(vendorId, result.item._id);
        setBookmarkedIds((prev) => new Set(prev).add(vendorId));
      }
    } catch {
      // Best-effort — leave the bookmark state unchanged on failure.
    }
  }

  const chips: ActiveChip[] = [
    ...selected.eventType.map((id) => ({
      key: `eventType-${id}`,
      label: id,
      onRemove: () => toggleOption("eventType", id),
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

        {data.demoVendor && (
          <div className="mt-6 max-w-xs">
            <p className="mb-2 font-figtree text-[12px] font-semibold text-neutral-secondary">
              Preview how a package page looks
            </p>
            <VendorGridCard
              vendor={data.demoVendor}
              isBookmarked={false}
              onToggleBookmark={() => {}}
              badge="Preview"
            />
          </div>
        )}

        <div className="mt-6">
          {isLoading ? (
            <VendorCardSkeletonGroup view={view} />
          ) : filteredVendors.length === 0 ? (
            <VendorEmptyState onClearFilters={clearAll} />
          ) : (
            <>
              {view === "grid" ? (
                <VendorGrid
                  vendors={filteredVendors}
                  bookmarkedIds={bookmarkedIds}
                  onToggleBookmark={toggleBookmark}
                />
              ) : (
                <VendorList
                  vendors={filteredVendors}
                  bookmarkedIds={bookmarkedIds}
                  onToggleBookmark={toggleBookmark}
                />
              )}
              {hasMore && <LoadMoreButton onClick={handleLoadMore} />}
            </>
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
