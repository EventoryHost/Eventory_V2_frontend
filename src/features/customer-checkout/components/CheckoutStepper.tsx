"use client";

import { usePathname } from "next/navigation";

const STEPS = [
  { label: "Review", href: "/booking-summary" },
  { label: "Details", href: "/contact" },
];

export default function CheckoutStepper() {
  const pathname = usePathname();
  const activeIndex = STEPS.findIndex((step) => step.href === pathname);

  return (
    <div className="flex w-full items-center justify-center overflow-x-auto px-4 py-5 lg:py-8">
      <div className="flex items-center gap-2 lg:gap-4">
        {STEPS.map((step, i) => {
          // Linear flow, not tabs: the current step and every step already
          // passed through get the pink circle/line treatment. The heading
          // itself is only pink for the step being worked on right now —
          // once you move past it, its heading turns dark (done), and steps
          // still ahead stay gray.
          const isDone = i <= activeIndex;
          const isCurrent = i === activeIndex;
          return (
            <div key={step.href} className="flex shrink-0 items-center gap-2 lg:gap-4">
              {i > 0 && (
                <div
                  className={`h-px w-5 shrink-0 lg:w-10 ${
                    isDone ? "bg-[#F0596F]" : "bg-[#E4E4E7]"
                  }`}
                />
              )}

              <div className="flex shrink-0 items-center gap-1.5 lg:gap-2">
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border font-figtree text-[11px] font-semibold leading-[18px] lg:h-6 lg:w-6 lg:text-[12px] ${
                    isDone
                      ? "border-[#F0596F] bg-white text-[#F0596F]"
                      : "border-[#9F9FA9] bg-transparent text-[#71717B]"
                  }`}
                >
                  {i + 1}
                </span>
                <span
                  className={`font-figtree text-[12px] font-semibold whitespace-nowrap lg:text-[14px] lg:leading-[20px] ${
                    isCurrent
                      ? "text-[#F0596F]"
                      : isDone
                        ? "text-[#030303]"
                        : "text-[#71717B]"
                  }`}
                >
                  {step.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
