import { Trash2, Heart } from "lucide-react";
import RefundPolicyLink from "./RefundPolicyLink";

export default function VendorActions({
  onRemove,
  onMoveToWishlist,
}: {
  onRemove: () => void;
  onMoveToWishlist: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-t border-black/5 pt-4">
      <RefundPolicyLink />
      <div className="flex flex-wrap gap-6 font-figtree text-[14px] font-semibold text-neutral-secondary">
        <button
          type="button"
          onClick={onRemove}
          className="flex items-center gap-1.5 transition-colors hover:text-brand-primary"
        >
          <Trash2 className="h-4 w-4" /> Remove
        </button>
        <button
          type="button"
          onClick={onMoveToWishlist}
          className="flex items-center gap-1.5 transition-colors hover:text-brand-primary"
        >
          <Heart className="h-4 w-4" /> Move To Wishlist
        </button>
      </div>
    </div>
  );
}
