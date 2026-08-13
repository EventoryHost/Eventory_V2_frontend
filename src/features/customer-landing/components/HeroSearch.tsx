"use client";

import { useState } from "react";
import SearchTabs, { type SearchTab } from "./SearchTabs";
import EventSearchCard from "./EventSearchCard";

export default function HeroSearch() {
  const [activeTab, setActiveTab] = useState<SearchTab>("event");

  return (
    <div className="mx-auto mt-10 flex w-full max-w-[908px] flex-col gap-4 px-4 sm:px-0">
      <SearchTabs activeTab={activeTab} onChange={setActiveTab} />
      {activeTab === "event" ? (
        <EventSearchCard />
      ) : (
        <div className="rounded-3xl bg-white shadow-[0_4px_24px_rgba(0,0,0,0.06)] px-6 py-6 text-[14px] text-[#71717B]">
          AI planning coming soon.
        </div>
      )}
    </div>
  );
}
