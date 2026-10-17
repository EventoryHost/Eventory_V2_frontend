"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { SERVICE_AREAS } from "../data/serviceAreas";

// Two color themes, same interactive component — About Us's "We are live
// in 200+ Localities" (Figma node 2438:22406) is functionally identical to
// this section, just pink-tinted instead of cream, so it reuses this
// rather than duplicating the expand/collapse logic.
const VARIANTS = {
  cream: { border: "border-[#FFEDCC]", bg: "bg-[#FFF8EB]", pillBorder: "border-[#E4E4E7]" },
  pink: { border: "border-[#FDEEF0]", bg: "bg-[#FFF5F6]", pillBorder: "border-[#F9BDC5]" },
};

export default function LocalitiesSection({ variant = "cream" }: { variant?: keyof typeof VARIANTS }) {
  const [expanded, setExpanded] = useState(SERVICE_AREAS[0].area);
  const activeDistrict = SERVICE_AREAS.find((d) => d.area === expanded);
  const theme = VARIANTS[variant];

  return (
    <section className="w-full bg-white px-4 pb-16 sm:px-6 lg:px-16">
      <div className={`mx-auto max-w-[1312px] rounded-[32px] border ${theme.border} ${theme.bg} px-6 py-10 sm:px-8 sm:py-12`}>
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
          {SERVICE_AREAS.map((district, i) => {
            const isActive = district.area === expanded;
            return (
              <div key={district.area} className="flex items-center gap-3">
                {i > 0 && <span className="font-figtree text-[12px] text-[#71717B]">|</span>}
                <button
                  type="button"
                  onClick={() => setExpanded(isActive ? "" : district.area)}
                  className={`flex items-center gap-1 font-figtree text-[14px] leading-[20px] font-medium whitespace-nowrap transition ${
                    isActive ? "text-[#030303]" : "text-[#71717B] hover:text-[#030303]"
                  }`}
                >
                  {district.area}
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
                  className={`flex items-center rounded-full border ${theme.pillBorder} bg-white px-2 py-0.5 font-figtree text-[14px] leading-[20px] font-medium whitespace-nowrap text-black`}
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
