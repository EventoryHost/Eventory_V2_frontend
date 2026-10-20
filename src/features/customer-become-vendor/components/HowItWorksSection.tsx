"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

// Figma: https://www.figma.com/design/fKzA9Z3TJHMEL93WM31azx/Customer-Side---Final-Dev
// node-id=2438-23256 / 23303 / 23350 / 23397 — the four states of this
// section, one per selected step. The connecting line's pink fill extends
// to the active step, that number (and every one before it) turns solid
// pink, and the illustration on the right crossfades to that step's own
// image. Verified against all four Figma states that the step text itself
// does NOT restyle by active state (same white row background, same
// per-position font size in every one of the four snapshots — steps 1-2
// always render smaller than 3-4, regardless of which step is selected) —
// only the line/dots/illustration change.
//
// Real bug fixed (PM-reported, screenshot): the numbers/line and the step
// text used to live in two SEPARATE flex columns, each spaced with a fixed
// `gap-12` — so as soon as one step's description wrapped to a different
// number of lines than another, the two columns drifted out of sync and a
// number no longer sat level with its own title. Each number and its text
// are now one row (number+line segment, then text, side by side), so they
// align by construction no matter how tall any one description renders.
//
// Scroll behaviour (PM follow-up): "don't let the page scroll past this
// section until step 4 has been reached." The section is given 4 viewport
// heights of scroll room (STEPS.length * 100vh) and its content is pinned
// via `sticky top-0` for that whole distance, so scrolling through it drives
// which step is active (mapped from how far the user has scrolled into that
// pinned distance) instead of just advancing the page — the page can only
// scroll past the section once that distance is used up and step 4 has been
// shown, at which point the sticky pin naturally releases on its own.

const STEPS = [
  {
    title: "Register & Build Profile",
    description: "Create your vendor account in under 5 minutes with basic business details.",
    image: "/images/customer/become/how-it-works-1.png",
  },
  {
    title: "Get Verifies",
    description: "Add your services, pricing, portfolio photos, and availability calendar.",
    image: "/images/customer/become/how-it-works-2.png",
  },
  {
    title: "Create Package",
    description: "Start receiving booking requests from customers looking for your services.",
    image: "/images/customer/become/how-it-works-3.png",
  },
  {
    title: "Get Bookings, Earn More",
    description: "Scale your business with insights, reviews, and our marketing tools.",
    image: "/images/customer/become/how-it-works-4.png",
  },
];

/**
 * How far down the connecting line the pink fill reaches for a given
 * active step — not just up to that step's own dot, but about halfway to
 * the NEXT one, so the line reads as "flowing toward" the next step rather
 * than stopping dead at the current one. The last step fills the line
 * completely.
 */
function fillPercent(activeIndex: number, total: number) {
  if (activeIndex >= total - 1) return 100;
  return ((activeIndex + 0.5) / (total - 0.5)) * 100;
}

export default function HowItWorksSection() {
  const [active, setActive] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onScroll() {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      // Total distance the section stays pinned for — its own height minus
      // one viewport (the sticky child's own height), since that's how much
      // extra scroll room the wrapper has beyond just showing the pinned
      // content once.
      const scrollableDistance = el.offsetHeight - window.innerHeight;
      if (scrollableDistance <= 0) {
        setActive(0);
        return;
      }
      const progress = Math.min(Math.max(-rect.top / scrollableDistance, 0), 1);
      const index = Math.min(STEPS.length - 1, Math.floor(progress * STEPS.length));
      setActive(index);
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative w-full bg-white"
      style={{ height: `${STEPS.length * 100}vh` }}
    >
      <div className="sticky top-0 flex h-screen w-full flex-col justify-center overflow-y-auto px-4 py-12 sm:px-6 lg:px-16">
        <div className="mx-auto flex w-full max-w-[1312px] flex-col gap-10">
          <div className="flex max-w-[672px] flex-col gap-4">
            <p className="font-figtree text-[16px] leading-[18px] font-semibold text-[#EA1D3B] uppercase [text-shadow:0_0_4px_rgba(0,0,0,0.1)]">
              How it works?
            </p>
            <h2 className="font-figtree text-[28px] leading-[1.1] font-bold tracking-[-0.5px] text-[#030303] sm:text-[36px]">
              Join Eventory in 4 simple steps and start growing your business today
            </h2>
          </div>

          <div className="flex flex-col gap-10 lg:flex-row lg:items-start">
            {/* Steps — each row pairs its own number+line segment with its
                own text, so they always align regardless of description
                length. */}
            <div className="relative flex-1">
              {/* Full-height track, positioned once behind every row rather
                  than per-row, so it reads as one continuous line. */}
              <div className="absolute top-[17px] bottom-[17px] left-[17px] w-2 -translate-x-1/2 rounded-full bg-[#FDEEF0]" />
              <div
                className="absolute top-[17px] left-[17px] w-2 -translate-x-1/2 rounded-full bg-[#F0596F] transition-[height] duration-500 ease-out"
                style={{ height: `calc((100% - 34px) * ${fillPercent(active, STEPS.length) / 100})` }}
              />

              {STEPS.map((step, i) => (
                <div key={step.title} className={`relative flex gap-6 ${i < STEPS.length - 1 ? "pb-12" : ""}`}>
                  <button
                    type="button"
                    onClick={() => setActive(i)}
                    aria-label={`Show step ${i + 1}: ${step.title}`}
                    aria-current={i === active}
                    className={`relative z-10 flex size-[34px] shrink-0 items-center justify-center rounded-full font-figtree text-[16px] transition-colors duration-300 ${
                      i <= active ? "bg-[#F0596F] text-white" : "bg-[#FCDEE2] text-[#F0596F]"
                    }`}
                  >
                    {i + 1}
                  </button>

                  <button
                    type="button"
                    onClick={() => setActive(i)}
                    className="flex max-w-[499px] flex-col items-start gap-1 pt-1 text-left"
                  >
                    <h3
                      className={`font-figtree font-semibold text-[#030303] ${
                        i < 2 ? "text-[20px] leading-[28px]" : "text-[24px] leading-[32px]"
                      }`}
                    >
                      {step.title}
                    </h3>
                    <p className="font-figtree text-[16px] leading-[24px] font-normal text-[#3F3F47]">
                      {step.description}
                    </p>
                  </button>
                </div>
              ))}
            </div>

            {/* Illustration — crossfades (via opacity) to match whichever
                step scroll progress currently points to. Already inside the
                pinned block above, so it doesn't need its own sticky
                positioning. */}
            <div className="relative h-[280px] w-full shrink-0 overflow-hidden rounded-[24px] sm:h-[360px] lg:h-[420px] lg:flex-1">
              {STEPS.map((step, i) => (
                <Image
                  key={step.image}
                  src={step.image}
                  alt=""
                  fill
                  className={`object-cover transition-opacity duration-500 ease-out ${
                    i === active ? "opacity-100" : "opacity-0"
                  }`}
                  priority={i === 0}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
