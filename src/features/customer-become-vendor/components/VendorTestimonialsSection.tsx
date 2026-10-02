"use client";

import { useRef } from "react";
import { ArrowLeft, ArrowRight, Play } from "lucide-react";

// Static placeholder content — the Figma handoff itself repeats the exact
// same quote/photo/location across all three cards (no distinct per-vendor
// testimonials were provided), so this mirrors that rather than inventing
// two fake additional vendors. Swap in real vendor video testimonials
// (photo, quote, location, video url) once that content exists.
const TESTIMONIALS = [
  {
    image: "/images/customer/become/vendor-testimonial-1.jpg",
    quote:
      "After joining Eventory, I truly felt a sense of liberation I hadn't experienced in seven years. Now, I have the freedom to work on my own terms.",
    location: "Sector 123, Noida, Uttar Pradesh",
  },
  {
    image: "/images/customer/become/vendor-testimonial-1.jpg",
    quote:
      "After joining Eventory, I truly felt a sense of liberation I hadn't experienced in seven years. Now, I have the freedom to work on my own terms.",
    location: "Sector 123, Noida, Uttar Pradesh",
  },
  {
    image: "/images/customer/become/vendor-testimonial-1.jpg",
    quote:
      "After joining Eventory, I truly felt a sense of liberation I hadn't experienced in seven years. Now, I have the freedom to work on my own terms.",
    location: "Sector 123, Noida, Uttar Pradesh",
  },
];

const SCROLL_AMOUNT = 672;

export default function VendorTestimonialsSection() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    scrollRef.current?.scrollBy({
      left: direction === "left" ? -SCROLL_AMOUNT : SCROLL_AMOUNT,
      behavior: "smooth",
    });
  };

  return (
    <section className="w-full bg-[#FFF8EB] px-4 pt-12 pb-16 sm:px-6 lg:px-16">
      <div className="mx-auto flex max-w-[1312px] items-start justify-between gap-4">
        <div>
          <p className="font-figtree text-[13px] leading-[18px] font-semibold tracking-[0.05em] text-[#EA1D3B] uppercase">
            What changes after joining Eventory
          </p>
          <h2 className="mt-2 font-figtree text-[36px] leading-[44px] font-bold tracking-[-0.72px] text-[#030303]">
            Hear from our Eventory Vendors
          </h2>
        </div>

        <div className="hidden shrink-0 items-center gap-3 sm:flex">
          <button
            type="button"
            aria-label="Scroll left"
            onClick={() => scroll("left")}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 text-brand-950 transition hover:bg-black/5"
          >
            <ArrowLeft size={18} />
          </button>
          <button
            type="button"
            aria-label="Scroll right"
            onClick={() => scroll("right")}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 text-brand-950 transition hover:bg-black/5"
          >
            <ArrowRight size={18} />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="mx-auto mt-10 flex max-w-[1312px] gap-8 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {TESTIMONIALS.map((testimonial, i) => (
          <div
            key={i}
            className="h-[456px] w-[85vw] shrink-0 snap-start overflow-hidden rounded-[24px] border border-[#F4E0BE] bg-white sm:w-[500px] lg:w-[640px]"
          >
            <div className="relative h-[320px] w-full overflow-hidden">
              <img src={testimonial.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
              <button
                type="button"
                aria-label="Play video"
                className="absolute top-1/2 left-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-md transition hover:scale-105"
              >
                <Play className="h-5 w-5 fill-current text-brand-950" />
              </button>
            </div>

            <div className="p-4">
              <div className="flex items-start gap-3 rounded-[20px] bg-[#FFF8EB] p-4">
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-white">
                  <img src={testimonial.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-figtree text-[14px] leading-[20px] font-normal text-[#3F3F47]">
                    &ldquo;{testimonial.quote}
                  </p>
                  <p className="mt-1 font-figtree text-[14px] leading-[20px] font-medium text-[#030303]">
                    {testimonial.location}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
