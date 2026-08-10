"use client";

import { useState } from "react";
import { FileText } from "lucide-react";

export default function GstinToggleSection() {
  const [addGstin, setAddGstin] = useState(false);

  return (
    <div
      className="flex w-full max-w-[801px] items-center justify-between rounded-[16px] border border-[#E5E5E5] bg-white p-4"
      style={{ boxShadow: "0px 40px 40px 0px #00000005" }}
    >
      <div className="flex items-center gap-3">
        <FileText size={20} className="text-[#0F172A]" />
        <span className="font-figtree text-[15px] font-semibold leading-[24px] text-[#0F172A]">
          Add GSTIN details for tax invoice (Optional)
        </span>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={addGstin}
        onClick={() => setAddGstin((v) => !v)}
        className={`flex h-7 w-12 shrink-0 items-center rounded-full p-0.5 transition-colors ${
          addGstin ? "bg-[#22C55E]" : "bg-[#D1D5DB]"
        }`}
      >
        <span
          className={`h-6 w-6 rounded-full bg-white shadow-sm transition-transform ${
            addGstin ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}
