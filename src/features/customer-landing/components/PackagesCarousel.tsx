"use client";

import { useRef } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import ProductCard, { type ProductCardProps } from "./ProductCard";

const PACKAGES: ProductCardProps[] = Array.from({ length: 6 }, () => ({
  image: "/images/customer/packages-pics.png",
  categoryLabel: "Makeup Artist",
  categoryIcon: "/images/customer/makeup.png",
  tags: ["Wedding", "Anniversary", "Social Gathering", "Sangeet", "Reception"],
  title: "Neon Pulse Club & Wedding - Gold Package",
  rating: 4.5,
  reviewCount: 13,
  duration: "Full day (8 hrs)",
  guestCapacity: "Upto 300 guests",
  price: "₹15,999",
  locations: ["Delhi NCR", "New Delhi", "Gururgram"],
}));

const SCROLL_AMOUNT = 336;

export default function PackagesCarousel() {
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
          <h2 className="font-figtree font-bold text-brand-950 text-[28px] sm:text-[32px] leading-[1.2] tracking-[-0.02em]">
            Packages Often Booked by our Customers
          </h2>
          <p className="mt-2 font-figtree font-normal text-[16px] leading-[1.35] tracking-[-0.02em] text-body-secondary">
            Book venues, decorators, caterers, entertainers, and photographers
            packages together.
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
        {PACKAGES.map((pkg, i) => (
          <div key={i} className="shrink-0 snap-start">
            <ProductCard {...pkg} />
          </div>
        ))}
      </div>
    </section>
  );
}
