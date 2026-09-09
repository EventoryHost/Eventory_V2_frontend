import type { CartVendor, RecommendedAddon } from "../types";
import PackageInfo from "./PackageInfo";
import AddedAddonsSection from "./AddedAddonsSection";
import AddonSection from "./AddonSection";

export default function CartItemRow({
  item,
  recommendedAddons,
  onToggleSelected,
  onRemove,
  onMoveToWishlist,
  onIncrementAddon,
  onDecrementAddon,
  onRemoveAddon,
  onAddRecommendedAddon,
}: {
  item: CartVendor;
  recommendedAddons: RecommendedAddon[];
  onToggleSelected: (id: string) => void;
  onRemove: (id: string) => void;
  onMoveToWishlist: (id: string) => void;
  onIncrementAddon: (itemId: string, addonId: string) => void;
  onDecrementAddon: (itemId: string, addonId: string) => void;
  onRemoveAddon: (itemId: string, addonId: string) => void;
  onAddRecommendedAddon: (addon: RecommendedAddon) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={item.selected}
          onChange={() => onToggleSelected(item.id)}
          aria-label={
            item.selected
              ? `Deselect ${item.package.title} for checkout`
              : `Select ${item.package.title} for checkout`
          }
          // text-* doesn't control a checkbox's checked-state fill color —
          // that's accent-color — which is why this rendered the browser's
          // default blue instead of following the app's own selection color
          // (same fix as the /vendors filter checkboxes: accent-black, no
          // separate border/focus-ring classes, which would otherwise show
          // as a visible edge around the already-filled box).
          //
          // items-center on the row below (not items-start) is what keeps
          // this vertically centered against the card beside it — not a
          // fixed margin, so it stays centered whether the card is short or
          // grows taller (a longer title, the add-ons drawer opening, etc.).
          className="h-4 w-4 shrink-0 rounded accent-black outline-none"
        />

        <div className="min-w-0 flex-1">
          {!item.packageStillAvailable && (
            <span className="mb-2 inline-block rounded-full bg-error-subtle px-2.5 py-1 font-figtree text-[11px] font-semibold text-error-700">
              No longer available
            </span>
          )}

          {/* max-w/min-h (not a hard h-[237px]) so a longer title, wrapping
              event details, or the add-ons drawer underneath never get
              clipped to fit the spec's 848x237 box — the box is a target
              size, not a cap. */}
          <div className="max-w-212 overflow-hidden rounded-3xl border border-neutral-subtle bg-white shadow-sm md:min-h-59.25">
            <PackageInfo
              cartPackage={item.package}
              eventDetails={item.eventDetails}
              specialRequest={item.specialRequest}
              onRemove={() => onRemove(item.id)}
              onMoveToWishlist={() => onMoveToWishlist(item.id)}
            />

            {item.addons.length > 0 && (
              <AddedAddonsSection
                addons={item.addons}
                onIncrement={(addonId) => onIncrementAddon(item.id, addonId)}
                onDecrement={(addonId) => onDecrementAddon(item.id, addonId)}
                onRemove={(addonId) => onRemoveAddon(item.id, addonId)}
              />
            )}
          </div>
        </div>
      </div>

      {recommendedAddons.length > 0 && (
        <AddonSection addons={recommendedAddons} onAdd={onAddRecommendedAddon} />
      )}
    </div>
  );
}
