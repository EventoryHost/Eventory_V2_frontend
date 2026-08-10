"use client";

import { useState } from "react";

export default function AlternateCoordinatorSection() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [altName, setAltName] = useState("");
  const [altNumber, setAltNumber] = useState("");

  return (
    <div
      className="flex w-full max-w-[801px] flex-col gap-4 rounded-[16px] border border-[#E5E5E5] bg-[#F4F4F5] p-8"
      style={{ boxShadow: "0px 40px 40px 0px #00000005" }}
    >
      <label className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={isEnabled}
          onChange={(e) => setIsEnabled(e.target.checked)}
          className="mt-0.5 h-5 w-5 shrink-0 rounded-[6px] border border-[#D4D4D8] accent-[#0F172A]"
        />
        <div className="flex flex-col gap-1">
          <span className="font-figtree text-[15px] font-semibold text-[#0F172A]">
            Add Alternate Coordinator
          </span>
          <span className="font-figtree text-[13px] font-normal leading-[18px] text-[#444748]">
            Alternate number incase you do not pickup or are not the primary
            site coordinator
          </span>
        </div>
      </label>

      {isEnabled && (
        <>
          <div className="h-px w-full bg-[#E5E5E5]" />

          <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
            <div className="flex w-full max-w-[355.5px] flex-col gap-1">
              <label className="text-left font-figtree text-[12px] font-normal text-[#3F3F47]">
                Alternative Coordinate Name
              </label>
              <input
                type="text"
                value={altName}
                onChange={(e) => setAltName(e.target.value)}
                placeholder="Name"
                className="h-12 w-full rounded-[8px] border border-[#D4D4D8] bg-white px-4 py-3 font-figtree text-[15px] text-[#101828] placeholder:text-[#9CA3AF] outline-none transition-colors focus:border-[#0F172A]"
              />
            </div>

            <div className="flex w-full max-w-[355.5px] flex-col gap-1">
              <label className="text-left font-figtree text-[12px] font-normal text-[#3F3F47]">
                Alternative Coordinate Number
              </label>
              <input
                type="tel"
                value={altNumber}
                onChange={(e) => setAltNumber(e.target.value)}
                placeholder="+91 XXXXX XXXXX"
                className="h-12 w-full rounded-[8px] border border-[#D4D4D8] bg-white px-4 py-3 font-figtree text-[15px] text-[#101828] placeholder:text-[#9CA3AF] outline-none transition-colors focus:border-[#0F172A]"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
