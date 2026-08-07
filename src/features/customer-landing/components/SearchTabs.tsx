"use client";

import { Search, Sparkles } from "lucide-react";

type SearchTab = "event" | "ai";

export default function SearchTabs({
  activeTab,
  onChange,
}: {
  activeTab: SearchTab;
  onChange: (tab: SearchTab) => void;
}) {
  return (
    <div className="flex items-center gap-8">
      <button
        type="button"
        onClick={() => onChange("event")}
        className={`flex items-center gap-2 pb-2 text-[15px] font-semibold border-b-2 transition-colors ${
          activeTab === "event"
            ? "text-brand-950 border-brand-primary"
            : "text-[#71717B] border-transparent"
        }`}
      >
        <Search size={16} />
        Search Event
      </button>

      <button
        type="button"
        onClick={() => onChange("ai")}
        className={`flex items-center gap-2 pb-2 text-[15px] font-semibold border-b-2 transition-colors ${
          activeTab === "ai"
            ? "text-brand-950 border-brand-primary"
            : "text-[#71717B] border-transparent"
        }`}
      >
        <Sparkles size={16} />
        Plan with AI
      </button>
    </div>
  );
}

export type { SearchTab };
