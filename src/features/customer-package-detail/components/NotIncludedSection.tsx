"use client";

import { useState } from "react";
import { XCircle } from "lucide-react";
import SectionHeading from "./SectionHeading";

const COLLAPSED_COUNT = 4;

export default function NotIncludedSection({ items }: { items: string[] }) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? items : items.slice(0, COLLAPSED_COUNT);
  const remaining = items.length - visible.length;

  return (
    <section id="not-included" className="border-t border-black/5 pt-8">
      <SectionHeading eyebrow="Read this before you book">Not included</SectionHeading>

      <div className="rounded-2xl border border-black/10 p-6">
        <div className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
          {visible.map((label) => (
            <div key={label} className="flex items-start gap-2 font-figtree text-[13px] text-neutral-secondary">
              <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
              {label}
            </div>
          ))}
        </div>

        {remaining > 0 && (
          <button
            type="button"
            onClick={() => setShowAll(true)}
            className="mt-4 font-figtree text-[13px] font-semibold text-brand-950 underline"
          >
            See {remaining} more
          </button>
        )}

        <p className="mt-4 font-figtree text-[12px] text-neutral-tertiary">
          The lower items change as you edit the date, size and add-ons.
        </p>
      </div>

      <div className="mt-3 inline-block rounded-full bg-amber-50 px-3 py-1.5 font-figtree text-[12px] font-medium text-amber-800">
        Exclusions carry the same weight as inclusions on Eventory
      </div>
    </section>
  );
}
