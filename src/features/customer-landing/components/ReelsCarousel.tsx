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
    reelId: "DeHfD55zuwB",
    thumbnail: "/images/customer/reels/DeHfD55zuwB.jpg",
    video: "/images/customer/reels/DeHfD55zuwB.mp4",
    caption: "What a birthday celebration looks like when everything comes together",
  },
  {
    handle: "@eventory",
    reelId: "DdbtNnSzqs3",
    thumbnail: "/images/customer/reels/DdbtNnSzqs3.jpg",
    video: "/images/customer/reels/DdbtNnSzqs3.mp4",
    caption: "Behind a great event: every vendor, one platform",
  },
  {
    handle: "@eventory",
    reelId: "Dd6lKWWz_be",
    thumbnail: "/images/customer/reels/Dd6lKWWz_be.jpg",
    video: "/images/customer/reels/Dd6lKWWz_be.mp4",
    caption: "Looking for decor inspo? Start here",
  },
  {
    handle: "@eventory",
    reelId: "DdUBXLxztMG",
    thumbnail: "/images/customer/reels/DdUBXLxztMG.jpg",
    caption: "A glimpse into a Kuan Poojan celebration",
  },
  {
    handle: "@eventory",
    reelId: "DfFSQ9bTlV6",
    kind: "p",
    thumbnail: "/images/customer/reels/DfFSQ9bTlV6.jpg",
    video: "/images/customer/reels/DfFSQ9bTlV6.mp4",
    caption: "Don't let her birthday become another to-do",
  },
  {
    handle: "@eventory",
    reelId: "DfKmBUlzBCE",
    kind: "p",
    thumbnail: "/images/customer/reels/DfKmBUlzBCE.jpg",
    video: "/images/customer/reels/DfKmBUlzBCE.mp4",
    caption: "Planning a kid's birthday? Save this first",
  },
  {
    handle: "@eventory",
    reelId: "DfPod0kzS-G",
    thumbnail: "/images/customer/reels/DfPod0kzS-G.jpg",
    video: "/images/customer/reels/DfPod0kzS-G.mp4",
    caption: "Make your parents' anniversary special",
  },
  {
    handle: "@eventory",
    reelId: "DewvrpGzzrG",
    kind: "p",
    thumbnail: "/images/customer/reels/DewvrpGzzrG.jpg",
    video: "/images/customer/reels/DewvrpGzzrG.mp4",
    caption: "A birthday car surprise she won't see coming",
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
