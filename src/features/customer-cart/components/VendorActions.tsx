import { formatPrice } from "../utils/currency";

// Figma node 3259:52570 — price on the left, "Wishlist | Remove" text actions
// with their own outline icons on the right.
const ACTION =
  "flex items-center gap-1.5 rounded-xl p-3 md:rounded-none md:p-0 font-figtree text-[12px] leading-4 font-medium text-[#71717B] transition-colors hover:text-neutral-primary";

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
    <div className="flex items-center justify-between">
      <span className="font-figtree text-[20px] leading-8 font-bold tracking-[-0.01em] text-black">
        {formatPrice(price)}
      </span>

      <div className="flex items-center md:gap-2">
        <button type="button" onClick={onMoveToWishlist} aria-label="Move to wishlist" className={ACTION}>
          <img src="/images/customer/cart/bookmark.svg" alt="" className="h-4 w-4" /> <span className="hidden md:inline">Wishlist</span>
        </button>
        <span className="hidden h-3 w-px bg-[#E4E4E7] md:block" aria-hidden="true" />
        <button type="button" onClick={onRemove} aria-label="Remove from cart" className={ACTION}>
          <img src="/images/customer/cart/minus-circle.svg" alt="" className="h-4 w-4" /> <span className="hidden md:inline">Remove</span>
        </button>
      </div>
    </div>
  );
}
