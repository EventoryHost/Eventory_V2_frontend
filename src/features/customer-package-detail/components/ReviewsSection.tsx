"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import type { ReviewsSummary } from "../types";
import SectionHeading from "./SectionHeading";
import ReviewCard from "./ReviewCard";

export default function ReviewsSection({ reviews }: { reviews: ReviewsSummary }) {
  const [activeFilter, setActiveFilter] = useState(reviews.filters[0]?.id ?? "all");

  const visibleReviews =
    activeFilter === "all" ? reviews.items : reviews.items.filter((review) => review.filterIds.includes(activeFilter));

  return (
    <section id="reviews" className="border-t border-black/5 pt-8">
      <SectionHeading eyebrow={`${reviews.total} verified events`}>Reviews</SectionHeading>

      <div className="mb-8 flex flex-col gap-10 md:flex-row">
        <div>
          <div className="mb-2 font-figtree text-[42px] leading-none font-bold text-brand-950">
            {reviews.average}
          </div>
          <div className="mb-1 flex gap-0.5 text-brand-primary">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${i < Math.round(reviews.average) ? "fill-brand-primary" : "fill-none text-black/15"}`}
              />
            ))}
          </div>
          <div className="font-figtree text-[12px] text-neutral-tertiary">{reviews.total} reviews</div>
        </div>

        <div className="flex-1 space-y-1">
          {reviews.breakdown.map((row) => (
            <div key={row.stars} className="flex items-center gap-2 font-figtree text-[12px]">
              <span className="w-2 text-neutral-secondary">{row.stars}</span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-black/10">
                <div className="h-full bg-brand-primary" style={{ width: `${row.percent}%` }} />
              </div>
              <span className="w-4 text-right text-neutral-tertiary">{row.count}</span>
            </div>
          ))}
        </div>

        <div className="grid flex-1 grid-cols-2 gap-x-4 gap-y-2 font-figtree text-[12px]">
          {reviews.categories.map((category) => (
            <div key={category.label} className="flex justify-between">
              <span className="text-neutral-secondary">{category.label}</span>
              <span className="font-bold text-brand-950">{category.score}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {reviews.filters.map((filter) => {
          const isActive = filter.id === activeFilter;
          return (
            <button
              key={filter.id}
              type="button"
              onClick={() => setActiveFilter(filter.id)}
              aria-pressed={isActive}
              className={`rounded-full border px-3 py-1 font-figtree text-[12px] font-medium transition-colors ${
                isActive
                  ? "border-brand-primary bg-[#FEF2F2] text-brand-primary"
                  : "border-black/10 text-neutral-secondary hover:bg-black/5"
              }`}
            >
              {filter.label}
            </button>
          );
        })}
      </div>

      <div className="space-y-6">
        {visibleReviews.length > 0 ? (
          visibleReviews.map((review, i) => (
            <ReviewCard key={review.id} review={review} isLast={i === visibleReviews.length - 1} />
          ))
        ) : (
          <p className="font-figtree text-[13px] text-neutral-tertiary">No reviews match this filter yet.</p>
        )}
      </div>
    </section>
  );
}
