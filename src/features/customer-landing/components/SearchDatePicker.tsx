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
  isOpen: isOpenProp,
  onOpenChange,
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
  /**
   * Optional external open control — lets EventSearchCard's auto-advance
   * (picking a vendor service immediately opens the date calendar, same
   * "hand-off" pattern as Event Type → vendor service) drive this from
   * outside. Omitted by the PDP booking card's "quick" usage, which keeps
   * managing its own open state internally as before.
   */
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
}) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = isOpenProp ?? internalIsOpen;
  const setIsOpen = onOpenChange ?? setInternalIsOpen;
  const containerRef = useRef<HTMLDivElement>(null);

  const today = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);
  const isQuick = variant === "quick";
  // Event date selection starts tomorrow, never today — for both variants
  // (the landing search's "filled" pill and the PDP booking card's "quick"
  // day-row), so a customer can never pick an event date that's already
  // today. The only two consumers of this component are those two, so this
  // applies unconditionally rather than branching on variant.
  const minDate = useMemo(
    () => new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1),
    [today]
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
            onClick={() => setIsOpen(!isOpen)}
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
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          className={`flex h-12 w-full items-center gap-2 rounded-full px-4 text-left transition-colors duration-[120ms] ease-out ${
            isOpen
              ? "border-[1.5px] border-[#030303] bg-white shadow-[0px_4px_7px_0px_rgba(0,0,0,0.08)]"
              : "border border-transparent bg-[#F4F4F5] hover:bg-[#EAEAEC]"
          }`}
        >
          <span
            className={`flex-1 truncate font-figtree text-[16px] font-medium ${
              value && !isOpen ? "text-[#030303]" : "text-[#9F9FA9]"
            }`}
          >
            {value ? formatDisplayDate(value) : placeholder}
          </span>
          <ChevronDown
            size={18}
            className={`shrink-0 text-[#71717B] transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </button>
      )}

      {isOpen && (
        <div className="absolute top-[calc(100%+8px)] left-0 z-20 w-[314px] origin-top-left animate-[dropdown-enter_200ms_ease-out] rounded-[20px] border border-[#E4E4E8] bg-white p-2.5 shadow-[0px_10px_40px_0px_rgba(0,0,0,0.1)]">
          <div className="px-2.5 pt-2 pb-1.5">
            <span className="font-figtree text-[12px] font-medium tracking-[0.04em] text-[#8E8E96] uppercase">
              Pick your event date
            </span>
          </div>
          <div className="flex items-center justify-between px-1 pb-2">
            <button
              type="button"
              aria-label="Previous month"
              disabled={isPastMonth}
              onClick={() => setVisibleMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))}
              className="flex h-7 w-7 items-center justify-center rounded-full text-[#9F9FA9] transition-colors hover:bg-[#F6F6F7] disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="font-figtree text-[15px] font-semibold text-[#111114]">
              {MONTH_LABELS[visibleMonth.getMonth()]} {visibleMonth.getFullYear()}
            </span>
            <button
              type="button"
              aria-label="Next month"
              onClick={() => setVisibleMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}
              className="flex h-7 w-7 items-center justify-center rounded-full text-[#9F9FA9] transition-colors hover:bg-[#F6F6F7]"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-0.5 px-1">
            {WEEKDAY_LABELS.map((weekday, index) => (
              <div
                key={`${weekday}-${index}`}
                className="flex h-10 w-10 items-center justify-center font-figtree text-[12px] text-[#8E8E96]"
              >
                {weekday}
              </div>
            ))}

            {weeks.flatMap((week, weekIndex) =>
              week.map((cellDate, dayIndex) => {
                if (!cellDate) return <div key={`${weekIndex}-${dayIndex}`} className="h-10 w-10" />;
                const isPast = cellDate < minDate;
                const isToday = cellDate.getTime() === today.getTime();
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
                    className={`flex h-10 w-10 items-center justify-center justify-self-center rounded-full font-figtree text-[14px] transition-colors ${
                      isSelected
                        ? "bg-[#111114] font-medium text-white"
                        : isPast
                          ? "cursor-not-allowed text-[#D0D0D6]"
                          : isToday
                            ? "border border-[#111114] font-medium text-[#111114]"
                            : "text-[#111114] hover:bg-[#F6F6F7]"
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
