"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

export default function EventCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthLabel = currentDate.toLocaleString("default", { month: "long" });

  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const changeMonth = (direction: "prev" | "next") => {
    setCurrentDate(
      (prev) =>
        new Date(
          prev.getFullYear(),
          prev.getMonth() + (direction === "prev" ? -1 : 1),
          1
        )
    );
  };

  return (
    <div className="w-full max-w-[646px] rounded-[24px] border border-black/10 bg-white p-6">
      <div className="flex items-center justify-between">
        <h2 className="font-figtree text-[22px] font-bold text-brand-950">
          Event Calendar
        </h2>

        <div className="flex items-center gap-2 rounded-full bg-[#F4F4F5] px-2 py-1.5">
          <button
            type="button"
            aria-label="Previous month"
            onClick={() => changeMonth("prev")}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-brand-950"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="min-w-[64px] text-center font-figtree text-[15px] font-semibold text-brand-950">
            {monthLabel}
          </span>
          <button
            type="button"
            aria-label="Next month"
            onClick={() => changeMonth("next")}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-brand-950"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-7 gap-3 border-t border-black/5 pt-5">
        {WEEKDAYS.map((day) => (
          <span
            key={day}
            className="text-center font-figtree text-[12px] font-semibold uppercase tracking-wide text-[#A1A1AA]"
          >
            {day}
          </span>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-7 gap-3">
        {cells.map((day, i) =>
          day === null ? (
            <div key={i} className="h-[52px] w-full" />
          ) : (
            <div
              key={i}
              className="flex h-[52px] w-full items-center justify-center rounded-[12px] border border-[#E6E6E6] bg-[#FAFAFA] font-figtree text-[15px] font-semibold text-brand-950"
            >
              {day}
            </div>
          )
        )}
      </div>
    </div>
  );
}
