"use client";

import { useEffect, useRef, useState } from "react";
import { AlertCircle, Clock, Moon } from "lucide-react";
import { ApiError } from "@/lib/apiClient";
import { patchCheckoutSessionEventTiming } from "@/lib/customerCheckoutApi";

// Half-hour steps, "HH:MM" 24h values shown as 12h labels, covering the
// full day — but ORDERED starting at 9:00 AM (most events start well into
// the morning, not at midnight) and wrapping around through the rest of
// the day, ending at 8:30 AM, right before the next day's 9:00 AM.
const DAY_START_HOUR = 9;
const TIME_OPTIONS = Array.from({ length: 48 }, (_, index) => {
  const totalMinutes = ((DAY_START_HOUR * 2 + index) % 48) * 30;
  const hours24 = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  return {
    value: `${String(hours24).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`,
    label: `${hours12}:${String(minutes).padStart(2, "0")} ${hours24 < 12 ? "AM" : "PM"}`,
  };
});

const TIME_LABEL = new Map(TIME_OPTIONS.map((option) => [option.value, option.label]));

function formatDay(date: Date): string {
  return date.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

/** Friendly text for the backend's validation errors, which arrive as raw field messages. */
function friendlyTimingError(error: unknown): string {
  const message = error instanceof ApiError ? error.message : "";
  if (/same as the start/i.test(message)) return SAME_TIME_MESSAGE;
  if (/HH:MM/i.test(message)) return "That time isn't valid. Please pick one from the list.";
  return "Couldn't save the event timing. Please try again.";
}

const SAME_TIME_MESSAGE = "The event can't end at the same time it starts. Pick the time it finishes.";

function TimeField({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) setIsOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const selected = TIME_OPTIONS.find((option) => option.value === value);

  return (
    <div ref={ref} className="relative flex flex-1 flex-col gap-3">
      <span className="font-figtree text-[16px] leading-none font-semibold text-[#030303]">{label}</span>
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        className="flex h-[49px] w-full items-center justify-between rounded-2xl border border-[#E4E4E7] bg-white px-3.5 py-[13.5px] text-left font-figtree text-[15px]"
      >
        <span className={selected ? "text-[#030303]" : "text-[#9F9FA9]"}>{selected?.label ?? placeholder}</span>
        <Clock size={20} className="shrink-0 text-[#030303]" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 z-20 mt-2 max-h-[280px] w-full overflow-y-auto rounded-2xl bg-white shadow-[0_4px_24px_rgba(0,0,0,0.12)]">
          {TIME_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`flex h-11 w-full items-center justify-center border-b border-[#E4E4E7] font-figtree text-[14px] last:border-b-0 ${
                option.value === value ? "bg-[#F0596F] text-white" : "text-[#3F3F47] hover:bg-[#F4F4F5]"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export type EventTimingSectionProps = {
  /** "" until the checkout session has loaded — fields save silently once it's set. */
  sessionId: string;
  initialStartTime: string;
  initialEndTime: string;
  /** The event's date (ISO), when the order has one: lets an overnight event show the date it ends on. */
  eventDateIso?: string | null;
  /** Called after a successful save so the caller can re-fetch validation/canContinue. */
  onSaved?: () => void;
};

/**
 * "When's the event?" — when the event itself starts and ends, for the
 * vendor's own planning. Distinct from any line's booked slot (a vendor's
 * booked hours, set on the PDP) — the two are allowed to differ and are
 * saved separately (CheckoutSession.eventTiming, one value for the whole
 * order, not per line).
 */
export default function EventTimingSection({
  sessionId,
  initialStartTime,
  initialEndTime,
  eventDateIso,
  onSaved,
}: EventTimingSectionProps) {
  const [start, setStart] = useState(initialStartTime);
  const [end, setEnd] = useState(initialEndTime);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Same "hydrate once" pattern as ContactDetailsForm — the session's
  // eventTiming loads asynchronously after this mounts, but shouldn't
  // clobber a value the customer is already editing on a later refresh.
  const [hydrated, setHydrated] = useState(false);
  if (!hydrated && (initialStartTime || initialEndTime)) {
    setStart(initialStartTime);
    setEnd(initialEndTime);
    setHydrated(true);
  }

  async function save(patch: { startTime?: string; endTime?: string }) {
    if (!sessionId) return;
    setSaving(true);
    setError(null);
    try {
      await patchCheckoutSessionEventTiming(sessionId, patch);
      onSaved?.();
    } catch (err) {
      // A 400 here means start and end are identical (checked against
      // whatever's already saved too). Shown as readable text, never the
      // backend's raw field message.
      setError(friendlyTimingError(err));
    } finally {
      setSaving(false);
    }
  }

  // An end earlier than the start means the event runs past midnight and
  // finishes the next day, which is valid. Only identical times are an error.
  const overnight = Boolean(start && end && end < start);
  const startDay = eventDateIso && !isNaN(new Date(eventDateIso).getTime()) ? new Date(eventDateIso) : null;
  const endDay = startDay ? new Date(startDay.getTime() + 24 * 60 * 60 * 1000) : null;

  return (
    <section className="flex w-full max-w-[868px] flex-col gap-4">
      <div className="flex flex-col gap-2">
        <h2 className="font-figtree text-[28px] leading-[36px] font-semibold tracking-[-0.42px] text-[#030303]">
          When&apos;s the event?
        </h2>
        <p className="font-figtree text-[14px] leading-none font-normal text-[#3F3F47]">
          Let your vendors know exactly when the event runs, so they can plan arrival and setup.
        </p>
      </div>

      <div className="flex flex-col gap-4 rounded-3xl border border-[#E4E4E7] bg-white p-8 sm:flex-row">
        <TimeField
          label="Event starts"
          placeholder="Select start time"
          value={start}
          onChange={(value) => {
            setStart(value);
            if (value && value === end) setError(SAME_TIME_MESSAGE);
            else void save({ startTime: value });
          }}
        />
        <TimeField
          label="Event ends"
          placeholder="Select end time"
          value={end}
          onChange={(value) => {
            setEnd(value);
            if (value && value === start) setError(SAME_TIME_MESSAGE);
            else void save({ endTime: value });
          }}
        />
      </div>
      {overnight && !error && (
        <div className="flex items-start gap-3 rounded-2xl border border-[#E4E4E7] bg-[#FAFAFA] px-4 py-3">
          <Moon size={18} className="mt-0.5 shrink-0 text-[#71717B]" />
          <div className="flex flex-col gap-0.5 font-figtree text-[14px] leading-5 text-[#3F3F47]">
            <p className="font-semibold text-[#030303]">Overnight event: ends the next day</p>
            {startDay && endDay ? (
              <p>
                {formatDay(startDay)} · {TIME_LABEL.get(start)} &rarr; {formatDay(endDay)} · {TIME_LABEL.get(end)}
              </p>
            ) : (
              <p>
                {TIME_LABEL.get(start)} until {TIME_LABEL.get(end)} the following day.
              </p>
            )}
          </div>
        </div>
      )}
      {error ? (
        <div role="alert" className="flex items-start gap-3 rounded-2xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3">
          <AlertCircle size={18} className="mt-0.5 shrink-0 text-[#E7000B]" />
          <p className="font-figtree text-[14px] leading-5 font-medium text-[#B91C1C]">{error}</p>
        </div>
      ) : (
        saving && <p className="font-figtree text-[12px] text-[#71717B]">Saving…</p>
      )}
    </section>
  );
}
