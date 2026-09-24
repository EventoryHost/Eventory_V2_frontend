"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { getWishlist, addWishlistItem, removeWishlistItem } from "@/lib/customerWishlistApi";
import AuthModal from "@/features/customer-auth/components/AuthModal";
import { useCustomerSession } from "@/features/customer-auth/hooks/useCustomerSession";
import type { VendorProfileData } from "../types";
import VendorCoverBanner from "./VendorCoverBanner";
import VendorProfileHeader from "./VendorProfileHeader";
import ChipRow from "./ChipRow";
import SectionHeading from "./SectionHeading";
import VendorStatsBar from "./VendorStatsBar";
import VendorPackagesSection from "./VendorPackagesSection";
import VendorGallerySection from "./VendorGallerySection";
import VendorReviewsSection from "./VendorReviewsSection";

const FALLBACK_AVATAR = "/images/customer/packages-pics.png";

/** Stable empty set — a fresh one per render would restart every memo below it. */
const NO_BOOKMARKS: ReadonlySet<string> = new Set<string>();

export default function VendorProfilePageContent({ data }: { data: VendorProfileData }) {
  const { vendor, packages, packagesTotal, reviews } = data;
  const { isLoggedIn } = useCustomerSession();

  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const wishlistItemIdsRef = useRef(new Map<string, string>());
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const pendingBookmarkRef = useRef<{ id: string; type: "Package" | "Vendor" } | null>(null);

  // Wishlist is customer-only. Both kinds of save matter here: the vendor
  // themselves (the header's Wishlist button) and their individual packages
  // (the cards below), so the id -> wishlistItemId map is keyed across both.
  useEffect(() => {
    if (!isLoggedIn) {
      // Only the ref is cleared here. The rendered set is DERIVED from
      // isLoggedIn below rather than reset with setState, which would be a
      // synchronous state write inside an effect (cascading render).
      wishlistItemIdsRef.current.clear();
      return;
    }
    let cancelled = false;
    getWishlist()
      .then((response) => {
        if (cancelled) return;
        const ids = new Set<string>();
        wishlistItemIdsRef.current.clear();
        // Both id forms registered for a saved Vendor — this page keys off
        // the business-facing "VEN..." id, the populated document also
        // carries the Mongo _id, and addWishlistItem stored whichever the
        // caller sent. See the same note in VendorsPageContent.
        const register = (item: (typeof response.items)[number], ...keys: (string | undefined)[]) => {
          keys.filter(Boolean).forEach((key) => {
            ids.add(key as string);
            wishlistItemIdsRef.current.set(key as string, item._id);
          });
        };

        response.items.forEach((item) => {
          if (item.itemType === "Package" && item.packageId) {
            register(item, item.packageId._id);
          }
          if (item.itemType === "Vendor" && item.vendorId) {
            register(item, item.vendorId._id, item.vendorId.id);
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

  // Logged out means "nothing saved", without having to keep that fact in
  // state in two places.
  const savedIds = isLoggedIn ? bookmarkedIds : NO_BOOKMARKS;

  async function toggleBookmark(id: string, itemType: "Package" | "Vendor") {
    if (!isLoggedIn) {
      pendingBookmarkRef.current = { id, type: itemType };
      setIsAuthOpen(true);
      return;
    }
    const isSaved = savedIds.has(id);
    try {
      if (isSaved) {
        const itemId = wishlistItemIdsRef.current.get(id);
        if (itemId) {
          await removeWishlistItem(itemId);
          wishlistItemIdsRef.current.delete(id);
        }
        setBookmarkedIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      } else {
        const result = await addWishlistItem(
          itemType === "Vendor" ? { itemType, vendorId: id } : { itemType, packageId: id }
        );
        wishlistItemIdsRef.current.set(id, result.item._id);
        setBookmarkedIds((prev) => new Set(prev).add(id));
      }
    } catch {
      // Best-effort — leave the bookmark state unchanged on failure.
    }
  }

  function handleInquire() {
    // No vendor-level enquiry endpoint exists; enquiries are raised against
    // a package. Sending the customer to this vendor's first package is the
    // closest real action — with none, the packages section already tells
    // them there is nothing to enquire about.
    const target = packages[0];
    if (target) window.location.href = `/packages/${target.id}`;
  }

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <VendorCoverBanner coverImage={vendor.coverImage} name={vendor.name} />

      <div className="mx-auto w-full max-w-[1440px] px-4 pb-16 sm:px-6 lg:px-16">
        {/* Avatar straddles the cover's bottom edge, as in the design. */}
        <div className="relative -mt-[52px] mb-5 size-[104px] overflow-hidden rounded-full border-4 border-white bg-white">
          <Image
            src={vendor.avatar || vendor.categoryIcon || FALLBACK_AVATAR}
            alt=""
            fill
            sizes="104px"
            className="object-cover"
          />
        </div>

        <div className="flex flex-col gap-8">
          <VendorProfileHeader
            vendor={vendor}
            isBookmarked={savedIds.has(vendor.id)}
            onToggleBookmark={() => toggleBookmark(vendor.id, "Vendor")}
            onInquire={handleInquire}
          />

          {vendor.serviceAreas.length > 0 && <ChipRow items={vendor.serviceAreas} />}

          <VendorStatsBar stats={vendor.stats} />

          <div className="h-px w-full bg-[#e4e4e7]" />

          {vendor.eventCategories.length > 0 && (
            <section className="flex flex-col gap-5">
              <SectionHeading>Event Specialisation</SectionHeading>
              <ChipRow items={vendor.eventCategories} />
            </section>
          )}

          <VendorPackagesSection
            packages={packages}
            total={packagesTotal}
            vendorName={vendor.name}
            bookmarkedIds={savedIds}
            onToggleBookmark={(id) => toggleBookmark(id, "Package")}
          />

          <VendorGallerySection images={vendor.gallery} vendorName={vendor.name} />

          <VendorReviewsSection vendorId={vendor.id} initial={reviews} />
        </div>
      </div>

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthenticated={() => {
          setIsAuthOpen(false);
          const pending = pendingBookmarkRef.current;
          pendingBookmarkRef.current = null;
          if (pending) void toggleBookmark(pending.id, pending.type);
        }}
      />
    </div>
  );
}
