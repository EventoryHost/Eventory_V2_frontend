"use client";

import { useRef } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import ReviewCard, { type ReviewCardProps } from "./ReviewCard";
import { STATIC_REVIEWS } from "../data/staticReviews";

const AVATAR_COLORS = ["#0EA5E9", "#FBBF24", "#14B8A6", "#F0596F", "#8B5CF6"];

// Static for now — the v1 site's testimonials (see data/staticReviews.ts),
// not live data from GET /customer/reviews/featured.
const REVIEWS: ReviewCardProps[] = STATIC_REVIEWS.map((review, i) => ({
  rating: review.rating,
  quote: review.quote,
  name: review.name,
  avatarBg: AVATAR_COLORS[i % AVATAR_COLORS.length],
}));

const SCROLL_AMOUNT = 336;

export default function ReviewsCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    scrollRef.current?.scrollBy({
      left: direction === "left" ? -SCROLL_AMOUNT : SCROLL_AMOUNT,
      behavior: "smooth",
    });
  };

  return (
    <section className="mx-auto mt-16 w-full max-w-[1320px]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="font-figtree text-[13px] font-bold uppercase tracking-wider text-[#F0596F]">
            Why choose eventory
          </span>
          <h2 className="mt-2 font-figtree font-semibold text-brand-950 text-[28px] sm:text-[32px] leading-[1.2] tracking-[-0.02em]">
            Loved by <span className="text-[#F0596F]">15000+</span> Happy
            Customers
          </h2>
        </div>

        <div className="hidden sm:flex items-center gap-3 shrink-0">
          <button
            type="button"
            aria-label="Scroll left"
            onClick={() => scroll("left")}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 text-brand-950"
          >
            <ArrowLeft size={18} />
          </button>
          <button
            type="button"
            aria-label="Scroll right"
            onClick={() => scroll("right")}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 text-brand-950"
          >
            <ArrowRight size={18} />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="mt-8 flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {REVIEWS.map((review, i) => (
          <div key={i} className="relative shrink-0 snap-start">
            {i === 0 && (
              <div className="absolute inset-0 -z-10 rotate-[-4deg] rounded-[20px] bg-[#FFDDE1]" />
            )}
            <ReviewCard {...review} />
          </div>
        ))}
      </div>
    </section>
  );
}
