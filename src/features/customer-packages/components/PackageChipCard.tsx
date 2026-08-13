import Image from "next/image";
import Link from "next/link";
import type { PackageCategoryItem } from "../types";
import PlaceholderMedia from "./PlaceholderMedia";

export default function PackageChipCard({ item, seed = 0 }: { item: PackageCategoryItem; seed?: number }) {
  return (
    <Link
      href={item.href}
      className="flex w-[34vw] shrink-0 snap-start flex-col gap-2 sm:w-[170px] sm:gap-3 md:w-[200px]"
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.title}
            fill
            sizes="(min-width: 768px) 200px, (min-width: 640px) 170px, 34vw"
            className="object-cover"
          />
        ) : (
          <PlaceholderMedia seed={seed} className="absolute inset-0" />
        )}
      </div>
      <p className="font-figtree text-[13px] font-semibold text-brand-950 sm:text-[15px]">{item.title}</p>
    </Link>
  );
}
