"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeftRight, X } from "lucide-react";
import { useCustomerSession } from "@/features/customer-auth/hooks/useCustomerSession";
import { getWishlist, removeWishlistItem, type RawWishlistItem } from "@/lib/customerWishlistApi";
import { addCompareItem, clearCompare, getCompare, MAX_COMPARE_PACKAGES } from "@/lib/customerCompareApi";
import { CATEGORY_META } from "@/lib/categoryMeta";
import { VENDOR_TYPE_TO_CATEGORY } from "@/lib/vendorType";
import AccountViewToggle, { type AccountViewMode } from "./AccountViewToggle";
import WishlistItemCard from "./WishlistItemCard";
import { mapWishlistCard, type WishlistCardItem } from "../utils/wishlistCards";

type WishlistTab = "packages" | "vendors";

/** The tile's size in the design; every art placement below is relative to it. */
const TILE_SIZE = 148;

interface WishlistCategory {
  slug: string;
  label: string;
  gradientTo: string;
  /**
   * Where the illustration sits inside the 148x148 tile, in px — rendered as a
   * percentage of the tile so it scales with it in narrower columns. The design
   * oversizes each one and lets it bleed past the tile's bottom/right edge
   * (the tile clips it), and the offsets differ per category — so these are
   * placements measured off the Figma node, not one shared rule. They are
   * expressed for CATEGORY_META's art, which is cropped tighter than the
   * Figma export, hence the boxes being larger than the ones in Figma.
   */
  art: { width: number; height: number; left: number; top: number };
}

/**
 * The six tiles, in the design's order (Wishlist, node 1541:5857). `gradientTo`
 * is the tile's own palette — deliberately NOT CATEGORY_META's `gradientFrom`,
 * which is the badge-pill palette and maps different colours to the same
 * categories. The illustrations are reused from CATEGORY_META, which already
 * holds this exact art for the package cards and PDP header.
 */
const WISHLIST_CATEGORIES: WishlistCategory[] = [
  { slug: "caterer", label: "Caterer", gradientTo: "#FFEDD6", art: { width: 154, height: 132, left: 33, top: 25 } },
  { slug: "decorator", label: "Decorator", gradientTo: "#DBFFEB", art: { width: 152, height: 142, left: 14, top: 32 } },
  { slug: "venue-provider", label: "Venue Provider", gradientTo: "#DBEFFF", art: { width: 113, height: 101, left: 46, top: 54 } },
  { slug: "dj-artist", label: "Dj Artist", gradientTo: "#E8DBFF", art: { width: 107, height: 101, left: 42, top: 52 } },
  { slug: "makeup-artist", label: "Makeup Artist", gradientTo: "#FFCCD3", art: { width: 110, height: 101, left: 57, top: 52 } },
  { slug: "photographer", label: "Photographers", gradientTo: "#FFF5DB", art: { width: 106, height: 101, left: 45, top: 49 } },
];

/** Counts saved items per category slug for the given tab. */
function countByCategory(items: RawWishlistItem[], tab: WishlistTab) {
  const counts: Record<string, number> = {};

  items.forEach((item) => {
    const isPackageTab = tab === "packages";
    if (isPackageTab !== (item.itemType === "Package")) return;

    // Both populates select vendorType, so either side can be categorised.
    const vendorType = isPackageTab ? item.packageId?.vendorType : item.vendorId?.vendorType;
    if (!vendorType) return;

    const slug = VENDOR_TYPE_TO_CATEGORY[vendorType];
    if (slug) counts[slug] = (counts[slug] ?? 0) + 1;
  });

  return counts;
}

function countLabel(count: number, tab: WishlistTab) {
  const noun = tab === "packages" ? "package" : "vendor";
  if (count === 0) return tab === "packages" ? "No packages" : "No vendors";
  return `${count} ${noun}${count === 1 ? "" : "s"}`;
}

function CategoryTile({
  label,
  gradientTo,
  art,
  icon,
  count,
  tab,
  onOpen,
}: {
  label: string;
  gradientTo: string;
  art: WishlistCategory["art"];
  icon?: string;
  count: number;
  tab: WishlistTab;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      disabled={count === 0}
      className="flex w-full max-w-[148px] flex-col items-center gap-3 text-center transition-opacity disabled:cursor-default disabled:opacity-60"
    >
      <div
        className="relative aspect-square w-full overflow-hidden rounded-[20px] border border-[#E4E4E7]"
        style={{ backgroundImage: `linear-gradient(135deg, #FFFFFF 30%, ${gradientTo} 100%)` }}
      >
        {icon && (
          <Image
            src={icon}
            alt=""
            width={art.width}
            height={art.height}
            className="pointer-events-none absolute max-w-none"
            style={{
              width: `${(art.width / TILE_SIZE) * 100}%`,
              height: `${(art.height / TILE_SIZE) * 100}%`,
              left: `${(art.left / TILE_SIZE) * 100}%`,
              top: `${(art.top / TILE_SIZE) * 100}%`,
            }}
          />
        )}
      </div>
      <div className="flex flex-col items-center gap-0.5">
        <p className="text-[16px] font-semibold leading-6 text-[#030303]">{label}</p>
        <p className="text-[14px] font-medium leading-5 text-[#9F9FA9]">{countLabel(count, tab)}</p>
      </div>
    </button>
  );
}

export default function WishlistContent() {
  const { isLoggedIn } = useCustomerSession();
  const router = useRouter();
  const [tab, setTab] = useState<WishlistTab>("packages");
  const [items, setItems] = useState<RawWishlistItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  // Set only from the request's callbacks, never synchronously in the effect.
  const [hasSettled, setHasSettled] = useState(false);

  /** Null on the category grid; a slug once a category has been opened. */
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const [view, setView] = useState<AccountViewMode>("list");
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [compareState, setCompareState] = useState<{ busy: boolean; message: string | null }>({
    busy: false,
    message: null,
  });
  const [sharedItemId, setSharedItemId] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoggedIn) return;

    let cancelled = false;
    getWishlist()
      .then((response) => {
        if (cancelled) return;
        setItems(response.items);
        setError(null);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Could not load your wishlist");
      })
      .finally(() => {
        if (!cancelled) setHasSettled(true);
      });

    return () => {
      cancelled = true;
    };
  }, [isLoggedIn]);

  const counts = countByCategory(items, tab);
  const isLoading = isLoggedIn && !hasSettled;
  const openCategory = WISHLIST_CATEGORIES.find((category) => category.slug === openSlug);

  const visibleCards = useMemo(() => {
    if (!openSlug) return [];
    const wantPackages = tab === "packages";

    return items
      .filter((item) => wantPackages === (item.itemType === "Package"))
      .map(mapWishlistCard)
      .filter((card): card is WishlistCardItem => card !== null && card.categorySlug === openSlug);
  }, [items, openSlug, tab]);

  /**
   * Pre-ticks whatever is already in the comparison, so arriving here from
   * /compare's "Add Package" adds to it instead of starting over. Scoped to
   * the cards on screen: the comparison is single-category, so ids from
   * another category would only get rejected on submit.
   */
  useEffect(() => {
    if (!openSlug || tab !== "packages") return;

    let cancelled = false;
    getCompare()
      .then((session) => {
        if (cancelled) return;
        const onScreen = new Set(visibleCards.map((card) => card.packageId));
        setCompareIds(session.items.map((item) => item.packageId).filter((id) => onScreen.has(id)));
      })
      .catch(() => {
        // An unreadable comparison just means nothing starts ticked.
      });

    return () => {
      cancelled = true;
    };
  }, [openSlug, tab, visibleCards]);

  /** Leaving the category (or switching tabs) drops a half-made selection. */
  function closeCategory() {
    setOpenSlug(null);
    setCompareIds([]);
    setCompareState({ busy: false, message: null });
  }

  function toggleCompare(packageId: string) {
    setCompareState((state) => ({ ...state, message: null }));
    setCompareIds((selected) => {
      if (selected.includes(packageId)) return selected.filter((id) => id !== packageId);
      if (selected.length >= MAX_COMPARE_PACKAGES) return selected;
      return [...selected, packageId];
    });
  }

  async function handleRemove(itemId: string) {
    const removed = items.find((item) => item._id === itemId);
    // Optimistic: the row leaves the list before the request settles, and
    // goes back if the delete fails.
    setItems((current) => current.filter((item) => item._id !== itemId));
    if (removed?.packageId) {
      setCompareIds((selected) => selected.filter((id) => id !== removed.packageId!._id));
    }

    try {
      await removeWishlistItem(itemId);
    } catch (err: unknown) {
      if (removed) setItems((current) => [removed, ...current]);
      setError(err instanceof Error ? err.message : "Could not remove that item");
    }
  }

  async function handleShare(item: WishlistCardItem) {
    if (!item.href) return;
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${item.href}`);
      setSharedItemId(item.itemId);
      window.setTimeout(() => setSharedItemId(null), 2000);
    } catch {
      // Clipboard access can be refused (permissions, insecure origin) —
      // nothing useful to recover, and the link is still one click away.
    }
  }

  /**
   * Replaces the comparison with exactly what's ticked here, then opens it.
   * The session (max 3, one vendorType) is what /compare reads back — the
   * page carries no ids of its own.
   */
  async function handleCompare() {
    setCompareState({ busy: true, message: null });
    try {
      await clearCompare();
      for (const packageId of compareIds) {
        await addCompareItem(packageId);
      }
      router.push("/compare");
    } catch (err: unknown) {
      setCompareState({
        busy: false,
        message: err instanceof Error ? err.message : "Could not build that comparison",
      });
    }
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-[24px] font-semibold leading-8 text-[#030303]">Wishlist</h1>
          <p className="text-[14px] leading-5 text-[#71717B]">
            All your Viewed Packages, Vendors and Essentials in one place.
          </p>
        </div>

        {/* The view switch and Compare only exist once a category is open */}
        {openCategory && (
          <div className="flex items-center gap-4">
            <AccountViewToggle value={view} onChange={setView} />
            {tab === "packages" && (
              <button
                type="button"
                onClick={handleCompare}
                disabled={compareIds.length < 2 || compareState.busy}
                className="flex items-center gap-2 rounded-[10px] bg-brand-primary py-1.5 pl-1.5 pr-3 text-[14px] font-semibold leading-5 text-white transition-opacity disabled:opacity-50"
              >
                <ArrowLeftRight className="h-5 w-5" />
                {compareState.busy ? "Opening…" : "Compare Packages"}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex flex-col">
        <div className="flex items-center">
          {(["packages", "vendors"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                setTab(value);
                closeCategory();
              }}
              aria-current={tab === value ? "page" : undefined}
              className={`px-6 py-2.5 text-[16px] leading-6 ${
                tab === value
                  ? "border-b-[3px] border-brand-primary font-semibold text-[#030303]"
                  : "font-medium text-[#3F3F47]"
              }`}
            >
              {value === "packages" ? "Packages" : "Vendors"}
            </button>
          ))}
        </div>
        <span aria-hidden className="h-px w-full bg-[#E4E4E7]" />
      </div>

      {error ? (
        <p className="text-[14px] leading-5 text-[#C81E0D]">{error}</p>
      ) : isLoading ? (
        <p className="text-[14px] leading-5 text-[#71717B]">Loading your wishlist…</p>
      ) : openCategory ? (
        <div className="flex flex-col gap-4">
          {/* The open category, as a dismissible chip */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-[60px] border border-[#E4E4E7] bg-white p-1.5">
              <span
                className="flex items-center justify-center gap-2 rounded-[52px] py-0.5 pl-1 pr-2"
                style={{
                  background: `linear-gradient(to right, #ffffff, ${
                    CATEGORY_META[openCategory.slug]?.gradientFrom ?? "#FFE5E9"
                  } 80%)`,
                }}
              >
                {CATEGORY_META[openCategory.slug]?.icon && (
                  <Image
                    src={CATEGORY_META[openCategory.slug].icon}
                    alt=""
                    width={16}
                    height={16}
                    className="h-4 w-4 object-contain"
                  />
                )}
                <span className="whitespace-nowrap text-[11px] font-bold leading-4 text-[#3C060D]">
                  {openCategory.label.toUpperCase()}
                </span>
              </span>
              <button
                type="button"
                onClick={closeCategory}
                aria-label={`Clear the ${openCategory.label} filter`}
                className="flex h-5 w-5 items-center justify-center rounded-full bg-[#030303] text-white"
              >
                <X className="h-3 w-3" />
              </button>
            </div>

            {compareState.message && (
              <p className="text-[12px] leading-[18px] text-[#71717B]">{compareState.message}</p>
            )}
          </div>

          {visibleCards.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-[20px] border border-[#E4E4E7] bg-white py-10 text-center">
              <p className="text-[14px] text-[#71717B]">Nothing saved under {openCategory.label} yet.</p>
              <Link
                href={tab === "packages" ? "/packages" : "/vendors"}
                className="rounded-full border border-[#E4E4E7] px-4 py-1.5 text-[14px] font-medium text-[#27272A] transition-colors hover:bg-[#FAFAFA]"
              >
                {tab === "packages" ? "Browse packages" : "Browse vendors"}
              </Link>
            </div>
          ) : (
            <div className={view === "grid" ? "grid gap-4 xl:grid-cols-2" : "flex flex-col gap-4"}>
              {visibleCards.map((card) => (
                <WishlistItemCard
                  key={card.itemId}
                  item={card}
                  isSelected={card.packageId ? compareIds.includes(card.packageId) : undefined}
                  onToggleSelect={tab === "packages" ? toggleCompare : undefined}
                  onRemove={handleRemove}
                  onShare={handleShare}
                  isShared={sharedItemId === card.itemId}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Six across, as designed — the tiles shrink rather than wrap when the
           content column is narrower than the design's 988px. */
        <div className="grid grid-cols-2 justify-items-center gap-5 sm:grid-cols-3 lg:grid-cols-6">
          {WISHLIST_CATEGORIES.map(({ slug, label, gradientTo, art }) => (
            <CategoryTile
              key={slug}
              label={label}
              gradientTo={gradientTo}
              art={art}
              icon={CATEGORY_META[slug]?.icon}
              count={counts[slug] ?? 0}
              tab={tab}
              onOpen={() => setOpenSlug(slug)}
            />
          ))}
        </div>
      )}
    </>
  );
}
