"use client";

import { useEffect, useRef, useState } from "react";

// Figma: https://www.figma.com/design/fKzA9Z3TJHMEL93WM31azx/Customer-Side---Final-Dev?node-id=2438-22170
// (header) through node-id=2438-22229 (last story dot) — the alternating
// timeline below the hero. Scroll-driven line/dot behaviour added on top
// (PM spec, 2026-10-14, revised 2026-10-15 three times): the line's
// highlighted #F0596F part is a FIXED-length segment (274px of the line's
// 2176px total in Figma, not a fill that grows from the top) that slides
// down the track as the page scrolls. A node is #F0596F ONLY while that
// sliding segment is currently overlapping it — not cumulative — so it
// reverts to #FDEEF0 the moment the segment moves past, same as one it
// hasn't reached yet. On load the segment already sits at the first node's
// position, so that one starts lit.

// The highlighted segment on the center line is a fixed length — 274px
// tall out of the line's 2176px total in Figma — that SLIDES down the
// track as you scroll, rather than a fill that grows from the top.
const SEGMENT_FRACTION = 274 / 2176;

type Step = {
  tag: string;
  title: string;
  description: string;
  image: string;
  /** Which side the illustration sits on at desktop width — alternates every step (1,3,5 image-left/text-right; 2,4,6 text-left/image-right), matching the Figma layout exactly rather than a fixed pattern guessed from scratch. */
  imageSide: "left" | "right";
};

const STEPS: Step[] = [
  {
    tag: "2024 — THE IDEA",
    title: "It Started With a Frustration",
    description:
      "Event planning felt far more complicated than it should. Finding vendors meant jumping between Instagram, Google, referrals and WhatsApp. Prices were unclear, comparison was difficult, and coordinating everything became a job of its own. That frustration became the starting point for Eventory",
    image: "/images/customer/about-us-story-1.png",
    imageSide: "left",
  },
  {
    tag: "02 — 2024, THE FIRST STEP",
    title: "Listening Before Building",
    description:
      "Before building the solution, we started by understanding how the industry actually worked. Conversations with vendors and customers helped us understand pricing, quotations, negotiation, discovery and what creates trust before a booking",
    image: "/images/customer/about-us-story-2.png",
    imageSide: "right",
  },
  {
    tag: "03 — 2025, BUILDING THE SYSTEM",
    title: "Turning Learnings Into a Real Product",
    description:
      "In 2025, product, technology, sales, vendor onboarding and operations started coming together. What began as an idea was becoming a real system, shaped by what we were seeing and learning from the market.",
    image: "/images/customer/about-us-story-3.png",
    imageSide: "left",
  },
  {
    tag: "04 — EVENTORY V1",
    title: "Our First Real Journey",
    description:
      "V1 connected customers and vendors through discovery, quotations, conversations and booking. But it also taught us something important: discovery alone wasn't enough. Event services change with requirements, pricing, customisation, timing and add-ons — so the service itself needed to become structured.",
    image: "/images/customer/about-us-story-4.png",
    imageSide: "right",
  },
  {
    tag: "05 — 2026, BUILDING V2",
    title: "From Marketplace to Event Commerce",
    description:
      "V2 is being built around everything we learned from V1. Services are becoming structured products with packages, add-ons, pricing, availability and customisation — while conversations can turn into requirements, quotations and a smoother path to checkout.",
    image: "/images/customer/about-us-story-5.png",
    imageSide: "left",
  },
  {
    tag: "06 — TODAY & WHAT'S NEXT",
    title: "Building the Complete Event Journey",
    description:
      "Today, V1 is live, our vendor network is growing and V2 is being built. The next step is bigger: creating a place where someone can arrive with an event in mind and move through discovery, planning, customisation, quotations, payments, booking and eventually execution — all in one journey.",
    // Same illustration as step 5 — the Figma file itself reuses this one
    // asset for both steps (confirmed: both exports are byte-identical),
    // not a fetch mistake on this end.
    image: "/images/customer/about-us-story-5.png",
    imageSide: "right",
  },
];

function StepText({ step, active }: { step: Step; active: boolean }) {
  return (
    <div
      className={`flex flex-col items-start gap-3 transition-transform duration-300 ${active ? "lg:scale-[1.06]" : "lg:scale-100"}`}
    >
      <p className="font-figtree text-[16px] leading-[18px] font-semibold tracking-[-0.02em] text-[#EA1D3B] uppercase">
        {step.tag}
      </p>
      <h3 className="font-figtree text-[24px] leading-[32px] font-semibold text-[#3C060D] sm:text-[28px] sm:leading-[36px]">
        {step.title}
      </h3>
      <p className="font-figtree text-[16px] leading-[1.5] font-medium tracking-[-0.16px] text-[#3F3F47]">
        {step.description}
      </p>
    </div>
  );
}

function StepImage({ step, active }: { step: Step; active: boolean }) {
  return (
    <img
      src={step.image}
      alt=""
      className={`aspect-[394/266] w-full max-w-[394px] rounded-[20px] object-cover transition-transform duration-300 ${active ? "lg:scale-[1.06]" : "lg:scale-100"}`}
    />
  );
}

/**
 * The timeline node — a 40x40 thick ring with a small white hole in the
 * middle (node 2438:22214's own SVG: a white-filled r=13.33 circle with a
 * same-color stroke band 13.33px wide — stroke paints centered on the
 * path, so the final visible shape is a white center of radius ~6.67
 * surrounded by a solid color band out to the full 20px radius, NOT the
 * thinner/bigger-holed ring a plain stroked circle would give). var(--brand-50,
 * #FDEEF0) by default, #F0596F once scroll has reached it — same ring
 * either way, only the fill/stroke color swaps.
 */
function TimelineDot({ active }: { active: boolean }) {
  const color = active ? "#F0596F" : "#FDEEF0";
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <circle
        cx="20"
        cy="20"
        r="13.3333"
        fill="white"
        stroke={color}
        strokeWidth="13.3333"
        className="transition-[stroke] duration-300"
      />
    </svg>
  );
}

export default function OurStorySection() {
  const trackRef = useRef<HTMLDivElement>(null);
  const dotRefs = useRef<(HTMLDivElement | null)[]>([]);
  // 0..1 — how far down the track the scroll position has reached; drives
  // the sliding segment's position.
  const [progress, setProgress] = useState(0);
  // NOT cumulative — only the dot(s) the sliding segment is CURRENTLY
  // overlapping are lit. Scroll past a node and it goes back to #FDEEF0,
  // same as one never reached — only "touching right now" counts.
  const [touchedIndex, setTouchedIndex] = useState<number | null>(null);

  useEffect(() => {
    let frame: number | null = null;

    function measure() {
      frame = null;
      const track = trackRef.current;
      if (!track) return;
      const rect = track.getBoundingClientRect();
      // Fraction of the track's own height that's above the viewport's
      // vertical center — 0 before the track reaches center, 1 once its
      // bottom has scrolled past center. This is what makes the highlighted
      // part of the line move continuously with scroll instead of jumping.
      const raw = (window.innerHeight / 2 - rect.top) / rect.height;
      const clamped = Math.min(1, Math.max(0, raw));
      setProgress(clamped);

      // Same clamped-top formula the segment itself renders with (kept in
      // sync below) — a node counts as "touched" only while the sliding
      // segment's own span actually covers its position.
      const segmentTop = Math.min(Math.max(clamped - SEGMENT_FRACTION / 2, 0), 1 - SEGMENT_FRACTION);
      const segmentBottom = segmentTop + SEGMENT_FRACTION;

      // getBoundingClientRect, not offsetTop — each dot's offsetParent is
      // its own row (position: relative), not the track, so offsetTop was
      // only ever the dot's position within its own tiny row (a few dozen
      // px), never its real cumulative position down the ~2000px track.
      // Comparing viewport rects sidesteps the offsetParent chain entirely.
      let newTouched: number | null = null;
      dotRefs.current.forEach((dot, i) => {
        if (!dot) return;
        const dotRect = dot.getBoundingClientRect();
        const dotFraction = (dotRect.top + dotRect.height / 2 - rect.top) / rect.height;
        if (dotFraction >= segmentTop && dotFraction <= segmentBottom) newTouched = i;
      });
      setTouchedIndex(newTouched);
    }

    function onScroll() {
      if (frame != null) return;
      frame = requestAnimationFrame(measure);
    }

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame != null) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section className="w-full bg-white px-4 py-16 sm:px-6 lg:px-16">
      <div className="mx-auto flex max-w-[572px] flex-col items-center gap-2 text-center">
        <p className="font-figtree text-[16px] leading-[24px] font-semibold text-[#EA1D3B] uppercase [text-shadow:0_0_4px_rgba(0,0,0,0.1)]">
          Our Story
        </p>
        <h2 className="font-figtree text-[32px] leading-[40px] font-semibold tracking-[-0.5px] text-[#030303] sm:text-[36px]">
          How Eventory Came to Be
        </h2>
      </div>

      <div ref={trackRef} className="relative mx-auto mt-16 max-w-[1245px]">
        {/* Center timeline — desktop/tablet only; mobile just stacks the
            steps with no line (nothing to align it against in one column). */}
        <div className="absolute top-0 left-1/2 hidden h-full w-[8px] -translate-x-1/2 rounded-full bg-[#FDEEF0] lg:block">
          <div
            className="absolute inset-x-0 rounded-full bg-[#F0596F] transition-[top] duration-150 ease-linear"
            style={{
              height: `${SEGMENT_FRACTION * 100}%`,
              // Centered on the current scroll position, clamped so it
              // never slides above the top or below the bottom of the
              // track.
              top: `${
                Math.min(Math.max(progress - SEGMENT_FRACTION / 2, 0), 1 - SEGMENT_FRACTION) * 100
              }%`,
            }}
          />
        </div>

        <div className="flex flex-col gap-16 lg:gap-24">
          {STEPS.map((step, i) => {
            // Only the ONE node the sliding segment currently overlaps is
            // lit (and scaled up) — not cumulative. Scroll past it and it
            // reverts to #FDEEF0 / normal scale, same as never reached.
            const isCurrent = i === touchedIndex;
            return (
              <div
                key={step.tag}
                className="relative grid grid-cols-1 items-center gap-6 lg:grid-cols-2 lg:gap-16"
              >
                <div
                  ref={(el) => {
                    dotRefs.current[i] = el;
                  }}
                  className="absolute top-1/2 left-1/2 z-10 hidden -translate-x-1/2 -translate-y-1/2 lg:block"
                >
                  <TimelineDot active={isCurrent} />
                </div>

                {step.imageSide === "left" ? (
                  <>
                    <div className="flex justify-center lg:justify-end lg:pr-8">
                      <StepImage step={step} active={isCurrent} />
                    </div>
                    <div className="lg:pl-8">
                      <StepText step={step} active={isCurrent} />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="lg:order-1 lg:pr-8">
                      <StepText step={step} active={isCurrent} />
                    </div>
                    <div className="flex justify-center lg:order-2 lg:justify-start lg:pl-8">
                      <StepImage step={step} active={isCurrent} />
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
