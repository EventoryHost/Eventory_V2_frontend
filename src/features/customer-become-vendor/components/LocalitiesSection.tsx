"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

// Only "North East Delhi" had a real locality list in the design handoff
// (Badarpur Khadar, Bhajan Pura, then "Brahampuri" repeated — the design's
// own placeholder for "more localities go here"). Every other district is
// a real NCR district name from the design, but has no locality list yet —
// its row renders a "Localities coming soon" placeholder instead of
// fabricating area names that would look real but aren't. Fill in
// `localities` here once that data exists.
const DISTRICTS: { name: string; localities: string[] }[] = [
  {
    name: "North East Delhi",
    localities: [
      "Badarpur Khadar",
      "Bhajan Pura",
      "Brahampuri",
      "Brahampuri",
      "Brahampuri",
      "Brahampuri",
      "Brahampuri",
      "Brahampuri",
      "Brahampuri",
      "Brahampuri",
      "Brahampuri",
      "Brahampuri",
    ],
  },
  { name: "South East Delhi", localities: [] },
  { name: "East Delhi", localities: [] },
  { name: "North Delhi", localities: [] },
  { name: "North West Delhi", localities: [] },
  { name: "Shahdara", localities: [] },
  { name: "South Delhi", localities: [] },
  { name: "South West Delhi", localities: [] },
  { name: "West Delhi", localities: [] },
  { name: "Faridabad", localities: [] },
  { name: "Gurugram", localities: [] },
  { name: "Central Delhi", localities: [] },
  { name: "Ghaziabad", localities: [] },
  { name: "Gautam Buddha Nagar", localities: [] },
];

export default function LocalitiesSection() {
  const [expanded, setExpanded] = useState(DISTRICTS[0].name);
  const activeDistrict = DISTRICTS.find((d) => d.name === expanded);

  return (
    <section className="w-full bg-white px-4 pb-16 sm:px-6 lg:px-16">
      <div className="mx-auto max-w-[1312px] rounded-[32px] border border-[#FFEDCC] bg-[#FFF8EB] px-6 py-10 sm:px-8 sm:py-12">
        <div className="flex max-w-[400px] flex-col gap-2">
          <p className="flex flex-wrap items-center gap-1 font-figtree text-[14px] leading-[20px]">
            <span className="font-normal text-[#3F3F47]">Available in</span>
            <span className="font-semibold text-[#EA1D3B]">Delhi, Ghaziabad, Gurugram, Noida</span>
            <span className="font-normal text-[#3F3F47]">now</span>
          </p>
          <p className="font-figtree text-[24px] leading-[32px] font-semibold text-[#030303]">
            We are live in 200+ Localities
          </p>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2">
          {DISTRICTS.map((district, i) => {
            const isActive = district.name === expanded;
            return (
              <div key={district.name} className="flex items-center gap-3">
                {i > 0 && <span className="font-figtree text-[12px] text-[#71717B]">|</span>}
                <button
                  type="button"
                  onClick={() => setExpanded(isActive ? "" : district.name)}
                  className={`flex items-center gap-1 font-figtree text-[14px] leading-[20px] font-medium whitespace-nowrap transition ${
                    isActive ? "text-[#030303]" : "text-[#71717B] hover:text-[#030303]"
                  }`}
                >
                  {district.name}
                  <ChevronDown className={`h-5 w-5 shrink-0 transition-transform ${isActive ? "rotate-180" : ""}`} />
                </button>
              </div>
            );
          })}
        </div>

        {activeDistrict && (
          <div className="mt-5 flex flex-wrap items-start gap-2">
            {activeDistrict.localities.length > 0 ? (
              activeDistrict.localities.map((locality, i) => (
                <span
                  key={`${locality}-${i}`}
                  className="flex items-center rounded-full border border-[#E4E4E7] bg-white px-2 py-0.5 font-figtree text-[14px] leading-[20px] font-medium whitespace-nowrap text-black"
                >
                  {locality}
                </span>
              ))
            ) : (
              <span className="font-figtree text-[14px] leading-[20px] text-[#71717B]">Localities coming soon</span>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
