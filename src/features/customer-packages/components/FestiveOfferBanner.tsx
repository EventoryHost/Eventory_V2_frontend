import Image from "next/image";
import Link from "next/link";
import type { FestiveOffer } from "../types";
import PlaceholderMedia from "./PlaceholderMedia";

export default function FestiveOfferBanner({ offer }: { offer: FestiveOffer }) {
  return (
    <div className="relative mx-4 h-[300px] w-auto overflow-hidden rounded-[28px] text-center sm:mx-6 sm:h-[320px] sm:rounded-[40px] sm:text-left lg:mx-8">
      {offer.image ? (
        <Image src={offer.image} alt="" fill sizes="100vw" className="object-cover" />
      ) : (
        <PlaceholderMedia tone="dark" className="absolute inset-0" />
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/10" />

      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 sm:items-start sm:gap-6 sm:px-12">
        <div>
          <h3 className="font-figtree text-[24px] font-bold text-white sm:text-[36px]">{offer.title}</h3>
          <p className="mx-auto mt-2 max-w-[280px] font-figtree text-[13px] font-medium text-white/85 sm:mx-0 sm:max-w-none sm:text-[15px]">
            {offer.subtitle}
          </p>
        </div>

        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-6">
          <div>
            <p className="font-figtree text-[20px] font-bold text-white sm:text-[26px]">{offer.discountLabel}</p>
            <p className="font-figtree text-[11px] font-semibold tracking-wide text-white/70">
              {offer.discountCaption}
            </p>
          </div>
          <span className="hidden h-10 w-px bg-white/30 sm:block" />
          <Link
            href={offer.ctaHref}
            className="rounded-full bg-white px-5 py-2.5 font-figtree text-[13px] font-semibold text-brand-950 sm:px-6 sm:py-3 sm:text-[14px]"
          >
            {offer.ctaLabel}
          </Link>
        </div>
      </div>
    </div>
  );
}
