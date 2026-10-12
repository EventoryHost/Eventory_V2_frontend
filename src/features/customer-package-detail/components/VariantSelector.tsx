import Image from "next/image";
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
      {/* Desktop/tablet layout — unchanged. */}
      <div className="hidden md:block">
        <p className="mb-4 font-figtree text-[14px] leading-[20px] font-normal align-middle">
          Variant Selected:{" "}
          <span className="font-semibold text-[#030303]">{selected?.label}</span>{" "}
          <span className="font-semibold text-[#030303]">
            {selected && formatPrice(selected.price)}
          </span>
        </p>

        <div
          role="radiogroup"
          aria-label="Package variant"
          className="grid grid-cols-1 gap-4 sm:grid-cols-3"
        >
        {variants.map((variant, i) => {
          const isSelected = variant.id === selectedId;
          return (
            <button
              key={variant.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onSelect(variant.id)}
              className={`relative mx-auto flex h-[300.61px] w-full max-w-[257.38px] flex-col overflow-hidden rounded-[24px] border-[2.5px] bg-white text-left transition ${
                isSelected
                  ? "border-[#F0596F]"
                  : "border-[#E4E4E7] hover:border-black/20"
              }`}
            >
              {/*
                Image is a shrink-0 flex row (not an absolute-fill Image inside
                a fixed-height sibling) — deliberately avoids relying on
                next/image's `fill` positioning resolving against this
                container's computed height, which is where an unexplained
                blank-space-above-the-image bug kept showing up.
              */}
              <div className="relative h-[159.61px] w-full shrink-0 overflow-hidden">
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
                    isSelected
                      ? "border-[#F0596F] bg-brand-primary text-white"
                      : "border-[#E4E4E7] bg-[#FFFFFFE5]"
                  }`}
                >
                  {isSelected && (
                    <Check className="h-3.5 w-3.5" strokeWidth={3} />
                  )}
                </span>
              </div>

              <div className="flex flex-1 flex-col overflow-hidden p-3">
                <div className="mb-1 flex items-start justify-between gap-2">
                  <h3 className="font-figtree text-[16px] leading-[24px] font-semibold tracking-[-0.24px] text-[#030303]">
                    {variant.label}
                  </h3>
                  <span className="shrink-0 font-figtree text-[11px] leading-[16px] font-normal text-[#3F3F47]">
                    {variant.setupsCount > 0 &&
                      `${variant.setupsCount} setup${variant.setupsCount > 1 ? "s" : ""} · `}
                    {variant.itemsCount} items
                  </span>
                </div>
                <p className="mb-2 truncate font-figtree text-[14px] leading-[20px] font-normal text-[#3F3F47]">
                  {variant.description}
                </p>

                <div className="mt-auto flex items-baseline gap-2">
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
                  <div className="mt-0.5 font-figtree text-[11px] text-neutral-tertiary">
                    {variant.compareNote}
                  </div>
                )}
              </div>
            </button>
          );
        })}
        </div>
      </div>

      {/* Mobile layout (Figma node 2565:27923) — a white, rounded card
          wrapping its own "Choose your variant" header, a horizontally
          scrolling row of compact variant cards, and a footer line that
          jumps to the What's Included section. */}
      <div className="flex flex-col gap-[14px] rounded-[20px] bg-white py-4 md:hidden">
        <div className="flex items-center justify-between px-4">
          <p className="font-figtree text-[16px] font-semibold text-[#222]">Choose your variant</p>
          <p className="font-figtree text-[12px] text-[#71717B]">{variants.length} options</p>
        </div>

        <div
          role="radiogroup"
          aria-label="Package variant"
          className="flex w-full gap-[10px] overflow-x-auto px-4"
        >
          {variants.map((variant, i) => {
            const isSelected = variant.id === selectedId;
            return (
              <button
                key={variant.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => onSelect(variant.id)}
                className={`flex w-[140px] shrink-0 flex-col overflow-hidden rounded-[16px] border bg-white text-left ${
                  isSelected ? "border-[1.5px] border-[#F0596F]" : "border-[#E4E4E7]"
                }`}
              >
                <div className="relative h-[88px] w-[140px] shrink-0 overflow-hidden bg-[#F4F4F5]">
                  {variant.image ? (
                    <img src={variant.image} alt={variant.label} className="block h-full w-full object-cover" />
                  ) : (
                    <PlaceholderMedia seed={i} className="absolute inset-0" />
                  )}

                  {variant.badge && (
                    <span className="absolute top-2 left-2 rounded-full bg-white px-2 py-[3px] font-figtree text-[11px] font-semibold whitespace-nowrap text-[#222]">
                      {variant.badge}
                    </span>
                  )}

                  {isSelected ? (
                    <Image
                      src="/images/customer/package-detail/variant-check-circle.svg"
                      alt=""
                      width={22}
                      height={22}
                      className="absolute top-2 right-2"
                    />
                  ) : (
                    <span className="absolute top-2 right-2 h-5 w-5 rounded-[10px] border-[1.5px] border-[#E4E4E7] bg-white" />
                  )}
                </div>

                <div className="flex flex-col gap-1 p-[10px]">
                  <p className="font-figtree text-[16px] font-semibold whitespace-nowrap text-[#222]">
                    {variant.label}
                  </p>
                  <p className="font-figtree text-[11px] whitespace-nowrap text-[#71717B]">
                    {variant.setupsCount > 0 &&
                      `${variant.setupsCount} setup${variant.setupsCount > 1 ? "s" : ""} · `}
                    {variant.itemsCount} items
                  </p>
                  <p className="line-clamp-2 font-figtree text-[12px] leading-4 text-[#3F3F47]">
                    {variant.description}
                  </p>
                  <div className="flex items-baseline gap-1.5 pt-1">
                    <span className="font-figtree text-[16px] font-semibold whitespace-nowrap text-[#222]">
                      {formatPrice(variant.price)}
                    </span>
                    {variant.originalPrice && (
                      <span className="font-figtree text-[11px] whitespace-nowrap text-[#71717B] line-through">
                        {formatPrice(variant.originalPrice)}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {selected && (
          <p className="flex flex-wrap gap-1 px-4 font-figtree text-[12px]">
            <span className="text-[#3F3F47]">
              {selected.label} includes
              {selected.setupsCount > 0 && ` ${selected.setupsCount} setup${selected.setupsCount > 1 ? "s" : ""} ·`}{" "}
              {selected.itemsCount} items.
            </span>
            <a href="#included" className="font-medium text-[#F0596F]">
              See what&apos;s included ↓
            </a>
          </p>
        )}
      </div>
    </section>
  );
}
