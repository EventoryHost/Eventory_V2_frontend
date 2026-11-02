"use client";

import { useEffect } from "react";
import { Printer, X } from "lucide-react";
import { useComparisonView } from "../hooks/useComparisonView";
import CompareTable from "./CompareTable";

/**
 * Figma node 2912:26487 — the same "Comparing Packages" content as the full
 * `/compare` page (ComparePageContent), shown as an in-place modal over the
 * package listing instead of navigating away from it (PM request
 * 2026-11-02: "Instead of redirection, show the result in a modal"). Both
 * share their data/remove logic via useComparisonView; only the chrome
 * around it differs (overlay + close callback vs. a full page).
 */
export default function CompareModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { view, error, hasSettled, handleRemove, packageCount } = useComparisonView(open);

  // Esc closes, same as every other modal in this app; locks page scroll
  // behind the overlay while open.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 sm:p-6 print:static print:bg-white print:p-0">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Comparing Packages"
        className="w-full max-w-[1150px] overflow-hidden rounded-[20px] bg-white shadow-[0px_20px_60px_rgba(0,0,0,0.25)] print:max-w-none print:rounded-none print:shadow-none"
      >
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E4E4E7] px-4 py-6 sm:px-6">
          <div className="flex flex-col gap-1">
            <h2 className="text-[24px] font-semibold leading-8 text-[#030303]">Comparing Packages</h2>
            <p className="text-[16px] leading-6 text-[#71717B]">
              {packageCount > 0
                ? `Comparing ${packageCount} ${packageCount === 1 ? "Package" : "Packages"}`
                : "Nothing to compare yet"}
            </p>
          </div>

          <div className="flex items-center gap-3 print:hidden">
            <button
              type="button"
              onClick={() => window.print()}
              className="flex items-center gap-2 rounded-[10px] border border-[#E4E4E7] bg-white px-3 py-1.5 text-[14px] font-semibold leading-5 text-[#030303] transition-colors hover:bg-[#FAFAFA]"
            >
              <Printer className="h-5 w-5" />
              Print/Export
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close the comparison"
              className="flex items-center rounded-[10px] border border-[#E4E4E7] bg-white p-1.5 text-[#030303] transition-colors hover:bg-[#FAFAFA]"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </header>

        <div className="max-h-[80vh] overflow-y-auto px-4 py-6 sm:px-6 print:max-h-none print:overflow-visible">
          {!hasSettled ? (
            <p className="text-[14px] leading-5 text-[#71717B]">Loading your comparison…</p>
          ) : error ? (
            <p className="text-[14px] leading-5 text-[#C81E0D]">{error}</p>
          ) : packageCount === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-[20px] border border-[#E4E4E7] py-16 text-center">
              <p className="text-[14px] text-[#71717B]">
                Pick packages to compare, then choose Compare now to build a comparison.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-[#E4E4E7] px-4 py-1.5 text-[14px] font-medium text-[#27272A] transition-colors hover:bg-[#FAFAFA]"
              >
                Back to packages
              </button>
            </div>
          ) : (
            <CompareTable columns={view!.columns} sections={view!.sections} onRemove={handleRemove} />
          )}
        </div>
      </div>
    </div>
  );
}
