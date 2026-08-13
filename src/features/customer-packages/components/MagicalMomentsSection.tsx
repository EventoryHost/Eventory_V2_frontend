import Image from "next/image";
import type { MagicalMomentsBlock } from "../types";
import PackagePromoCard from "./PackagePromoCard";
import PlaceholderMedia from "./PlaceholderMedia";
import ScrollableRow from "./ScrollableRow";

export default function MagicalMomentsSection({ data }: { data: MagicalMomentsBlock }) {
  return (
    <section className="w-full bg-campaign-blue py-12 sm:py-16 lg:py-20">
      <div className="flex flex-col items-center px-4 text-center sm:px-6 lg:px-8">
        <span className="mb-3 rounded-full bg-white px-5 py-2 font-figtree text-[11px] font-bold tracking-widest text-brand-primary uppercase sm:mb-4 sm:px-6 sm:text-[12px]">
          {data.eyebrow}
        </span>
        <h2 className="-rotate-1 rounded-lg bg-campaign-yellow px-6 py-2 font-figtree text-[32px] font-bold text-brand-950 sm:px-10 sm:py-3 sm:text-[48px] lg:text-[64px]">
          {data.title}
        </h2>
      </div>

      <div className="mt-8 px-4 sm:mt-12 sm:px-6 lg:px-8">
        <div className="relative h-[220px] w-full overflow-hidden rounded-2xl border-4 border-white shadow-2xl sm:h-[380px] sm:rounded-[32px] lg:h-[500px] lg:border-8">
          {data.campaignImage ? (
            <Image
              src={data.campaignImage}
              alt={data.title}
              fill
              sizes="100vw"
              className="object-cover"
            />
          ) : (
            <PlaceholderMedia seed={3} className="absolute inset-0" />
          )}
        </div>
      </div>

      <div className="mt-8 sm:mt-12">
        <ScrollableRow contentClassName="px-4 pb-6 sm:px-6 lg:px-8">
          {data.packages.map((item, i) => (
            <PackagePromoCard key={item.id} item={item} seed={i} variant="campaign" />
          ))}
        </ScrollableRow>
      </div>
    </section>
  );
}
