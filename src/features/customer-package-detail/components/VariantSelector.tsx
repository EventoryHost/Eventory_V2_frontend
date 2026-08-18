import Image from "next/image";
import { Check, CornerDownRight } from "lucide-react";
import type { PackageVariant } from "../types";
import { formatPrice } from "../utils/formatPrice";
import PlaceholderMedia from "./PlaceholderMedia";
import SectionHeading from "./SectionHeading";

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
      <SectionHeading>Choose a package</SectionHeading>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <p className="font-figtree text-[13px] text-neutral-secondary">
          Same team and styling — tiers differ by number of setups, item count and material quality.
        </p>
        <p className="shrink-0 font-figtree text-[13px] text-neutral-secondary">
          Selected: <span className="font-semibold text-brand-950">{selected?.label}</span>{" "}
          <span className="font-semibold text-brand-950">{selected && formatPrice(selected.price)}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {variants.map((variant, i) => {
          const isSelected = variant.id === selectedId;
          return (
            <button
              key={variant.id}
              type="button"
              onClick={() => onSelect(variant.id)}
              aria-pressed={isSelected}
              className={`relative overflow-hidden rounded-xl border text-left transition ${
                isSelected ? "border-2 border-brand-primary shadow-sm" : "border-black/10 hover:border-black/20"
              }`}
            >
              {variant.badge && (
                <span className="absolute top-2 left-2 z-10 rounded bg-white px-2 py-0.5 font-figtree text-[11px] font-bold text-brand-950 shadow-sm">
                  {variant.badge}
                </span>
              )}
              <span
                className={`absolute top-2 right-2 z-10 flex h-4 w-4 items-center justify-center rounded-full ${
                  isSelected ? "bg-brand-primary text-white" : "border border-black/20 bg-white/80"
                }`}
              >
                {isSelected && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
              </span>

              <div className="relative h-24 w-full">
                {variant.image ? (
                  <Image src={variant.image} alt={variant.label} fill sizes="220px" className="object-cover" />
                ) : (
                  <PlaceholderMedia seed={i} className="absolute inset-0" />
                )}
              </div>

              <div className="p-3">
                <div className="mb-1 flex items-start justify-between gap-2">
                  <h3 className="font-figtree font-bold text-brand-950">{variant.label}</h3>
                  <span className="shrink-0 font-figtree text-[11px] text-neutral-tertiary">
                    {variant.setupsCount} setup{variant.setupsCount > 1 ? "s" : ""} · {variant.itemsCount} items
                  </span>
                </div>
                <p className="mb-2 truncate font-figtree text-[12px] text-neutral-tertiary">{variant.description}</p>

                {variant.features && variant.features.length > 0 && (
                  <ul className="mb-3 space-y-1">
                    {variant.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-1.5 font-figtree text-[12px] text-neutral-secondary">
                        <CornerDownRight className="mt-0.5 h-3 w-3 shrink-0 text-brand-primary/70" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                )}

                <div className="flex items-baseline gap-2">
                  {variant.originalPrice && (
                    <span className="font-figtree text-[12px] text-neutral-tertiary line-through">
                      {formatPrice(variant.originalPrice)}
                    </span>
                  )}
                  <span className="font-figtree text-[16px] font-bold text-brand-950">{formatPrice(variant.price)}</span>
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
