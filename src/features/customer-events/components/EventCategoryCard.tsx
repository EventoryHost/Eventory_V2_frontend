import Image from "next/image";
import Link from "next/link";

export type EventCategoryCardProps = {
  image: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  accentFrom: string;
  accentTo: string;
};

export default function EventCategoryCard({
  image,
  title,
  subtitle,
  ctaLabel,
  accentFrom,
  accentTo,
}: EventCategoryCardProps) {
  return (
    <Link
      href="/packages"
      className="relative block h-[420px] w-[320px] shrink-0 overflow-hidden rounded-[28px] border border-white/30 sm:w-[520px] lg:h-[534px] lg:w-[1100px] lg:rounded-[52px]"
    >
      <Image src={image} alt={title} fill className="object-cover" />

      {/* Progressive blur: sharp near top-left, blurring out toward bottom-right */}
      <div
        className="absolute inset-0"
        style={{
          backdropFilter: "blur(37.7px)",
          WebkitBackdropFilter: "blur(37.7px)",
          maskImage:
            "linear-gradient(to right, transparent 26.71%, black 103.9%), linear-gradient(to bottom, transparent 39.71%, black 93.01%)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent 26.71%, black 103.9%), linear-gradient(to bottom, transparent 39.71%, black 93.01%)",
          maskComposite: "intersect",
          WebkitMaskComposite: "source-in",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(to right, rgba(0,0,0,0.5), transparent 60%)",
        }}
      />

      <div className="relative z-10 flex h-full max-w-[520px] flex-col items-start justify-center gap-4 px-6 py-8 lg:max-w-[700px] lg:gap-6 lg:px-14">
        <h3 className="max-w-[634px] font-figtree text-[26px] sm:text-[32px] lg:text-[57.05px] font-bold leading-[1.1] lg:leading-none tracking-[-0.02em] lg:tracking-[-0.01em] capitalize text-white drop-shadow-[0_0_8.38px_rgba(0,0,0,0.25)]">
          {title}
        </h3>
        <p className="font-figtree text-[15px] lg:text-[33.71px] font-medium leading-[1.4] lg:leading-none tracking-[-0.02em] capitalize text-white/85 drop-shadow-[0_0_8.38px_rgba(0,0,0,0.25)]">
          {subtitle}
        </p>

        <span className="mt-2 inline-block rounded-full bg-white px-6 py-3 lg:px-8 lg:py-4">
          <span
            className="font-figtree text-[16px] lg:text-[24px] font-bold uppercase leading-none tracking-[-0.02em] bg-clip-text text-transparent"
            style={{
              backgroundImage: `linear-gradient(to right, ${accentFrom}, ${accentTo})`,
            }}
          >
            {ctaLabel}
          </span>
        </span>
      </div>
    </Link>
  );
}
