import { Trash2, Bookmark } from "lucide-react";
import { formatPrice } from "../utils/currency";

export default function VendorActions({
  price,
  onRemove,
  onMoveToWishlist,
}: {
  price: number;
  onRemove: () => void;
  onMoveToWishlist: () => void;
}) {
  return (
    <div className="mt-6 flex items-center justify-between">
      <span
        className="font-figtree text-[20px] leading-[32px] font-bold tracking-[-0.01em] text-black"
        style={{ textAlign: "right" }}
      >
        {formatPrice(price)}
      </span>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMoveToWishlist}
          className="flex items-center gap-1.5 font-figtree text-[12px] leading-[16px] font-medium text-[#71717B] transition-colors hover:text-neutral-primary"
        >
          <Bookmark className="h-4 w-4" /> Wishlist
        </button>
        <span className="h-4 w-px bg-neutral-subtle" aria-hidden="true" />
        <button
          type="button"
          onClick={onRemove}
          className="flex items-center gap-1.5 font-figtree text-[12px] leading-[16px] font-medium text-[#71717B] transition-colors hover:text-neutral-primary"
        >
          <Trash2 className="h-4 w-4" /> Remove
        </button>
      </div>
    </div>
  );
}
