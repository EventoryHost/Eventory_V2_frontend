import Image from "next/image";

export interface VendorServiceRow {
  id: string;
  label: string;
  icon?: string;
  comingSoon?: boolean;
}

// Figma node 2250:9724 — a flat bordered list, not the shared
// SearchDropdownPanel's 44px colored-tile rows (which stay as-is for the
// Event Type field): plain 24px icons with no background tile, a thin border
// between rows, and a "COMING SOON" label row (no icon) ahead of any
// not-yet-live options, whose text renders grayed out. Also reused by the
// packages page's Budget Estimator vendor-type field (2026-10-30, PM
// request: "should be similar to that of landing page") — rows with no
// comingSoon flag at all (every option there has real live packages) just
// render as plain live rows, no divider.
export default function VendorServiceDropdownPanel({
  rows,
  selectedId,
  onSelect,
  className = "w-full",
}: {
  rows: VendorServiceRow[];
  selectedId: string;
  onSelect: (id: string) => void;
  className?: string;
}) {
  const live = rows.filter((row) => !row.comingSoon);
  const comingSoon = rows.filter((row) => row.comingSoon);

  const Row = ({ row }: { row: VendorServiceRow }) => (
    <button
      type="button"
      onClick={() => !row.comingSoon && onSelect(row.id)}
      disabled={row.comingSoon}
      className={`flex w-full items-center gap-2.5 px-4 py-3.5 text-left ${
        row.comingSoon ? "cursor-default" : "hover:bg-[#FAFAFA]"
      } ${selectedId === row.id ? "bg-[#FFF0F2]" : ""}`}
    >
      {row.icon && (
        <Image src={row.icon} alt="" width={24} height={24} className="h-6 w-6 shrink-0 object-contain" />
      )}
      <span
        className={`font-figtree text-[16px] font-medium leading-[18px] tracking-[0.16px] ${
          row.comingSoon ? "text-[#9F9FA9]" : "text-[#3F3F47]"
        }`}
      >
        {row.label}
      </span>
    </button>
  );

  return (
    <div
      className={`absolute left-0 top-full z-20 mt-2 max-h-[320px] overflow-y-auto rounded-[12px] border border-[#E4E4E7] bg-white shadow-[0px_8px_24px_0px_rgba(0,0,0,0.08)] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-button]:hidden ${className}`}
    >
      {live.map((row) => (
        <Row key={row.id} row={row} />
      ))}
      {comingSoon.length > 0 && (
        <div className="px-4 pb-1 pt-3.5">
          <span className="font-figtree text-[11px] font-medium uppercase tracking-[0.11px] text-[#9F9FA9]">
            Coming soon
          </span>
        </div>
      )}
      {comingSoon.map((row, i) => (
        <div key={row.id} className={i < comingSoon.length - 1 ? "border-b border-[#E4E4E7]" : ""}>
          <Row row={row} />
        </div>
      ))}
    </div>
  );
}
