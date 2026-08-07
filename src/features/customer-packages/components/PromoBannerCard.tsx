import Image from "next/image";
import Link from "next/link";
import type { PromoBanner } from "../types";
import PlaceholderMedia from "./PlaceholderMedia";

export default function PromoBannerCard({ banner, seed = 0 }: { banner: PromoBanner; seed?: number }) {
  return (
    <div className="relative h-[210px] w-[82vw] shrink-0 snap-start overflow-hidden rounded-2xl sm:h-[250px] sm:w-[420px]">
      {banner.image ? (
        <Image
          src={banner.image}
          alt={banner.title.replace(/\n/g, " ")}
          fill
          sizes="(min-width: 640px) 420px, 82vw"
          className="object-cover"
        />
      ) : (
        <PlaceholderMedia seed={seed} tone="dark" className="absolute inset-0" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

      <div className="absolute inset-0 flex flex-col justify-between p-5 sm:p-6">
        <div>
          <h3 className="font-figtree text-[19px] font-bold leading-[1.25] whitespace-pre-line text-white sm:text-[22px]">
            {banner.title}
          </h3>
          <p className="mt-2 max-w-[260px] font-figtree text-[13px] font-medium leading-snug text-white/85">
            {banner.subtitle}
          </p>
        </div>

        <Link
          href={banner.ctaHref}
          className="w-fit rounded-full bg-white px-4 py-2 font-figtree text-[12px] font-bold uppercase tracking-wide text-brand-primary"
        >
          {banner.ctaLabel}
        </Link>
      </div>
    </div>
  );
}
