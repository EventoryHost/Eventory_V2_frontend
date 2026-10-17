"use client";

import { useState } from "react";
import Image from "next/image";

// Figma: https://www.figma.com/design/fKzA9Z3TJHMEL93WM31azx/Customer-Side---Final-Dev
// node-id=2438-23256 / 23303 / 23350 / 23397 — the four states of this
// section, one per selected step. Clicking a number swaps which step is
// "current": the connecting line's pink fill extends to it, that number
// (and every one before it) turns solid pink, and the illustration on the
// right crossfades to that step's own image. Verified against all four
// Figma states that the step text itself does NOT restyle by active state
// (same white row background, same per-position font size in every one of
// the four snapshots — steps 1-2 always render smaller than 3-4,
// regardless of which step is selected) — only the line/dots/illustration
// change.

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
 * the NEXT one (matching the measured fill heights across all four Figma
 * states: e.g. step 1's fill reaches ~54% of the way to step 2's dot, step
 * 2's reaches ~51% of the way to step 3's, and so on), so the line reads
 * as "flowing toward" the next step rather than stopping dead at the
 * current one. The last step fills the line completely.
 */
function fillPercent(activeIndex: number, total: number) {
  if (activeIndex >= total - 1) return 100;
  return ((activeIndex + 0.5) / (total - 0.5)) * 100;
}

export default function HowItWorksSection() {
  const [active, setActive] = useState(0);

  return (
    <section className="w-full bg-white px-4 pt-16 pb-20 sm:px-6 lg:px-16">
      <div className="mx-auto flex max-w-[1312px] flex-col gap-10">
        <div className="flex max-w-[672px] flex-col gap-4">
          <p className="font-figtree text-[16px] leading-[18px] font-semibold text-[#EA1D3B] uppercase [text-shadow:0_0_4px_rgba(0,0,0,0.1)]">
            How it works?
          </p>
          <h2 className="font-figtree text-[28px] leading-[1.1] font-bold tracking-[-0.5px] text-[#030303] sm:text-[36px]">
            Join Eventory in 4 simple steps and start growing your business today
          </h2>
        </div>

        <div className="flex flex-col gap-10 lg:flex-row lg:items-start">
          <div className="flex gap-6">
            {/* Line + numbered dots */}
            <div className="relative flex w-[34px] shrink-0 flex-col items-center">
              <div className="absolute top-0 left-1/2 h-full w-2 -translate-x-1/2 rounded-full bg-[#FDEEF0]" />
              <div
                className="absolute top-0 left-1/2 w-2 -translate-x-1/2 rounded-full bg-[#F0596F] transition-[height] duration-500 ease-out"
                style={{ height: `${fillPercent(active, STEPS.length)}%` }}
              />
              <div className="relative z-10 flex flex-col gap-12">
                {STEPS.map((step, i) => (
                  <button
                    key={step.title}
                    type="button"
                    onClick={() => setActive(i)}
                    aria-label={`Show step ${i + 1}: ${step.title}`}
                    aria-current={i === active}
                    className={`flex size-[34px] shrink-0 items-center justify-center rounded-full font-figtree text-[16px] transition-colors duration-300 ${
                      i <= active ? "bg-[#F0596F] text-white" : "bg-[#FCDEE2] text-[#F0596F]"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </div>

            {/* Step text — font size is fixed per position (1-2 smaller,
                3-4 larger), matching every one of the four Figma states;
                not derived from active/inactive. */}
            <div className="flex max-w-[499px] flex-col gap-12">
              {STEPS.map((step, i) => (
                <button
                  key={step.title}
                  type="button"
                  onClick={() => setActive(i)}
                  className="flex flex-col items-start gap-1 text-left"
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
              ))}
            </div>
          </div>

          {/* Illustration — all four stacked, crossfading via opacity so
              switching steps is a smooth transition rather than a hard cut. */}
          <div className="relative h-[280px] w-full overflow-hidden rounded-[24px] sm:h-[360px] lg:h-[503px] lg:flex-1">
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
    </section>
  );
}
