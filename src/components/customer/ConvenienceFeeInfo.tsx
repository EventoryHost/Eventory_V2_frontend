"use client";

import { useState } from "react";
import { Info } from "lucide-react";
import type { RawConvenienceFeeBreakdown } from "@/lib/customerCartApi";

/**
 * The little "?" next to a "Service & security fee" line. Opens a popover
 * explaining how the platform fee was computed, from whatever the backend
 * put in `convenienceFeeBreakdown` (2026-09-10 handoff — score, category,
 * price slab, days-to-event bucket, %, weight, base fee, formula). Renders
 * only the fields that are actually present, so it degrades gracefully if
 * the shape differs from what's expected.
 */
function formatNumeric(value: unknown): string | null {
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  if (typeof value === "string" && value.trim()) return value;
  return null;
}

const FIELD_LABELS: { key: keyof RawConvenienceFeeBreakdown; label: string }[] = [
  { key: "category", label: "Category band" },
  { key: "score", label: "Vendor score" },
  { key: "slab", label: "Price slab" },
  { key: "dayBucket", label: "Days to event" },
  { key: "percentage", label: "Percentage" },
  { key: "weight", label: "Weight" },
  { key: "baseFee", label: "Base fee" },
];

export default function ConvenienceFeeInfo({
  reason,
  breakdown,
}: {
  reason?: string | null;
  breakdown?: RawConvenienceFeeBreakdown | null;
}) {
  const [open, setOpen] = useState(false);

  const rows = breakdown
    ? FIELD_LABELS.map(({ key, label }) => ({ label, value: formatNumeric(breakdown[key]) })).filter(
        (row): row is { label: string; value: string } => row.value !== null
      )
    : [];
  const formula = breakdown && typeof breakdown.formula === "string" ? breakdown.formula : null;

  if (!reason && rows.length === 0 && !formula) return null;

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        aria-label="How is this fee calculated?"
        onClick={() => setOpen((v) => !v)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="text-neutral-tertiary transition-colors hover:text-neutral-secondary"
      >
        <Info className="h-3.5 w-3.5" />
      </button>

      {open && (
        <span className="absolute top-full right-0 z-30 mt-1.5 w-64 rounded-xl border border-black/10 bg-white p-3 text-left font-figtree text-[12px] leading-[18px] font-normal text-neutral-secondary shadow-lg">
          <span className="mb-1 block font-figtree text-[11px] font-semibold tracking-wide text-neutral-tertiary uppercase">
            How this fee is calculated
          </span>
          {reason && <span className="block">{reason}</span>}
          {rows.length > 0 && (
            <span className="mt-2 flex flex-col gap-0.5">
              {rows.map((row) => (
                <span key={row.label} className="flex justify-between gap-3">
                  <span className="text-neutral-tertiary">{row.label}</span>
                  <span className="text-neutral-primary">{row.value}</span>
                </span>
              ))}
            </span>
          )}
          {formula && (
            <span className="mt-2 block font-mono text-[11px] text-neutral-tertiary">{formula}</span>
          )}
        </span>
      )}
    </span>
  );
}
