import Link from "next/link";
import { Trash2, Bookmark, SquarePen } from "lucide-react";

export default function VendorActions({
  onRemove,
  onMoveToWishlist,
  editHref,
}: {
  onRemove: () => void;
  onMoveToWishlist: () => void;
  /** Package-detail page — editing a package's details now happens there instead of the old in-cart modal. */
  editHref: string;
}) {
  return (
    <div className="mt-6 flex items-center justify-between border-t border-neutral-subtle pt-4">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onRemove}
          className="flex items-center gap-2 font-figtree text-[13px] font-medium text-neutral-secondary transition-colors hover:text-neutral-primary"
        >
          <Trash2 className="h-4 w-4" /> Remove
        </button>
        <span className="h-4 w-px bg-neutral-subtle" aria-hidden="true" />
        <button
          type="button"
          onClick={onMoveToWishlist}
          className="flex items-center gap-2 font-figtree text-[13px] font-medium text-neutral-secondary transition-colors hover:text-neutral-primary"
        >
          <Bookmark className="h-4 w-4" /> Move To Wishlist
        </button>
      </div>

      <Link
        href={editHref}
        className="flex items-center gap-2 font-figtree text-[13px] font-semibold text-brand-primary transition-colors hover:text-brand-primary/80"
      >
        <SquarePen className="h-4 w-4" /> Edit Package Details
      </Link>
    </div>
  );
}
