"use client";

/**
 * "Choose vendor service" field's dropdown — Figma node 2624:27930. Unlike
 * the shared SearchDropdownPanel (icon tiles, per-row "Coming soon" pill),
 * this design groups every not-yet-live service under a single uppercase
 * "COMING SOON" divider row, with small inline icons and bottom-border rows
 * instead of a padded card list. Kept as its own component rather than a
 * SearchDropdownPanel variant since the two row styles don't share markup.
 */
export default function VendorServiceDropdownPanel({
  rows,
  selectedId,
  onSelect,
  className = "",
}: {
  rows: { id: string; label: string; icon?: string; comingSoon?: boolean }[];
  selectedId?: string;
  onSelect: (id: string) => void;
  className?: string;
}) {
  const liveRows = rows.filter((row) => !row.comingSoon);
  const comingSoonRows = rows.filter((row) => row.comingSoon);

  return (
    <div
      role="listbox"
      className={`absolute top-[calc(100%+8px)] left-0 z-20 w-full origin-top-left animate-[dropdown-enter_200ms_ease-out] overflow-hidden rounded-xl border border-[#E4E4E7] bg-white shadow-[0px_10px_40px_0px_rgba(0,0,0,0.1)] ${className}`}
    >
      {rows.length === 0 ? (
        <p className="px-4 py-3 text-center font-figtree text-[13px] text-[#9F9FA9]">No options</p>
      ) : (
        <div className="flex max-h-[360px] flex-col overflow-y-auto">
          {liveRows.map((row) => (
            <button
              key={row.id}
              type="button"
              role="option"
              aria-selected={row.id === selectedId}
              onClick={() => onSelect(row.id)}
              className={`flex items-center gap-2.5 border-b border-[#E4E4E7] px-4 py-3.5 text-left transition-colors duration-[120ms] last:border-b-0 ${
                row.id === selectedId ? "bg-[#FDE7EB]" : "hover:bg-[#F6F6F7]"
              }`}
            >
              {row.icon && <img src={row.icon} alt="" className="size-6 shrink-0 object-contain" />}
              <span className="truncate font-figtree text-[16px] font-medium text-[#3F3F47]">{row.label}</span>
            </button>
          ))}

          {comingSoonRows.length > 0 && (
            <>
              <div className="px-4 pt-3.5 pb-1">
                <span className="font-figtree text-[11px] font-medium tracking-[0.01em] text-[#9F9FA9] uppercase">
                  Coming soon
                </span>
              </div>
              {comingSoonRows.map((row, index) => (
                <button
                  key={row.id}
                  type="button"
                  role="option"
                  aria-selected={row.id === selectedId}
                  onClick={() => onSelect(row.id)}
                  className={`flex items-center gap-2.5 px-4 py-3.5 text-left transition-colors duration-[120ms] ${
                    index < comingSoonRows.length - 1 ? "border-b border-[#E4E4E7]" : ""
                  } ${row.id === selectedId ? "bg-[#FDE7EB]" : "hover:bg-[#F6F6F7]"}`}
                >
                  {row.icon && (
                    <img src={row.icon} alt="" className="size-6 shrink-0 object-contain opacity-60" />
                  )}
                  <span className="truncate font-figtree text-[16px] font-medium text-[#9F9FA9]">{row.label}</span>
                </button>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
