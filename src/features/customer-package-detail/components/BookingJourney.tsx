"use client";

import { useState } from "react";
import { OPEN_HELP_EVENT } from "@/features/customer-help/helpContext";

// "How Eventory handles your booking" (Figma nodes 3642:96840, phases
// 3642:95816 / 95837 / 95859 / 95881 / 95903): a five-step rail over a stacked
// deck of phase cards. All five cards are mounted in one grid cell and
// cross-fade + slide, so moving between phases (arrows or rail) animates and the
// section never changes height.
const IMG_DIR = "/images/customer/package-detail/journey";

const PHASES = [
  {
    label: "Choose",
    summary: "Find the right package and share anything extra you need.",
    image: `${IMG_DIR}/phase-1.png`,
    imageSize: 182,
    gradient: "linear-gradient(147deg, #fff 2%, #FEF5F7 99.8%)",
    milestones: [
      {
        title: "Explore and shortlist",
        body: "You browse packages, compare options and shortlist the one that suits your event.",
      },
      {
        title: "Customisation requests",
        body: "Want changes? You share extra requirements and your vendor accepts or declines each one. Then you accept the proposal or ask again.",
      },
    ],
  },
  {
    label: "Confirm",
    summary: "Your final price and details, then your booking is locked in.",
    image: `${IMG_DIR}/phase-2.png`,
    imageSize: 177,
    gradient: "linear-gradient(133deg, #fff 4.9%, #FEF5F7 102.5%)",
    milestones: [
      {
        title: "Finalise your package",
        body: "Your vendor updates the price and sends your final booking details and payment timeline.",
      },
      {
        title: "Booking confirmation",
        body: "You pay the advance and get a confirmation call. Eventory shows your booking status live.",
      },
    ],
  },
  {
    label: "Prepare & arrive",
    summary: "Your vendor gets ready, then arrives at your setup slot.",
    image: `${IMG_DIR}/phase-3.png`,
    imageSize: 177,
    gradient: "linear-gradient(133deg, #fff 4.9%, #FEF5F7 102.5%)",
    milestones: [
      {
        title: "Pre-event preparation",
        body: "Your vendor prepares materials and finalises the setup, including any venue visits, trials or moodboards.",
      },
      {
        title: "Event day and venue visit",
        body: "Your vendor arrives at your setup slot and goes over the final requirements with you before starting.",
      },
    ],
  },
  {
    label: "Approve & pay",
    summary: "You approve the setup. Eventory holds payment until handover.",
    image: `${IMG_DIR}/phase-4.png`,
    imageSize: 177,
    gradient: "linear-gradient(133deg, #fff 4.9%, #FEF5F7 102.5%)",
    milestones: [
      {
        title: "Setup and final approval",
        body: "You review the finished setup and confirm the handover. Eventory’s admin then gives final approval.",
      },
      {
        title: "Remaining payment and secure handling",
        body: "You pay the rest on your payment timeline. Eventory holds that payment securely until handover.",
      },
    ],
  },
  {
    label: "Wrap up",
    summary: "Teardown, then your feedback closes the booking.",
    image: `${IMG_DIR}/phase-5.png`,
    imageSize: 196,
    gradient: "linear-gradient(133deg, #fff 4.9%, #FEF5F7 102.5%)",
    milestones: [
      {
        title: "Dismantling",
        body: "Your vendor dismantles the setup: the same night for daytime events, the next morning for evening events.",
      },
      {
        title: "Feedback and booking closure",
        body: "You share feedback on the setup and your booking experience, and your booking is complete.",
      },
    ],
  },
];

const LAST = PHASES.length - 1;

function NavButton({
  direction,
  disabled,
  onClick,
}: {
  direction: "prev" | "next";
  disabled: boolean;
  onClick: () => void;
}) {
  // The exported left arrow is the muted grey one and the right arrow is the
  // dark one, so each state flips whichever asset carries the right colour.
  const dark = !disabled;
  const src = `${IMG_DIR}/${dark ? "arrow-right" : "arrow-left"}.svg`;
  const flip = (direction === "prev") === dark;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={direction === "prev" ? "Previous phase" : "Next phase"}
      className={`flex size-8 shrink-0 items-center justify-center rounded-full border transition-colors ${
        disabled
          ? "cursor-not-allowed border-[#D4D4D8] bg-[#E4E4E7]"
          : "border-[#71717B] bg-transparent hover:bg-black/5"
      }`}
    >
      <img src={src} alt="" className={`h-4 w-4 ${flip ? "rotate-180" : ""}`} />
    </button>
  );
}

export default function BookingJourney() {
  const [active, setActive] = useState(0);

  const go = (index: number) => setActive(Math.min(LAST, Math.max(0, index)));

  return (
    <section id="booking-journey" className="border-t border-black/5 pt-8">
      <div className="flex flex-col gap-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="h-6 w-[5px] shrink-0 rounded-sm bg-[#F0596F]" />
            <div className="flex flex-col">
              <h2 className="font-figtree text-[20px] leading-7 font-medium text-[#030303]">
                How Eventory handles your booking
              </h2>
              <p className="font-figtree text-[14px] leading-5 text-[#3F3F47]">
                5 phases, and who does what at each milestone.
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className="font-figtree text-[14px] leading-5 text-[#71717B]" aria-live="polite">
              {active + 1} / {PHASES.length}
            </span>
            <NavButton direction="prev" disabled={active === 0} onClick={() => go(active - 1)} />
            <NavButton direction="next" disabled={active === LAST} onClick={() => go(active + 1)} />
          </div>
        </div>

        {/* Journey rail — items are evenly spaced, so a node's centre sits at 10% / 30% / … of the width. */}
        <div className="relative flex items-start">
          <div className="absolute top-[22px] right-[10%] left-[10%] h-0.5 bg-[#E4E4E7]" />
          <div
            className="absolute top-[22px] left-[10%] h-0.5 bg-[#F0596F] transition-[width] duration-500 ease-out"
            style={{ width: `${(active / LAST) * 80}%` }}
          />
          {PHASES.map((phase, index) => {
            const isActive = index === active;
            const isDone = index < active;
            return (
              <button
                key={phase.label}
                type="button"
                onClick={() => go(index)}
                aria-current={isActive ? "step" : undefined}
                className="relative flex min-w-0 flex-1 flex-col items-center gap-2 pt-2"
              >
                <span
                  className={`flex size-7 items-center justify-center rounded-full border font-figtree text-[14px] leading-5 font-medium transition-colors duration-300 ${
                    isActive
                      ? "border-[#F0596F] bg-[#F0596F] text-[#FAFAFA]"
                      : isDone
                        ? "border-[#FEF5F7] bg-[#FEF5F7] text-[#F0596F]"
                        : "border-[#D4D4D8] bg-white text-[#71717B]"
                  }`}
                >
                  {index + 1}
                </span>
                <span
                  className={`max-w-full px-1 text-center font-figtree text-[14px] leading-5 font-medium transition-colors duration-300 max-sm:text-[12px] ${
                    isActive ? "text-[#030303]" : isDone ? "text-[#3F3F47]" : "text-[#71717B]"
                  } ${isActive ? "" : "max-sm:hidden"}`}
                >
                  {phase.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Stacked deck: two peeking cards behind, and every phase card in one grid cell. */}
        <div className="relative pr-0 sm:pr-[80px]">
          <div className="absolute top-[17px] right-0 bottom-[17px] left-[172px] hidden rounded-3xl border border-[#E4E4E7] bg-[#F4F4F5] sm:block" />
          <div className="absolute top-[9px] right-[40px] bottom-[8px] left-[86px] hidden rounded-3xl border border-[#E4E4E7] bg-[#FAFAFA] sm:block" />

          <div className="relative grid">
            {PHASES.map((phase, index) => {
              const isActive = index === active;
              const offset = index < active ? "-translate-x-6" : "translate-x-6";
              return (
                <div
                  key={phase.label}
                  aria-hidden={!isActive}
                  inert={!isActive}
                  className={`col-start-1 row-start-1 flex min-h-[282px] gap-0 rounded-3xl border border-[#E4E4E7] bg-white p-3 transition-all duration-500 ease-out ${
                    isActive ? "translate-x-0 opacity-100" : `pointer-events-none opacity-0 ${offset}`
                  }`}
                >
                  <div className="flex min-w-0 flex-1 flex-col gap-6 px-3 py-3 sm:pr-6">
                    <div className="flex flex-col gap-1">
                      <h3 className="font-figtree text-[20px] leading-7 font-medium text-[#030303]">{phase.label}</h3>
                      <p className="font-figtree text-[14px] leading-5 text-[#3F3F47]">{phase.summary}</p>
                    </div>
                    <div className="flex flex-col">
                      {phase.milestones.map((milestone, i) => (
                        <div key={milestone.title} className="flex items-start gap-2.5">
                          <div className="flex w-5 shrink-0 flex-col items-center gap-1.5 self-stretch pt-1.5">
                            <img src={`${IMG_DIR}/marker.svg`} alt="" className="h-3 w-3 shrink-0" />
                            {i < phase.milestones.length - 1 && <span className="min-h-px w-0.5 flex-1 bg-[#E4E4E7]" />}
                          </div>
                          <div className={`flex min-w-0 flex-1 flex-col gap-0.5 ${i < phase.milestones.length - 1 ? "pb-6" : ""}`}>
                            <p className="font-figtree text-[16px] leading-6 font-medium text-[#030303]">{milestone.title}</p>
                            <p className="font-figtree text-[14px] leading-5 text-[#3F3F47]">{milestone.body}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div
                    className="hidden w-[176px] shrink-0 items-center justify-center self-stretch overflow-hidden rounded-xl border border-[#E4E4E7] sm:flex"
                    style={{ backgroundImage: phase.gradient }}
                  >
                    <img
                      src={phase.image}
                      alt=""
                      width={phase.imageSize}
                      height={phase.imageSize}
                      className="max-w-none object-cover"
                      style={{ width: phase.imageSize, height: phase.imageSize }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-2 font-figtree text-[14px] leading-5">
          <span className="text-[#3F3F47]">Questions before you book?</span>
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event(OPEN_HELP_EVENT))}
            className="rounded-lg text-[#030303] transition-colors hover:text-[#F0596F]"
          >
            Chat with us
          </button>
        </div>
      </div>
    </section>
  );
}
