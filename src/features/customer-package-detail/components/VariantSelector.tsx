import { Check } from "lucide-react";
import type { PackageVariant } from "../types";
import { formatPrice } from "../utils/formatPrice";
import PlaceholderMedia from "./PlaceholderMedia";

export default function VariantSelector({
  variants,
  selectedId,
  onSelect,
}: {
  variants: PackageVariant[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const selected = variants.find((variant) => variant.id === selectedId);

  return (
    <section id="overview">
      <p className="mb-4 font-figtree text-[14px] leading-[20px] font-normal align-middle">
        Variant Selected:{" "}
        <span className="font-semibold text-[#030303]">{selected?.label}</span>{" "}
        <span className="font-semibold text-[#030303]">{selected && formatPrice(selected.price)}</span>
      </p>

      <div role="radiogroup" aria-label="Package variant" className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {variants.map((variant, i) => {
          const isSelected = variant.id === selectedId;
          return (
            <button
              key={variant.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onSelect(variant.id)}
              className={`relative mx-auto flex h-[298px] w-full max-w-[257px] flex-col overflow-hidden rounded-[24px] border bg-white text-left transition ${
                isSelected ? "border-[1.5px] border-[#F0596F]" : "border-[#E4E4E7] hover:border-black/20"
              }`}
            >
              {/*
                Image is a shrink-0 flex row (not an absolute-fill Image inside
                a fixed-height sibling) — deliberately avoids relying on
                next/image's `fill` positioning resolving against this
                container's computed height, which is where an unexplained
                blank-space-above-the-image bug kept showing up.
              */}
              <div className="relative h-[160px] w-full shrink-0 overflow-hidden">
                {variant.image ? (
                  <img
                    src={variant.image}
                    alt={variant.label}
                    className="block h-full w-full object-cover"
                  />
                ) : (
                  <PlaceholderMedia seed={i} className="absolute inset-0" />
                )}

                {variant.badge && (
                  <span className="absolute top-2 left-2 z-10 flex h-6 w-[86px] items-center justify-center rounded-full bg-white px-2.5 font-figtree text-[11px] leading-[16px] font-semibold text-[#030303] shadow-sm">
                    {variant.badge}
                  </span>
                )}
                <span
                  className={`absolute top-2 right-2 z-10 flex h-6 w-6 items-center justify-center rounded-full border ${
                    isSelected ? "border-[#F0596F] bg-brand-primary text-white" : "border-[#E4E4E7] bg-[#FFFFFFE5]"
                  }`}
                >
                  {isSelected && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                </span>
              </div>

              <div className="flex flex-1 flex-col overflow-hidden p-3">
                <div className="mb-1 flex items-start justify-between gap-2">
                  <h3 className="font-figtree text-[16px] leading-[24px] font-semibold tracking-[-0.24px] text-[#030303]">
                    {variant.label}
                  </h3>
                  <span className="shrink-0 font-figtree text-[11px] leading-[16px] font-normal text-[#3F3F47]">
                    {variant.setupsCount} setup{variant.setupsCount > 1 ? "s" : ""} · {variant.itemsCount} items
                  </span>
                </div>
                <p className="mb-2 truncate font-figtree text-[14px] leading-[20px] font-normal text-[#3F3F47]">
                  {variant.description}
                </p>

                <div className="flex items-baseline gap-2">
                  {variant.originalPrice && (
                    <span className="font-figtree text-[12px] text-neutral-tertiary line-through">
                      {formatPrice(variant.originalPrice)}
                    </span>
                  )}
                  <span className="font-figtree text-[18px] leading-[24px] font-bold text-[#030303]">
                    {formatPrice(variant.price)}
                  </span>
                </div>
                {variant.compareNote && (
                  <div className="mt-0.5 font-figtree text-[11px] text-neutral-tertiary">{variant.compareNote}</div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
