"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import ReviewCard, { type ReviewCardProps } from "./ReviewCard";
import { getFeaturedReviews } from "@/lib/customerDiscoveryApi";

const FALLBACK_AVATAR = "/images/customer/user-review.png";
const AVATAR_COLORS = ["#0EA5E9", "#FBBF24", "#14B8A6", "#F0596F", "#8B5CF6"];

// Static placeholder testimonials — shown until GET /customer/reviews/featured
// exists on the backend (see customerDiscoveryApi.ts's getFeaturedReviews doc
// comment for the exact spec) or while it returns nothing.
const FALLBACK_REVIEWS: ReviewCardProps[] = [
  {
    rating: 5,
    quote:
      '"This is the best platform for event planning! I found the perfect package that fit our budget perfectly. My daughter\'s birthday was absolutely magical, with every detail thoughtfully arranged. The team made the entire process so easy and stress-free, turning our vision into a memorable celebration that everyone enjoyed."',
    name: "Walter White",
    timeAgo: "3 Days Ago",
    avatar: "/images/customer/user-review.png",
    avatarBg: "#0EA5E9",
  },
  {
    rating: 5,
    quote:
      "Eventory made our dream wedding possible! The vendor quality was exceptional, and their transparent pricing gave us peace of mind throughout the planning process. Every detail was handled with care, making our special day truly unforgettable. Highly recommend to anyone looking for a stress-free wedding experience!",
    name: "Sardar Khan",
    timeAgo: "12 Days ago",
    avatar: "/images/customer/user-review.png",
    avatarBg: "#FBBF24",
  },
  {
    rating: 5,
    quote:
      "We flawlessly organized our annual conference, ensuring every detail was handled with care. The team's support was exceptional throughout the process, and every element was delivered promptly, making the event a great success.",
    name: "Bholi Panjaban",
    timeAgo: "On 23 May",
    avatar: "/images/customer/user-review.png",
    avatarBg: "#14B8A6",
  },
  {
    rating: 5,
    quote:
      '"This is the best platform for event planning! I found the perfect package that fit our budget perfectly. My daughter\'s birthday was absolutely magical, with every detail thoughtfully arranged. The team made the entire process so easy and stress-free, turning our vision into a memorable celebration that everyone enjoyed."',
    name: "Walter White",
    timeAgo: "3 Days Ago",
    avatar: "/images/customer/user-review.png",
    avatarBg: "#0EA5E9",
  },
];

function formatTimeAgo(dateString: string) {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const days = Math.floor(diffMs / 86_400_000);
  if (days <= 0) return "Today";
  if (days === 1) return "1 Day Ago";
  if (days < 30) return `${days} Days Ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} Month${months > 1 ? "s" : ""} Ago`;
  const years = Math.floor(months / 12);
  return `${years} Year${years > 1 ? "s" : ""} Ago`;
}

const SCROLL_AMOUNT = 336;

export default function ReviewsCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [reviews, setReviews] = useState<ReviewCardProps[]>(FALLBACK_REVIEWS);

  useEffect(() => {
    let cancelled = false;
    getFeaturedReviews({ limit: 8, minRating: 4 })
      .then((response) => {
        if (cancelled || response.items.length === 0) return;
        setReviews(
          response.items.map((item, i) => ({
            rating: item.rating,
            quote: item.comment,
            name: item.customerName ?? "Eventory Customer",
            timeAgo: formatTimeAgo(item.createdAt),
            avatar: item.customerAvatar || FALLBACK_AVATAR,
            avatarBg: AVATAR_COLORS[i % AVATAR_COLORS.length],
          }))
        );
      })
      .catch(() => {
        // Endpoint doesn't exist yet (or failed) — keep the static fallback.
      });
    return () => {
      cancelled = true;
    };
  }, []);

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
        {reviews.map((review, i) => (
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
