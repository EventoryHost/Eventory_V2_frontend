"use client";

import { useState } from "react";
import { TrendingUp, Wallet } from "lucide-react";
import type { BudgetEstimator } from "../types";
import { formatBudgetRange } from "../utils/formatPrice";
import BudgetEstimatorSelect from "./BudgetEstimatorSelect";
import BudgetSuggestionCard from "./BudgetSuggestionCard";

export default function BudgetEstimatorSection({ data }: { data: BudgetEstimator }) {
  const [eventType, setEventType] = useState(data.eventTypeOptions[0]);
  const [guests, setGuests] = useState(data.guestOptions[0]);
  const [location, setLocation] = useState(data.locationOptions[0]);
  const [vendor, setVendor] = useState(data.vendorOptions[0]);
  const [tags, setTags] = useState(data.tags);
  const [activeGroupId, setActiveGroupId] = useState(data.vendorGroups[0]?.categoryId);

  const activeGroup =
    data.vendorGroups.find((group) => group.categoryId === activeGroupId) ?? data.vendorGroups[0];

  return (
    <section className="mx-4 sm:mx-6 lg:mx-8">
      <div className="mb-6 text-center sm:mb-8">
        <h2 className="font-figtree text-[20px] font-bold text-brand-950 sm:text-[28px]">{data.heading}</h2>
        <p className="mt-1 font-figtree text-[13px] font-medium text-neutral-tertiary sm:text-[14px]">
          {data.subheading}
        </p>
      </div>

      <div className="rounded-3xl border border-black/5 bg-white p-4 shadow-[0px_4px_20px_rgba(0,0,0,0.04)] sm:rounded-[32px] sm:p-8">
        <div className="mb-6 grid grid-cols-1 gap-3 sm:mb-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
          <BudgetEstimatorSelect
            label="What event are you planning?"
            options={data.eventTypeOptions}
            value={eventType}
            onChange={setEventType}
          />
          <BudgetEstimatorSelect
            label="How many Guests?"
            options={data.guestOptions}
            value={guests}
            onChange={setGuests}
          />
          <BudgetEstimatorSelect
            label="Location"
            options={data.locationOptions}
            value={location}
            onChange={setLocation}
          />
          <BudgetEstimatorSelect
            label="Vendor"
            options={data.vendorOptions}
            value={vendor}
            onChange={setVendor}
          />
        </div>

        <div className="mb-6 text-center sm:mb-8">
          <button
            type="button"
            onClick={() => setTags([eventType, location])}
            className="rounded-full bg-brand-primary px-8 py-3 font-figtree text-[14px] font-semibold text-white shadow-md transition-colors hover:bg-brand-primary/90"
          >
            Get your Budget
          </button>
        </div>

        <div className="relative mb-6 overflow-hidden rounded-2xl bg-gradient-to-br from-[#f6a3b3] to-brand-primary p-6 sm:mb-8 sm:rounded-[24px] sm:p-8">
          <div className="absolute top-0 right-0 h-full w-2/3 skew-x-12 bg-white/10" />
          <div className="relative z-10 flex items-center justify-between gap-4">
            <div>
              <p className="font-figtree text-[11px] font-semibold tracking-widest text-white/85 uppercase">
                Estimated Budget
              </p>
              <h3 className="mt-2 font-figtree text-[26px] font-bold text-white sm:text-[36px]">
                {formatBudgetRange(data.estimatedMin, data.estimatedMax)}
              </h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-white/20 px-4 py-1.5 font-figtree text-[12px] font-medium text-white backdrop-blur-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <Wallet className="hidden h-16 w-16 shrink-0 text-white/30 sm:block" strokeWidth={1.25} />
          </div>
        </div>

        <div className="mb-8 flex items-center gap-3 rounded-xl border border-[#E4E1FB] bg-[#F4F3FE] p-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#E4E1FB] text-[#6C63D6]">
            <TrendingUp className="h-5 w-5" strokeWidth={2} />
          </span>
          <p className="font-figtree text-[13px] font-medium text-[#4A3F9E]">{data.marketInsight}</p>
        </div>

        {data.vendorGroups.length > 0 && (
          <div>
            <div className="mb-4 flex gap-6 border-b border-black/5">
              {data.vendorGroups.map((group) => {
                const isActive = group.categoryId === activeGroup?.categoryId;
                return (
                  <button
                    key={group.categoryId}
                    type="button"
                    onClick={() => setActiveGroupId(group.categoryId)}
                    className={`pb-3 font-figtree text-[13px] font-semibold transition-colors ${
                      isActive
                        ? "border-b-2 border-brand-primary text-brand-950"
                        : "text-neutral-tertiary hover:text-brand-950"
                    }`}
                  >
                    {group.categoryLabel}
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {activeGroup?.suggestions.map((suggestion, i) => (
                <BudgetSuggestionCard key={suggestion.id} suggestion={suggestion} seed={i} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
