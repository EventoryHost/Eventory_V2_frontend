"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Star } from "lucide-react";
import { getVendorReviews } from "@/lib/vendorPublicApi";
import type { RawPdpReviewItem } from "@/lib/customerPackageDetailApi";
import { VENDOR_REVIEWS_PAGE_SIZE } from "../services/getVendorProfileData";
import { REVIEW_SORTS, type ReviewSort, type VendorProfileReviews } from "../types";
import SectionHeading from "./SectionHeading";
import RatingsSummary from "./RatingsSummary";

const AVATAR_FALLBACK = "/images/customer/user-review.png";

function formatReviewDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function ReviewCard({ review }: { review: RawPdpReviewItem }) {
  return (
    <div className="flex gap-3 border-b border-[#e4e4e7] py-5 last:border-b-0">
      <div className="relative size-10 shrink-0 overflow-hidden rounded-full bg-neutral-subtle">
        <Image
          src={review.customerId?.profilePicture || AVATAR_FALLBACK}
          alt=""
          fill
          sizes="40px"
          className="object-cover"
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-figtree text-[14px] leading-[20px] font-semibold text-[#030303]">
            {review.customerId?.name || "Eventory customer"}
          </span>
          <span className="font-figtree text-[12px] leading-[18px] font-medium text-[#71717b]">
            {formatReviewDate(review.createdAt)}
          </span>
        </div>

        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, index) => (
            <Star
              key={index}
              className={`size-3.5 ${
                index < review.rating ? "fill-[#ea1d3b] text-[#ea1d3b]" : "fill-none text-[#d4d4d8]"
              }`}
              strokeWidth={1.5}
            />
          ))}
        </div>

        {review.comment && (
          <p className="font-figtree text-[14px] leading-[20px] font-medium text-[#3f3f47]">
            {review.comment}
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * "Reviews" — the ratings summary plus a sortable, paged list.
 *
 * Sorting and paging go back to GET /customer/vendors/:vendorId/reviews
 * rather than being done client-side: the endpoint already sorts and
 * paginates, and only the first page is server-rendered, so a client-side
 * sort would only ever reorder the handful of reviews already loaded.
 */
export default function VendorReviewsSection({
  vendorId,
  initial,
}: {
  vendorId: string;
  initial: VendorProfileReviews;
}) {
  const [items, setItems] = useState(initial.items);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(initial.totalPages);
  const [sort, setSort] = useState<ReviewSort>("recent");
  const [isLoading, setIsLoading] = useState(false);

  // Skips the first run: the server already rendered page 1 sorted by
  // "recent", so refetching it immediately would just flash the same rows.
  const isFirstRun = useRef(true);
  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    let cancelled = false;
    setIsLoading(true);
    getVendorReviews(vendorId, { sort, page: 1, limit: VENDOR_REVIEWS_PAGE_SIZE })
      .then((response) => {
        if (cancelled) return;
        setItems(response.items);
        setPage(1);
        setTotalPages(response.totalPages);
      })
      .catch(() => {
        // Leave the current page in place — the sort control stays usable.
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [vendorId, sort]);

  async function handleLoadMore() {
    if (isLoading || page >= totalPages) return;
    setIsLoading(true);
    try {
      const nextPage = page + 1;
      const response = await getVendorReviews(vendorId, {
        sort,
        page: nextPage,
        limit: VENDOR_REVIEWS_PAGE_SIZE,
      });
      setItems((prev) => [...prev, ...response.items]);
      setPage(nextPage);
      setTotalPages(response.totalPages);
    } catch {
      // Leave the loaded reviews as-is; the button stays available to retry.
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="flex flex-col gap-5">
      <SectionHeading>Reviews</SectionHeading>

      <div className="flex flex-col gap-6 rounded-[20px] border border-[#e4e4e7] bg-white px-5 py-5">
        <RatingsSummary aggregate={initial.aggregate} />

        {initial.total > 0 && (
          <>
            <div className="h-px w-full bg-[#e4e4e7]" />

            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-2">
                {REVIEW_SORTS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    aria-pressed={sort === option.id}
                    onClick={() => setSort(option.id)}
                    className={`rounded-[37px] border px-3 py-1.5 font-figtree text-[14px] leading-[20px] font-medium transition-colors ${
                      sort === option.id
                        ? "border-[#030303] bg-[#030303] text-white"
                        : "border-[#e4e4e7] bg-white text-[#030303] hover:border-brand-primary"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              <div className={isLoading ? "opacity-60 transition-opacity" : "transition-opacity"}>
                {items.map((review) => (
                  <ReviewCard key={review._id} review={review} />
                ))}
              </div>

              {page < totalPages && (
                <button
                  type="button"
                  onClick={handleLoadMore}
                  disabled={isLoading}
                  className="self-center rounded-xl border border-[#e4e4e7] bg-white px-8 py-2.5 font-figtree text-[14px] font-bold text-neutral-primary transition-colors hover:border-brand-primary hover:text-brand-primary disabled:opacity-60"
                >
                  {isLoading ? "Loading..." : "Load more reviews"}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
