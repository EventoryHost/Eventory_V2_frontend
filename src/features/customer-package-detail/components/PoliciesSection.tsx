"use client";

import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import type { PolicyItem } from "../types";
import SectionHeading from "./SectionHeading";
import CancellationPolicyDialog from "./CancellationPolicyDialog";

// Platform-wide cancellation copy from Figma node 3233:26627. The vendor's
// own policy entries (data.policies) are still listed under the card.
const STAGES = [
  { title: "Early", text: "Most of what you paid comes back." },
  { title: "Closer to the event", text: "Part of the payment is kept." },
  { title: "Setup started", text: "Charges can be the full value of the items involved." },
];

export default function PoliciesSection({
  policies,
  eventDateIso,
  vendorPolicyText,
}: {
  policies: PolicyItem[];
  /** The customer's chosen event date, if any — the "How charges work" dialog shows exact cut-off dates for it. */
  eventDateIso: string | null;
  vendorPolicyText?: string;
}) {
  const [isChargesOpen, setIsChargesOpen] = useState(false);

  return (
    <section id="policies" className="border-t border-black/5 pt-8">
      <SectionHeading>Policies</SectionHeading>

      <div className="flex flex-col gap-5 rounded-2xl border border-[#E4E4E7] p-6">
        <p className="font-figtree text-[16px] leading-6 font-semibold text-[#030303]">Cancel early and keep more back</p>

        <div className="flex flex-col gap-6 md:flex-row md:gap-8">
          <div className="flex min-w-0 flex-1 flex-col">
            {STAGES.map((stage, index) => {
              const isLast = index === STAGES.length - 1;
              return (
                <div key={stage.title} className="flex items-start gap-3">
                  <div className="flex flex-col items-center gap-1 self-stretch pt-[5px]">
                    <img src="/images/customer/package-detail/policy-dot.svg" alt="" className="h-[10px] w-[10px] shrink-0" />
                    {!isLast && <span className="min-h-px w-[2px] flex-1 bg-[#E4E4E7]" />}
                  </div>
                  <div className={`flex min-w-0 flex-1 flex-col gap-0.5 font-figtree text-[14px] leading-5 ${isLast ? "" : "pb-4"}`}>
                    <p className="font-semibold text-[#030303]">{stage.title}</p>
                    <p className="text-[#3F3F47]">{stage.text}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex shrink-0 flex-col gap-3 self-start rounded-xl bg-[#F4F4F5] p-4 md:w-[300px]">
            <p className="font-figtree text-[14px] leading-5 font-semibold text-[#030303]">By item type</p>
            <div className="flex gap-1">
              <span className="h-[6px] flex-1 rounded-[3px] bg-[#030303] opacity-20" />
              <span className="h-[6px] flex-1 rounded-[3px] bg-[#030303] opacity-50" />
              <span className="h-[6px] flex-1 rounded-[3px] bg-[#030303]" />
            </div>
            <div className="flex justify-between font-figtree text-[14px] leading-5 font-medium text-[#3F3F47]">
              <span>Reusable</span>
              <span>Custom</span>
            </div>
            <p className="font-figtree text-[14px] leading-5 text-[#030303]">
              Reusable items cost least to cancel. Custom items cost most.
            </p>
          </div>
        </div>

        <hr className="border-[#E4E4E7]" />

        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <div className="flex items-center gap-2">
            <img src="/images/customer/package-detail/policy-shield-check.svg" alt="" className="h-5 w-5 shrink-0" />
            <p className="font-figtree text-[14px] leading-5 text-[#030303]">
              Your payment is held safely by Eventory until the event is delivered.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsChargesOpen(true)}
            className="flex shrink-0 items-center gap-1 font-figtree text-[14px] leading-5 font-semibold text-[#030303] underline"
          >
            How charges work
            <img src="/images/customer/package-detail/policy-arrow-right.svg" alt="" className="h-4 w-4" />
          </button>
        </div>
      </div>

      {policies.length > 0 && (
        <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {policies.map((policy) => (
            <div key={policy.id}>
              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-black/15 text-success-700">
                <ShieldCheck className="h-4 w-4" />
              </span>
              <div className="mt-3 flex items-center gap-2">
                <h3 className="font-figtree text-[15px] font-bold text-brand-950">{policy.title}</h3>
                {policy.tag && (
                  <span className="rounded-full bg-success-subtle px-2 py-0.5 font-figtree text-[10px] font-semibold text-success-700">
                    {policy.tag}
                  </span>
                )}
              </div>
              <p className="mt-1 font-figtree text-[13px] text-neutral-secondary">{policy.description}</p>
              <a
                href={policy.href}
                className="mt-1 inline-block font-figtree text-[13px] font-semibold text-brand-950 underline"
              >
                Learn more
              </a>
            </div>
          ))}
        </div>
      )}

      <CancellationPolicyDialog
        isOpen={isChargesOpen}
        onClose={() => setIsChargesOpen(false)}
        eventDateIso={eventDateIso}
        vendorPolicyText={vendorPolicyText}
      />
    </section>
  );
}
