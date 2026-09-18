import Link from "next/link";
import { Plus } from "lucide-react";

/**
 * An unfilled package column (node 1200:3410). The comparison always lays out
 * three columns; the ones the customer hasn't filled show this placeholder in
 * the card row and stay blank down the rest of the table.
 *
 * Packages join a comparison from the wishlist (its cards carry the compare
 * checkboxes), so that's where this leads — the ones already being compared
 * arrive pre-ticked, making this add rather than start over.
 */
export default function CompareAddSlot() {
  return (
    <div className="px-[19px] pt-[71px]">
      <div className="flex h-[170px] items-center justify-center rounded-xl bg-[#FAFAFA]">
        <Link
          href="/account/wishlist"
          className="flex items-center justify-center gap-2 rounded-full border border-[#E4E4E7] bg-white px-3 py-2 text-[14px] font-semibold leading-5 text-brand-primary transition-colors hover:bg-[#FAFAFA]"
        >
          <Plus className="h-5 w-5" />
          Add Package
        </Link>
      </div>
    </div>
  );
}
