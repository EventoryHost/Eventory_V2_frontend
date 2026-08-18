"use client";

import { useState } from "react";
import { ShieldCheck, Plus, Minus } from "lucide-react";
import type { PolicyItem } from "../types";
import SectionHeading from "./SectionHeading";

export default function PoliciesSection({ policies }: { policies: PolicyItem[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [first, ...rest] = policies;

  return (
    <section id="policies" className="border-t border-black/5 pt-8">
      <SectionHeading eyebrow="What you're agreeing to">Policies</SectionHeading>

      <div className="rounded-2xl border border-black/10">
        {first && (
          <div className="flex items-start gap-2 border-b border-black/5 p-4 font-figtree text-[13px] text-neutral-secondary">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-success-700" />
            <p>
              <a href={first.href} className="font-semibold text-brand-950 underline">
                {first.title}
              </a>{" "}
              — {first.description}
            </p>
          </div>
        )}

        {rest.map((policy, i) => {
          const isExpanded = expandedId === policy.id;
          return (
            <div key={policy.id} className={i < rest.length - 1 ? "border-b border-black/5" : ""}>
              <button
                type="button"
                onClick={() => setExpandedId(isExpanded ? null : policy.id)}
                aria-expanded={isExpanded}
                className="flex w-full items-center justify-between gap-3 p-4 text-left"
              >
                <span className="flex items-center gap-2">
                  <span className="font-figtree text-[14px] font-semibold text-brand-950">{policy.title}</span>
                  {policy.tag && (
                    <span className="rounded-full bg-success-subtle px-2 py-0.5 font-figtree text-[10px] font-semibold text-success-700">
                      {policy.tag}
                    </span>
                  )}
                </span>
                {isExpanded ? (
                  <Minus className="h-4 w-4 shrink-0 text-neutral-tertiary" />
                ) : (
                  <Plus className="h-4 w-4 shrink-0 text-neutral-tertiary" />
                )}
              </button>
              {isExpanded && (
                <div className="px-4 pb-4 font-figtree text-[13px] text-neutral-secondary">
                  {policy.description}{" "}
                  <a href={policy.href} className="font-semibold text-brand-950 underline">
                    Learn more
                  </a>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
