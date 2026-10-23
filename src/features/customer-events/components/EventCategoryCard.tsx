import Image from "next/image";
import Link from "next/link";

export type EventCategoryCardProps = {
  image: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
};

export default function EventCategoryCard({
  image,
  title,
  subtitle,
  ctaLabel,
}: EventCategoryCardProps) {
  return (
    <Link
      href="/packages"
      className="relative block h-[420px] w-[320px] shrink-0 overflow-hidden rounded-[28px] border border-white/30 sm:w-[520px] lg:h-[450px] lg:w-[926px] lg:rounded-[52px]"
    >
      {/* PM-reported, 2026-10-23: a flat full-card blur read as "the whole
          photo is blurry" rather than a design choice, so this is now a
          PROGRESSIVE blur — strong over the left text area, fading out to
          a fully sharp photo by the card's right half — plus a dark wash
          over that same left portion just enough for the white text to
          read clearly. */}
      <Image src={image} alt={title} fill className="object-cover" />
      <div
        className="absolute inset-0"
        style={{
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          maskImage: "linear-gradient(to right, black 0%, black 35%, transparent 60%)",
          WebkitMaskImage: "linear-gradient(to right, black 0%, black 35%, transparent 60%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to left, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.55) 100%)",
        }}
      />

      <div className="relative z-10 flex h-full max-w-[520px] flex-col items-start justify-center gap-4 px-6 py-8 lg:max-w-[700px] lg:gap-6 lg:px-14">
        <h3 className="max-w-[634px] font-figtree text-[26px] sm:text-[32px] lg:text-[48px] font-semibold leading-[1.1] lg:leading-[56px] tracking-[-0.02em] lg:tracking-[-0.5px] text-white drop-shadow-[0_0_8.38px_rgba(0,0,0,0.25)]">
          {title}
        </h3>
        <p className="font-figtree text-[15px] lg:text-[24px] font-normal leading-[1.4] lg:leading-[32px] tracking-[-0.02em] lg:tracking-normal text-white/85 drop-shadow-[0_0_8.38px_rgba(0,0,0,0.25)]">
          {subtitle}
        </p>

        <span className="mt-2 inline-block rounded-2xl bg-white px-6 py-3 lg:px-[34px] lg:py-3">
          <span className="font-figtree text-[16px] leading-none font-semibold text-brand-primary lg:text-[20px] lg:leading-[28px]">
            {ctaLabel}
          </span>
        </span>
      </div>
    </Link>
  );
}
