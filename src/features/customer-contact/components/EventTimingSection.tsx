"use client";

import { useEffect, useRef, useState } from "react";
import { Clock } from "lucide-react";
import { ApiError } from "@/lib/apiClient";
import { patchCheckoutSessionEventTiming } from "@/lib/customerCheckoutApi";

// Half-hour steps, "HH:MM" 24h values shown as 12h labels.
const TIME_OPTIONS = Array.from({ length: 48 }, (_, index) => {
  const totalMinutes = index * 30;
  const hours24 = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  return {
    value: `${String(hours24).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`,
    label: `${hours12}:${String(minutes).padStart(2, "0")} ${hours24 < 12 ? "AM" : "PM"}`,
  };
});

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
      // A 400 here means the resulting end isn't after start (checked
      // against whatever's already saved too) — shown under the fields
      // rather than silently failing, per the backend's own note.
      setError(err instanceof ApiError ? err.message : "Couldn't save the event timing. Try again.");
    } finally {
      setSaving(false);
    }
  }

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
            void save({ startTime: value });
          }}
        />
        <TimeField
          label="Event ends"
          placeholder="Select end time"
          value={end}
          onChange={(value) => {
            setEnd(value);
            void save({ endTime: value });
          }}
        />
      </div>
      {(error || saving) && (
        <p className={`font-figtree text-[12px] ${error ? "text-[#E7000B]" : "text-[#71717B]"}`}>
          {error ?? "Saving…"}
        </p>
      )}
    </section>
  );
}
