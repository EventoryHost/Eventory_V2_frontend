import type { LucideIcon } from "lucide-react";
import { Sparkles, MessageCircleMore, ShieldCheck } from "lucide-react";

type Step = {
  icon: LucideIcon;
  lead: string;
  rest: string;
};

const STEPS: Step[] = [
  {
    icon: Sparkles,
    lead: "Your vendors confirm within 24 hours.",
    rest: " Two are already confirmed. LensKraft will accept shortly — we'll notify you the moment they do.",
  },
  {
    icon: MessageCircleMore,
    lead: "Plan the details in chat.",
    rest: " Once confirmed, you can message each vendor directly to finalise all package related things, timings, and specifics.",
  },
  {
    icon: ShieldCheck,
    lead: "We hold your money safely.",
    rest: " Vendors are paid only as your event approaches — if something goes wrong, you're protected.",
  },
];

export default function WhatHappensNextCard() {
  return (
    <div className="flex w-full flex-col rounded-[16px] border border-[#E4E4E7] bg-white p-4 sm:p-6">
      <h2 className="font-figtree text-[18px] font-semibold text-[#09090B] sm:text-[20px]">What happens next</h2>

      <div className="flex flex-col divide-y divide-[#F4F4F5]">
        {STEPS.map((step) => {
          const Icon = step.icon;
          return (
            <div key={step.lead} className="flex items-start gap-4 py-4 first:pt-6">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#EFF6FF]">
                <Icon size={20} className="text-[#2563EB]" />
              </span>
              <p className="font-figtree text-[15px] leading-[22.5px] text-[#09090B]">
                <span className="font-semibold">{step.lead}</span>
                {step.rest}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
