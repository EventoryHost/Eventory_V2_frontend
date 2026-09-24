"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";
import { browsePackages } from "@/lib/customerDiscoveryApi";
import { CATEGORY_TO_VENDOR_TYPE, SORT_UI_TO_API } from "@/lib/vendorType";
import { getWishlist, addWishlistItem, removeWishlistItem } from "@/lib/customerWishlistApi";
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
import { getPackageFilterSections, PACKAGES_PAGE_SIZE } from "../data/filterConfig";
import { filterPackages, packageFilterLabel } from "../utils/filterPackages";
import { mapPackageToListItem } from "../mappers";
import {
  EMPTY_PACKAGE_FILTERS,
  type PackageListingData,
  type PackageSelectedFilters,
  type PackageSortOption,
} from "../types";

const NO_BOOKMARKS: ReadonlySet<string> = new Set<string>();

export default function PackageListingContent({ data }: { data: PackageListingData }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const [category, setCategory] = useState(searchParams.get("category") ?? "all");
  const [sort, setSort] = useState<PackageSortOption>(
    (searchParams.get("sort") as PackageSortOption) ?? "newest"
  );
  const [selected, setSelected] = useState<PackageSelectedFilters>(EMPTY_PACKAGE_FILTERS);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const [packages, setPackages] = useState(data.packages);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(data.totalPages);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

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
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, category, sort]);

  // Refetch page 1 when category, sort or the debounced search changes.
  // Skipped on the very first run when they all match what the server
  // already rendered, so the page doesn't flash a reload of its own data.
  const isFirstRun = useRef(true);
  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      if (category === "all" && sort === "newest" && !debouncedSearch) return;
    }
    let cancelled = false;
    setIsLoading(true);
    browsePackages({
      q: debouncedSearch || undefined,
      vendorType: category === "all" ? undefined : CATEGORY_TO_VENDOR_TYPE[category],
      sort: SORT_UI_TO_API[sort],
      page: 1,
      limit: PACKAGES_PAGE_SIZE,
    })
      .then((response) => {
        if (cancelled) return;
        setPackages(response.packages.map(mapPackageToListItem));
        setPage(1);
        setTotalPages(response.totalPages);
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
  }, [category, sort, debouncedSearch]);

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

  // Sections depend on the active category: the design's Makeup Service /
  // Style / Hair sections belong to Makeup Artist only.
  const filterSections = useMemo(
    () => getPackageFilterSections({ eventCategoryOptions: data.eventCategoryOptions, categoryId: category }),
    [data.eventCategoryOptions, category]
  );

  const visiblePackages = useMemo(() => filterPackages(packages, selected), [packages, selected]);
  const hasMore = page < totalPages;

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
      const response = await browsePackages({
        q: debouncedSearch || undefined,
        vendorType: category === "all" ? undefined : CATEGORY_TO_VENDOR_TYPE[category],
        sort: SORT_UI_TO_API[sort],
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
      label: packageFilterLabel(section.id, id),
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

            {chips.length > 0 && <ActiveFilterChips chips={chips} onClearAll={clearAll} />}

            <div className="flex flex-wrap items-center justify-between gap-4">
              <ResultsHeader heading={heading} resultCount={visiblePackages.length} />
              <SortMenu value={sort} onChange={setSort} />
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
                />
                {hasMore && <LoadMoreButton onClick={handleLoadMore} isLoading={isLoadingMore} />}
              </>
            )}
          </div>

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
