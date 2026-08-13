"use client";

import { useState } from "react";

export default function CoordinatorSection() {
  const [isPrimaryCoordinator, setIsPrimaryCoordinator] = useState(false);
  const [altName, setAltName] = useState("");
  const [altNumber, setAltNumber] = useState("");

  return (
    <div
      className="flex w-full max-w-[868px] flex-col gap-4 rounded-[12px] border border-[#E5E5E5] bg-[#F4F4F5] p-8"
      style={{ boxShadow: "0px 40px 40px 0px #00000005" }}
    >
      <label className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={isPrimaryCoordinator}
          onChange={(e) => setIsPrimaryCoordinator(e.target.checked)}
          className="mt-0.5 h-5 w-5 shrink-0 rounded-[6px] border border-[#D4D4D8] accent-[#0F172A]"
        />
        <div className="flex flex-col gap-1">
          <span className="font-figtree text-[16px] font-bold text-[#101828]">
            I will be the primary on-site coordinator on the event day
          </span>
          <span className="font-figtree text-[14px] font-normal leading-[1.5] text-body-secondary">
            By default, vendors will call your number for arrival
            coordination. Uncheck this if you prefer a family member,
            planner, or close friend to handle calls during physical venue
            setup while you get ready.
          </span>
        </div>
      </label>

      {!isPrimaryCoordinator && (
        <>
          <div className="h-px w-full bg-[#E5E5E5]" />

          <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
            <div className="flex w-full max-w-[389px] flex-col gap-1.5">
              <label className="font-figtree text-[14px] font-normal text-[#101828]">
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

            <div className="flex w-full max-w-[389px] flex-col gap-1.5">
              <label className="font-figtree text-[14px] font-normal text-[#101828]">
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
