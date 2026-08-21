import { Trash2, Heart, SquarePen } from "lucide-react";

export default function VendorActions({
  onRemove,
  onMoveToWishlist,
  onEdit,
}: {
  onRemove: () => void;
  onMoveToWishlist: () => void;
  onEdit: () => void;
}) {
  return (
    <div className="mt-6 flex items-center justify-between border-t border-neutral-subtle pt-4">
      <div className="flex gap-6">
        <button
          type="button"
          onClick={onRemove}
          className="flex items-center gap-2 font-figtree text-[13px] font-medium text-neutral-secondary transition-colors hover:text-neutral-primary"
        >
          <Trash2 className="h-4 w-4" /> Remove
        </button>
        <button
          type="button"
          onClick={onMoveToWishlist}
          className="flex items-center gap-2 font-figtree text-[13px] font-medium text-neutral-secondary transition-colors hover:text-neutral-primary"
        >
          <Heart className="h-4 w-4" /> Move To Wishlist
        </button>
      </div>

      <button
        type="button"
        onClick={onEdit}
        className="flex items-center gap-2 font-figtree text-[13px] font-semibold text-brand-primary transition-colors hover:text-brand-primary/80"
      >
        <SquarePen className="h-4 w-4" /> Edit Package Details
      </button>
    </div>
  );
}
