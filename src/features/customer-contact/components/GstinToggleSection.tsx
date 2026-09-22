"use client";

import { useState } from "react";
import { ReceiptText } from "lucide-react";

const LABEL = "font-figtree text-[14px] leading-none font-medium text-[#3F3F47]";
const INPUT =
  "h-[49px] w-full rounded-2xl border border-[#E4E4E7] bg-white px-3.5 py-[13.5px] font-figtree text-[15px] text-[#030303] outline-none transition-colors placeholder:text-[#9F9FA9] focus:border-[#0F172A]";

/**
 * Optional GSTIN for the tax invoice. Turning the switch on reveals the
 * business name / GSTIN fields. Held in local state for now — nothing
 * persists them against the booking yet.
 */
export default function GstinToggleSection() {
  const [addGstin, setAddGstin] = useState(false);
  const [businessName, setBusinessName] = useState("");
  const [gstin, setGstin] = useState("");

  return (
    <div
      className="flex w-full max-w-[801px] flex-col gap-4 rounded-3xl border border-[#E4E4E7] bg-white p-6"
      style={{ boxShadow: "0px 40px 40px 0px #00000005" }}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <ReceiptText size={24} className="text-[#0F172A]" />
          <span className="font-figtree text-[16px] font-medium leading-6 text-[#030303]">
            Add GSTIN details for tax invoice (Optional)
          </span>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={addGstin}
          aria-label="Add GSTIN details"
          onClick={() => setAddGstin((v) => !v)}
          className={`flex h-7 w-12 shrink-0 items-center rounded-full p-0.5 transition-colors ${
            addGstin ? "bg-[#0B0B0B]" : "bg-[#D1D5DB]"
          }`}
        >
          <span
            className={`h-6 w-6 rounded-full bg-white shadow-sm transition-transform ${
              addGstin ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      {addGstin && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-2.5">
            <span className={LABEL}>Business Name</span>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Placeholder"
              className={INPUT}
            />
          </label>
          <label className="flex flex-col gap-2.5">
            <span className={LABEL}>GSTIN Number</span>
            <input
              type="text"
              value={gstin}
              onChange={(e) => setGstin(e.target.value.toUpperCase().slice(0, 15))}
              placeholder="Placeholder"
              className={INPUT}
            />
          </label>
        </div>
      )}
    </div>
  );
}
