"use client";

import { useState } from "react";
import Image from "next/image";

export type RequestAttribute = {
  label: string;
  oldValue?: string;
  newValue: string;
};

export type SetupRequest =
  | { status: "change" | "adding"; attributes: RequestAttribute[] }
  | { status: "removal"; label: string };

export type SetupItem = {
  name: string;
  quantity: number;
  subtitle: string;
  requests: SetupRequest[];
};

export type SetupArticleDetail = {
  label: string;
  value: string;
  /** Count of additional values beyond `value` — same "+N more" convention as PDP's What's Included section (IncludedItems.tsx). Only set when the underlying field is a real array/comma-list with more than one entry. */
  moreCount?: number;
  /** The full list `value`/`moreCount` were derived from — what "+N more" expands to reveal. */
  allValues?: string[];
};

export type SetupArticleCardProps = {
  image: string;
  title: string;
  price: string;
  details: SetupArticleDetail[];
  items: SetupItem[];
};

export default function SetupArticleCard({
  image,
  title,
  price,
  details,
  items,
}: SetupArticleCardProps) {
  // Keyed by detail label — which "+N more" rows are currently expanded to
  // show every value instead of just the first + a count. Same convention
  // as PDP's What's Included section (IncludedItems.tsx).
  const [expandedLabels, setExpandedLabels] = useState<Set<string>>(new Set());

  function toggleExpanded(label: string) {
    setExpandedLabels((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  }

  return (
    <div className="flex w-full max-w-[586px] flex-col gap-4 rounded-[24px] border border-[#E4E4E7] p-5">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative h-[180px] w-full shrink-0 overflow-hidden rounded-[16px] sm:h-[134px] sm:w-[179px]">
          <Image src={image} alt={title} fill className="object-cover" />
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex flex-wrap items-start justify-between gap-x-2 gap-y-1">
            <span className="font-figtree text-[16px] font-semibold leading-[24px] tracking-[-0.24px] text-[#030303]">
              {title}
            </span>
            <span className="shrink-0 font-figtree text-[14px] font-semibold leading-[20px] text-[#030303]">
              {price}
            </span>
          </div>

          {details.map((detail) => {
            const isExpanded = expandedLabels.has(detail.label);
            return (
              <p key={detail.label} className="font-figtree text-[14px] font-normal leading-[24px]">
                <span className="text-[#71717B]">{detail.label}: </span>
                <span className="text-[#3F3F47]">
                  {isExpanded && detail.allValues ? detail.allValues.join(", ") : detail.value}
                  {detail.moreCount ? (
                    <>
                      {!isExpanded && ", "}
                      <button type="button" onClick={() => toggleExpanded(detail.label)} className="underline">
                        {isExpanded ? "Show less" : `+${detail.moreCount} more`}
                      </button>
                    </>
                  ) : null}
                </span>
              </p>
            );
          })}
        </div>
      </div>

      <div className="h-px w-full bg-[#E4E4E7]" />

      <div className="flex flex-col gap-4">
        <span className="font-figtree text-[12px] font-medium tracking-[0.03em] text-[#71717B] uppercase">
          Items ({items.length} Item{items.length === 1 ? "" : "s"})
        </span>

        {items.map((item, i) => (
          <div key={i} className="flex flex-col gap-1.5">
            <p className="font-figtree text-[14px] font-semibold leading-[20px] text-[#030303]">
              {item.name} &times;{item.quantity}
            </p>
            <p className="font-figtree text-[14px] font-normal leading-[20px] text-[#3F3F47]">
              {item.subtitle}
            </p>

            {item.requests.length > 0 && (
              // Same "Your requests" treatment as the PDP's Customize Items
              // workshop (YourRequestsPanel.tsx) — amber panel, count badge,
              // per-request white card with a top-right status pill — so a
              // customer who saw these on the PDP recognizes them here.
              <div className="mt-1 flex flex-col gap-2 rounded-[16px] bg-[#FFFBEB] p-4">
                <div className="flex items-center gap-2">
                  <span className="font-figtree text-[13px] font-semibold text-[#3F3F47]">Requests</span>
                  <span className="flex h-[20px] w-[20px] shrink-0 items-center justify-center rounded-full bg-[#BB4D00] font-figtree text-[10px] font-bold text-white">
                    {item.requests.length}
                  </span>
                </div>

                {item.requests.map((request, j) => (
                  <div
                    key={j}
                    className="flex items-start justify-between gap-3 rounded-[16px] bg-white p-4"
                  >
                    {request.status === "removal" ? (
                      <span className="font-figtree text-[13px] font-normal leading-[18px] text-[#71717B] line-through">
                        {request.label}
                      </span>
                    ) : (
                      <div className="flex flex-col gap-1">
                        {request.attributes.map((attribute) => (
                          <p
                            key={attribute.label}
                            className="font-figtree text-[13px] font-normal leading-[18px] text-[#71717B]"
                          >
                            {attribute.label}:{" "}
                            {attribute.oldValue && (
                              <span className="line-through">{attribute.oldValue}</span>
                            )}{" "}
                            <span className="font-semibold text-[#0F172A]">{attribute.newValue}</span>
                          </p>
                        ))}
                      </div>
                    )}

                    <span className="flex h-[22px] shrink-0 items-center justify-center rounded-full bg-[#F4F4F5] px-2 font-figtree text-[12px] font-medium tracking-[0.02em] text-[#3F3F47] uppercase">
                      {request.status === "adding" ? "Adding" : request.status === "removal" ? "Removing" : "Change"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
