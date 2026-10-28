import Image from "next/image";
import type { MagicalMomentsBlock } from "../types";
import PackagePromoCard from "./PackagePromoCard";
import PlaceholderMedia from "./PlaceholderMedia";
import ScrollableRow from "./ScrollableRow";

export default function MagicalMomentsSection({ data }: { data: MagicalMomentsBlock }) {
  return (
    <section className="w-full bg-campaign-blue py-12 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-16">
        {/* One frame for the whole section: the collage up top, the package
            cards below it, both inside the same bordered/shadowed shape —
            previously two separate pieces (a bordered image, then a bare
            row of cards sitting directly on the section background). */}
        <div className="relative overflow-hidden rounded-2xl border-4 border-white bg-campaign-blue shadow-2xl sm:rounded-[32px] lg:border-8">
          <div className="relative h-[260px] w-full sm:h-[420px] lg:h-[540px]">
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

            {/* "Celebrate Joy" + "Magical Moments", moved from above the
                collage to overlaid at its bottom. */}
            <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-3 px-4 pt-20 pb-6 text-center sm:gap-4 sm:pb-8">
              <span className="rounded-full bg-white px-5 py-2 font-figtree text-[11px] font-bold tracking-widest text-brand-primary uppercase shadow-lg sm:px-6 sm:text-[12px]">
                {data.eyebrow}
              </span>
              <h2 className="-rotate-1 rounded-lg bg-campaign-yellow px-6 py-2 font-figtree text-[28px] font-bold text-brand-950 shadow-lg sm:px-10 sm:py-3 sm:text-[40px] lg:text-[56px]">
                {data.title}
              </h2>
            </div>
          </div>

          <ScrollableRow contentClassName="px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
            {data.packages.map((item, i) => (
              <PackagePromoCard key={item.id} item={item} seed={i} variant="campaign" />
            ))}
          </ScrollableRow>
        </div>
      </div>
    </section>
  );
}
