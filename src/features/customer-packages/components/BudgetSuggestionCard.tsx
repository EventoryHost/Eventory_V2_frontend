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
      className="flex items-center gap-4 rounded-[20px] border border-[#FCDEE2] bg-white py-4 pr-5 pl-4 transition-shadow hover:shadow-[0px_4px_16px_rgba(0,0,0,0.06)]"
    >
      <div className="relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-xl">
        {suggestion.image ? (
          <Image src={suggestion.image} alt="" fill sizes="72px" className="object-cover" />
        ) : (
          <PlaceholderMedia seed={seed} className="absolute inset-0" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="font-figtree text-[14px] font-semibold text-[#333]">{suggestion.title}</p>
        <p className="truncate font-figtree text-[14px] text-[#808080]">{suggestion.description}</p>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <p className="font-figtree text-[16px] font-semibold whitespace-nowrap text-black">
            {formatStartingPackagePrice(suggestion.priceFrom)}
          </p>
          <span className="flex shrink-0 items-center gap-1.5 font-figtree text-[14px] font-semibold whitespace-nowrap text-[#EA1D3B]">
            Explore Packages
            <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}
