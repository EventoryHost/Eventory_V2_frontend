"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

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
  variant = "filled",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  /**
   * "filled" is the hero search bar's grey pill. "quick" is the PDP booking
   * card's row of three day boxes (starting tomorrow, or centred on the
   * picked date) plus a "Pick date" box that opens the same calendar popup.
   */
  variant?: "filled" | "quick";
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const today = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);
  const isQuick = variant === "quick";
  // The quick variant only offers dates from tomorrow on.
  const minDate = useMemo(
    () => (isQuick ? new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1) : today),
    [isQuick, today]
  );

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
    visibleMonth.getFullYear() === minDate.getFullYear() && visibleMonth.getMonth() === minDate.getMonth();

  // Three consecutive days: starting tomorrow when nothing is picked, else
  // the day before / the picked day / the day after.
  const quickDates = useMemo(() => {
    const start = selectedDate
      ? new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate() - 1)
      : minDate;
    return [0, 1, 2].map((offset) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + offset));
  }, [selectedDate, minDate]);

  return (
    <div ref={containerRef} className="relative flex-1">
      <label
        className={
          isQuick
            ? "mb-1.5 block font-figtree text-[14px] leading-[16.5px] font-medium tracking-[-0.01em] text-[#3F3F47]"
            : "mb-2 block text-[14px] font-semibold text-brand-950"
        }
      >
        {label}
      </label>
      {isQuick ? (
        <div className="flex items-center justify-between gap-2">
          {quickDates.map((date) => {
            const iso = toLocalISODate(date);
            const isSelected = value === iso;
            const isDisabled = date < minDate;
            return (
              <button
                key={iso}
                type="button"
                disabled={isDisabled}
                onClick={() => onChange(iso)}
                aria-pressed={isSelected}
                className={`flex h-[68px] w-[81px] shrink-0 flex-col items-center justify-center gap-2 rounded-xl border transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                  isSelected
                    ? "border-[#B4112A] bg-[#FDEEF0]"
                    : "border-[0.5px] border-[#E4E4E7] bg-white hover:bg-[#F4F4F5]"
                }`}
              >
                <span
                  className={`font-figtree text-[13px] leading-[16.5px] font-medium tracking-[-0.01em] ${
                    isSelected ? "text-[#B4112A]" : "text-[#71717B]"
                  }`}
                >
                  {date.toLocaleDateString("en-US", { weekday: "short" })}
                </span>
                <span
                  className={`font-figtree text-[20px] leading-[16.5px] font-semibold tracking-[-0.01em] ${
                    isSelected ? "text-[#B4112A]" : "text-[#3F3F47]"
                  }`}
                >
                  {date.getDate()}
                </span>
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setIsOpen((open) => !open)}
            aria-expanded={isOpen}
            className="flex h-[68px] w-[81px] shrink-0 flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-[#9F9FA9] bg-white text-[#3F3F47] transition-colors hover:bg-[#F4F4F5]"
          >
            <CalendarDays size={20} />
            <span className="font-figtree text-[13px] leading-[16.5px] font-semibold tracking-[-0.01em]">Pick date</span>
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen((open) => !open)}
          aria-expanded={isOpen}
          className="flex w-full items-center justify-between rounded-full bg-[#F4F4F5] px-5 py-3 text-left text-[14px] text-[#71717B] outline-none"
        >
          <span className="truncate">{value ? formatDisplayDate(value) : placeholder}</span>
          <ChevronDown size={16} className={`shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </button>
      )}

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
                const isPast = cellDate < minDate;
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
