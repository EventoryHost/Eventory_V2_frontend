"use client";

import { useRef } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import ReelCard, { type ReelCardProps } from "./ReelCard";

const REELS: ReelCardProps[] = [
  {
    handle: "@eventory",
    caption: "Plan your Event for holi 2026 and celebrate with yo...",
    likes: "22k",
    comments: "20",
  },
  {
    handle: "@eventory",
    caption: "Book your Summer Festival 2026 and enjoy vibrant acti...",
    likes: "18k",
    comments: "15",
  },
  {
    handle: "@eventory",
    caption: "Organize your Autumn Fair 2026 and gather the comm...",
    likes: "12k",
    comments: "10",
  },
  {
    handle: "@eventory",
    caption: "Prepare for the Winter Wonderland 2026 and spre...",
    likes: "25k",
    comments: "30",
  },
  {
    handle: "@eventory",
    caption: "Join the New Year Celebration 2027 and ring i...",
    likes: "30k",
    comments: "25",
  },
  {
    handle: "@eventory",
    caption: "Experience the Spring Gala 2026 and connect with nat...",
    likes: "14k",
    comments: "12",
  },
  {
    handle: "@eventory",
    caption: "Celebrate your Wedding season 2026...",
    likes: "20k",
    comments: "18",
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
