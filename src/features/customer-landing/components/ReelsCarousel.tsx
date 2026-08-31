"use client";

import { useRef } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import ReelCard, { type ReelCardProps } from "./ReelCard";

/**
 * Each reel embeds via Instagram's public, no-auth `instagram.com/reel/<id>/embed/`
 * iframe (same technique as the v1 site's trending-reels.tsx) — no backend
 * endpoint, API key, or env var is needed for this. The iframe itself shows
 * the reel's real cover frame with Instagram's own play button baked in,
 * and only starts loading/playing the video once that's clicked.
 *
 * This list is NOT auto-fetched from Instagram — it's a manually maintained
 * shortcode list, same as v1. Truly automatic "latest N reels" would require
 * the Instagram Graph API instead: a Business/Creator IG account linked to a
 * Facebook Page, a Meta developer app, and a long-lived access token that
 * needs periodic refresh — real backend work (a proxy endpoint so the token
 * never ships to the client) if that's wanted later.
 */


// reelId/caption — real posts from the @eventory account, supplied directly
// as instagram.com/reel/<id>/ links. Captions/likes/comments are still
// decorative placeholders (pulling real caption text/engagement counts needs
// the Instagram Graph API — see ReelsCarousel's doc comment above). This list
// needs manual upkeep to stay "latest" — swap in new reel shortcodes as
// Eventory posts new reels.
const REELS: ReelCardProps[] = [
  {
    handle: "@eventory",
    reelId: "DScrLUEk6sA",
    caption: "Are you ready to truly enjoy a New Year party?",
    likes: "22k",
    comments: "20",
  },
  {
    handle: "@eventory",
    reelId: "DSH9C7tjSmw",
    caption: "Planning a New Year Party? Just Eventory it!",
    likes: "18k",
    comments: "15",
  },
  {
    handle: "@eventory",
    reelId: "DQ6zsxRk71C",
    caption: "Discover the best vendor network for any event",
    likes: "12k",
    comments: "10",
  },
  {
    handle: "@eventory",
    reelId: "DQwfzLaEzQB",
    caption: "Creating premium party experiences for every occasion",
    likes: "14k",
    comments: "12",
  },
  {
    handle: "@eventory",
    reelId: "DV_ai9lk4lH",
    caption: "Check out our latest reel!",
    likes: "22k",
    comments: "20",
  },
  {
    handle: "@eventory",
    reelId: "DVOoLpak6xK",
    caption: "Check out our latest reel!",
    likes: "18k",
    comments: "15",
  },
  {
    handle: "@eventory",
    reelId: "DUYbhv5Exv_",
    caption: "Check out our latest reel!",
    likes: "12k",
    comments: "10",
  },
  {
    handle: "@eventory",
    reelId: "DUFjFwpClvo",
    caption: "Check out our latest reel!",
    likes: "14k",
    comments: "12",
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
    <section className="mx-auto mt-16 w-full max-w-[1320px]">
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
