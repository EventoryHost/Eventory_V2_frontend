"use client";

import { useEffect, useState } from "react";

/**
 * The number between a +/- pair, made directly editable. Kept as its own
 * small component since it's used in two places (AddedAddonsSummary's
 * add-ons tab, CustomizeWorkshopModal's item quantity) with the same
 * validation rules: digits only while typing, then on blur/Enter clamp to
 * [min, max] and revert to the last committed value if what's left isn't a
 * valid number (e.g. cleared to empty).
 */
export default function QuantityInput({
  value,
  onChange,
  min = 1,
  max = 99,
  className = "",
  "aria-label": ariaLabel,
}: {
  value: number;
  onChange: (qty: number) => void;
  min?: number;
  max?: number;
  className?: string;
  "aria-label"?: string;
}) {
  const [draft, setDraft] = useState(String(value));

  // Stay in sync when the value changes from outside (+/- buttons, or
  // another commit) — but not while the field itself has focus, so a
  // programmatic update doesn't fight the user mid-keystroke.
  useEffect(() => {
    setDraft(String(value));
  }, [value]);

  function commit() {
    const parsed = Number.parseInt(draft, 10);
    if (Number.isNaN(parsed)) {
      setDraft(String(value));
      return;
    }
    const clamped = Math.min(max, Math.max(min, parsed));
    setDraft(String(clamped));
    if (clamped !== value) onChange(clamped);
  }

  return (
    <input
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      aria-label={ariaLabel}
      value={draft}
      onChange={(event) => {
        const raw = event.target.value;
        if (raw === "" || /^\d+$/.test(raw)) setDraft(raw);
      }}
      onBlur={commit}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          event.currentTarget.blur();
        }
      }}
      className={
        className ||
        "w-8 rounded-md border border-transparent text-center font-figtree text-[14px] font-medium text-brand-950 hover:border-black/15 focus:border-black/20 focus:outline-none"
      }
    />
  );
}
