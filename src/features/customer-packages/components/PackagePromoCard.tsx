import Image from "next/image";
import Link from "next/link";
import type { PackageCategoryItem } from "../types";
import { formatStartingPrice } from "../utils/formatPrice";
import PlaceholderMedia from "./PlaceholderMedia";

export default function PackagePromoCard({
  item,
  seed = 0,
  variant = "default",
}: {
  item: PackageCategoryItem;
  seed?: number;
  /** "campaign" = shown over the Magical Moments blue background: shadow instead of border. */
  variant?: "default" | "campaign";
}) {
  return (
    <Link
      href={item.href}
      className={`w-[72vw] shrink-0 snap-start overflow-hidden rounded-2xl bg-white sm:w-[260px] md:w-[290px] ${
        variant === "campaign" ? "shadow-lg" : "border border-black/5"
      }`}
    >
      <div className="relative aspect-[4/3] w-full">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.title}
            fill
            sizes="(min-width: 768px) 290px, (min-width: 640px) 260px, 72vw"
            className="object-cover"
          />
        ) : (
          <PlaceholderMedia seed={seed} label={item.title} className="absolute inset-0" />
        )}
      </div>
      <div className="flex flex-col gap-1 p-4">
        <p className="font-figtree text-[15px] font-bold text-brand-950 sm:text-[16px]">{item.title}</p>
        {item.priceFrom !== undefined && (
          <p className="font-figtree text-[13px] font-medium text-brand-primary">
            {formatStartingPrice(item.priceFrom)}
          </p>
        )}
      </div>
    </Link>
  );
}
