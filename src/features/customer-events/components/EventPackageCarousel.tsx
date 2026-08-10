"use client";

import { useRef } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import EventPackageCard, {
  type EventPackageCardProps,
} from "./EventPackageCard";

export type EventPackageCarouselProps = {
  heading: string;
  subtitle: string;
  events: EventPackageCardProps[];
};

const SCROLL_AMOUNT = 337;

export default function EventPackageCarousel({
  heading,
  subtitle,
  events,
}: EventPackageCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    scrollRef.current?.scrollBy({
      left: direction === "left" ? -SCROLL_AMOUNT : SCROLL_AMOUNT,
      behavior: "smooth",
    });
  };

  return (
    <section className="mx-auto w-full max-w-[1320px] px-4 py-10 sm:px-6 lg:px-16">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-figtree font-bold text-brand-950 text-[28px] sm:text-[32px] leading-[1.2] tracking-[-0.02em]">
            {heading}
          </h2>
          <p className="mt-2 font-figtree text-[16px] font-normal text-body-secondary">
            {subtitle}
          </p>
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
        {events.map((event, i) => (
          <div key={i} className="snap-start">
            <EventPackageCard {...event} />
          </div>
        ))}
      </div>
    </section>
  );
}
