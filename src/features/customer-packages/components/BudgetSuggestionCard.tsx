import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { BudgetEstimatorSuggestion } from "../types";
import { formatStartingPackagePrice } from "../utils/formatPrice";
import PlaceholderMedia from "./PlaceholderMedia";

export default function BudgetSuggestionCard({
  suggestion,
  seed = 0,
}: {
  suggestion: BudgetEstimatorSuggestion;
  seed?: number;
}) {
  return (
    <Link
      href={suggestion.href}
      className="flex items-center gap-3 rounded-2xl border border-black/5 bg-white p-3 transition-shadow hover:shadow-[0px_4px_16px_rgba(0,0,0,0.06)]"
    >
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl">
        {suggestion.image ? (
          <Image src={suggestion.image} alt="" fill sizes="56px" className="object-cover" />
        ) : (
          <PlaceholderMedia seed={seed} className="absolute inset-0" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="font-figtree text-[13px] font-bold text-brand-950">{suggestion.vendorLabel}</p>
        <p className="truncate font-figtree text-[11px] text-neutral-tertiary">{suggestion.description}</p>
        <p className="font-figtree text-[12px] font-medium text-brand-950/70">
          {formatStartingPackagePrice(suggestion.priceFrom)}
        </p>
      </div>

      <span className="flex shrink-0 items-center gap-1 font-figtree text-[12px] font-semibold whitespace-nowrap text-brand-primary">
        Explore
        <ArrowRight className="h-3.5 w-3.5" />
      </span>
    </Link>
  );
}
