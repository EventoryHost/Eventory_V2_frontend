"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

const WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];
const MONTH_LABELS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function toLocalISODate(d: Date) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseLocalISODate(value: string): Date | null {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

function formatDisplayDate(value: string) {
  const date = parseLocalISODate(value);
  if (!date) return "";
  return `${date.getDate()} ${MONTH_LABELS[date.getMonth()].slice(0, 3)} ${date.getFullYear()}`;
}

/**
 * Custom calendar to match the theme dropdowns — a native <input
 * type="date"> renders the browser's own unstylable picker UI, so this
 * reimplements the popup as a themed grid (same trigger pill + white
 * popup + brand-primary selected state as SearchDropdown).
 */
export default function SearchDatePicker({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const today = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);

  const selectedDate = parseLocalISODate(value);
  const [visibleMonth, setVisibleMonth] = useState(() => selectedDate ?? today);

  useEffect(() => {
    if (isOpen) setVisibleMonth(selectedDate ?? today);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const weeks = useMemo(() => {
    const year = visibleMonth.getFullYear();
    const month = visibleMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: (Date | null)[] = Array(firstDay.getDay()).fill(null);
    for (let day = 1; day <= daysInMonth; day += 1) {
      cells.push(new Date(year, month, day));
    }
    while (cells.length % 7 !== 0) cells.push(null);
    const rows: (Date | null)[][] = [];
    for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));
    return rows;
  }, [visibleMonth]);

  const isPastMonth =
    visibleMonth.getFullYear() === today.getFullYear() && visibleMonth.getMonth() === today.getMonth();

  return (
    <div ref={containerRef} className="relative flex-1">
      <label className="mb-2 block text-[14px] font-semibold text-brand-950">{label}</label>
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between rounded-full bg-[#F4F4F5] px-5 py-3 text-left text-[14px] text-[#71717B] outline-none"
      >
        <span className="truncate">{value ? formatDisplayDate(value) : placeholder}</span>
        <ChevronDown size={16} className={`shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 z-20 mt-2 w-[314px] rounded-2xl bg-white p-4 shadow-[0_4px_24px_rgba(0,0,0,0.12)]">
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              aria-label="Previous month"
              disabled={isPastMonth}
              onClick={() => setVisibleMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))}
              className="flex h-7 w-7 items-center justify-center rounded-full text-[#9F9FA9] transition-colors hover:bg-[#F4F4F5] disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="font-figtree text-[14px] font-semibold text-brand-950">
              {MONTH_LABELS[visibleMonth.getMonth()]} {visibleMonth.getFullYear()}
            </span>
            <button
              type="button"
              aria-label="Next month"
              onClick={() => setVisibleMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}
              className="flex h-7 w-7 items-center justify-center rounded-full text-[#9F9FA9] transition-colors hover:bg-[#F4F4F5]"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-y-1">
            {WEEKDAY_LABELS.map((weekday, index) => (
              <div
                key={`${weekday}-${index}`}
                className="flex h-8 items-center justify-center font-figtree text-[12px] font-medium text-[#9F9FA9]"
              >
                {weekday}
              </div>
            ))}

            {weeks.flatMap((week, weekIndex) =>
              week.map((cellDate, dayIndex) => {
                if (!cellDate) return <div key={`${weekIndex}-${dayIndex}`} />;
                const isPast = cellDate < today;
                const isSelected = value === toLocalISODate(cellDate);
                return (
                  <button
                    key={`${weekIndex}-${dayIndex}`}
                    type="button"
                    disabled={isPast}
                    onClick={() => {
                      onChange(toLocalISODate(cellDate));
                      setIsOpen(false);
                    }}
                    className={`flex h-8 w-8 items-center justify-center justify-self-center rounded-full font-figtree text-[13px] font-medium transition-colors ${
                      isSelected
                        ? "bg-brand-primary text-white"
                        : isPast
                          ? "cursor-not-allowed text-[#E4E4E7]"
                          : "text-neutral-secondary hover:bg-[#F4F4F5]"
                    }`}
                  >
                    {cellDate.getDate()}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
