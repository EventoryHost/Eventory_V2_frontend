import { SearchX } from "lucide-react";

export default function VendorEmptyState({ onClearFilters }: { onClearFilters: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-[18px] border border-black/10 bg-white px-6 py-20 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-neutral-subtle">
        <SearchX className="h-6 w-6 text-neutral-tertiary" />
      </div>
      <div>
        <p className="font-figtree text-[16px] font-semibold text-neutral-primary">
          No vendors found
        </p>
        <p className="mt-1 font-figtree text-[14px] text-neutral-tertiary">
          Try adjusting your filters or search.
        </p>
      </div>
      <button
        type="button"
        onClick={onClearFilters}
        className="rounded-full bg-brand-primary px-6 py-2.5 font-figtree text-[14px] font-bold text-white transition-opacity hover:opacity-90"
      >
        Clear filters
      </button>
    </div>
  );
}
