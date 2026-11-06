import Image from "next/image";
import type { MagicalMomentsBlock } from "../types";
import PackagePromoCard from "./PackagePromoCard";
import PlaceholderMedia from "./PlaceholderMedia";
import ScrollableRow from "./ScrollableRow";

export default function MagicalMomentsSection({ data }: { data: MagicalMomentsBlock }) {
  return (
    <section className="w-full bg-[#EAF2FF] py-12 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-16">
        {/* One frame for the whole section: the collage up top, the package
            cards below it, both inside the same bordered/shadowed shape —
            previously two separate pieces (a bordered image, then a bare
            row of cards sitting directly on the section background). */}
        <div className="relative overflow-hidden rounded-2xl border-4 border-white bg-[#EAF2FF] shadow-2xl sm:rounded-[32px] lg:border-8">
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
              {/* PM-reported 2026-11-02: no colour at all behind the title —
                  purely a blur of the photo itself — and no hard-edged box;
                  the blur has to fade out at its own edges.
                  A plain `backdrop-blur` always has a hard edge (it blurs
                  exactly the element's box, nothing softer), so the fade is
                  done with a CSS mask: a radial-gradient mask-image, opaque
                  in the middle and transparent at the rim, applied to the
                  same element that carries the backdrop-blur. That lets the
                  blur itself taper off at the edges instead of cutting off
                  in a rectangle — no background colour anywhere in this
                  layer. Text sits in a separate, unmasked layer on top so it
                  stays fully sharp and opaque. */}
              <span className="relative px-8 py-4 sm:px-12 sm:py-5">
                <span
                  aria-hidden="true"
                  className="absolute -inset-6 backdrop-blur-lg sm:-inset-10 sm:backdrop-blur-xl"
                  style={{
                    maskImage: "radial-gradient(ellipse at center, black 35%, transparent 75%)",
                    WebkitMaskImage: "radial-gradient(ellipse at center, black 35%, transparent 75%)",
                  }}
                />
                <h2 className="relative font-figtree text-[28px] font-bold text-brand-950 sm:text-[40px] lg:text-[56px]">
                  {data.title}
                </h2>
              </span>
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
