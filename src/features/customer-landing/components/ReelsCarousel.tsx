"use client";

import { useRef } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import ReelCard, { type ReelCardProps } from "./ReelCard";

/**
 * Each card shows a local video (downloaded once from Instagram's public,
 * no-auth `instagram.com/reel/<id>/embed/` page — see
 * `public/images/customer/reels/`) with the matching cover-frame image as
 * its poster, and plays in place on hover — no click-through to Instagram,
 * no Instagram iframe chrome ("View more on Instagram", like/comment
 * counts, etc.), since that chrome is cross-origin and can't be styled away.
 *
 * This list is NOT auto-fetched from Instagram — it's a manually maintained
 * shortcode list, same as v1. Truly automatic "latest N reels" would require
 * the Instagram Graph API instead: a Business/Creator IG account linked to a
 * Facebook Page, a Meta developer app, and a long-lived access token that
 * needs periodic refresh — real backend work (a proxy endpoint so the token
 * never ships to the client) if that's wanted later.
 */


// reelId/caption — real posts from the @eventory account. Captions are still
// decorative placeholders (pulling real caption text needs the Instagram
// Graph API — see ReelsCarousel's doc comment above). This list needs manual
// upkeep to stay "latest": adding a new reel means dropping in its shortcode
// AND downloading its cover-frame thumbnail + video into
// public/images/customer/reels/ (grab the `thumbnail_src` and `video_url`
// fields from a curl of its /embed/ page).
const REELS: ReelCardProps[] = [
  {
    handle: "@eventory",
    reelId: "DScrLUEk6sA",
    thumbnail: "/images/customer/reels/DScrLUEk6sA.jpg",
    video: "/images/customer/reels/DScrLUEk6sA.mp4",
    caption: "Are you ready to truly enjoy a New Year party?",
  },
  {
    handle: "@eventory",
    reelId: "DSH9C7tjSmw",
    thumbnail: "/images/customer/reels/DSH9C7tjSmw.jpg",
    video: "/images/customer/reels/DSH9C7tjSmw.mp4",
    caption: "Planning a New Year Party? Just Eventory it!",
  },
  {
    handle: "@eventory",
    reelId: "DQ6zsxRk71C",
    thumbnail: "/images/customer/reels/DQ6zsxRk71C.jpg",
    video: "/images/customer/reels/DQ6zsxRk71C.mp4",
    caption: "Discover the best vendor network for any event",
  },
  {
    handle: "@eventory",
    reelId: "DQwfzLaEzQB",
    thumbnail: "/images/customer/reels/DQwfzLaEzQB.jpg",
    video: "/images/customer/reels/DQwfzLaEzQB.mp4",
    caption: "Creating premium party experiences for every occasion",
  },
  {
    handle: "@eventory",
    reelId: "DV_ai9lk4lH",
    thumbnail: "/images/customer/reels/DV_ai9lk4lH.jpg",
    video: "/images/customer/reels/DV_ai9lk4lH.mp4",
    caption: "Check out our latest reel!",
  },
  {
    handle: "@eventory",
    reelId: "DVOoLpak6xK",
    thumbnail: "/images/customer/reels/DVOoLpak6xK.jpg",
    video: "/images/customer/reels/DVOoLpak6xK.mp4",
    caption: "Check out our latest reel!",
  },
  {
    handle: "@eventory",
    reelId: "DUYbhv5Exv_",
    thumbnail: "/images/customer/reels/DUYbhv5Exv_.jpg",
    video: "/images/customer/reels/DUYbhv5Exv_.mp4",
    caption: "Check out our latest reel!",
  },
  {
    handle: "@eventory",
    reelId: "DUFjFwpClvo",
    thumbnail: "/images/customer/reels/DUFjFwpClvo.jpg",
    video: "/images/customer/reels/DUFjFwpClvo.mp4",
    caption: "Check out our latest reel!",
  },
];

const SCROLL_AMOUNT = 223;

export default function ReelsCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    scrollRef.current?.scrollBy({
      left: direction === "left" ? -SCROLL_AMOUNT : SCROLL_AMOUNT,
      behavior: "smooth",
    });
  };

  return (
    <section className="mx-auto mt-16 w-full max-w-[1440px] px-4 sm:px-6 lg:px-16">
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="font-figtree text-[13px] font-bold uppercase tracking-wider text-[#EA1D3B]">
            See what&apos;s trending
          </span>
          <h2 className="mt-2 font-figtree font-semibold text-brand-950 text-[28px] sm:text-[32px] leading-[1.2] tracking-[-0.02em]">
            Eventory Reels
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
        {REELS.map((reel, i) => (
          <div key={i} className="shrink-0 snap-start">
            <ReelCard {...reel} />
          </div>
        ))}
      </div>
    </section>
  );
}
