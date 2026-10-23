"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getFixedEventsInMonth } from "@/lib/eventCalendarData";

const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export type EventCalendarProps = {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
};

export default function EventCalendar({ selectedDate, onSelectDate }: EventCalendarProps) {
  // The displayed month can be navigated independently of the selected day
  // (e.g. browsing ahead), starting on whichever month the selected day is in.
  const [viewDate, setViewDate] = useState(selectedDate);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const monthLabel = viewDate.toLocaleString("default", { month: "long" });

  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const eventDaysInMonth = new Set(getFixedEventsInMonth(month + 1).map((e) => e.day));

  const cells: (number | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const changeMonth = (direction: "prev" | "next") => {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + (direction === "prev" ? -1 : 1), 1));
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
        {cells.map((day, i) => {
          if (day === null) return <div key={i} className="h-[52px] w-full" />;

          const cellDate = new Date(year, month, day);
          const isSelected = isSameDay(cellDate, selectedDate);
          const hasEvent = eventDaysInMonth.has(day);

          return (
            <button
              key={i}
              type="button"
              onClick={() => onSelectDate(cellDate)}
              className={`relative flex h-[52px] w-full items-center justify-center rounded-[12px] border font-figtree text-[15px] font-semibold transition-colors ${
                isSelected
                  ? "border-brand-primary bg-brand-primary text-white"
                  : "border-[#E6E6E6] bg-[#FAFAFA] text-brand-950 hover:border-brand-primary/40"
              }`}
            >
              {day}
              {hasEvent && !isSelected && (
                <span className="absolute bottom-1.5 h-1.5 w-1.5 rounded-full bg-brand-primary" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
