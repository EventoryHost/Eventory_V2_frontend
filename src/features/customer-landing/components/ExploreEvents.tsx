import Link from "next/link";
import NeedHelpImageCarousel from "./NeedHelpImageCarousel";

export default function ExploreEvents() {
  return (
    <div className="mx-auto mt-10 flex w-full max-w-[1320px] flex-col lg:flex-row items-center gap-8 lg:gap-10 rounded-3xl bg-[#FFFAF1] px-6 py-8 lg:px-10">
      <div className="relative w-full aspect-[744/480] overflow-hidden rounded-2xl lg:flex-1">
        <NeedHelpImageCarousel />
      </div>

      <div className="hidden lg:block w-px self-stretch bg-black/10" />

      <div className="w-full lg:flex-1 flex flex-col items-center gap-4 text-center">
        <h2 className="font-figtree font-bold text-brand-950 text-[28px] sm:text-[36px] leading-[1.1] tracking-[-0.02em]">
          Events reimagined for your ease
        </h2>
        <p className="font-figtree font-normal text-[16px] leading-[1.35] tracking-[-0.02em] text-body-secondary max-w-[420px]">
          Everything your event needs, booked together and handled by one team
          so you can actually be present at your own celebration.
        </p>
        <Link
          href="/events"
          className="mt-2 rounded-full bg-brand-primary px-8 py-3 text-[15px] font-semibold text-white"
        >
          Explore Events
        </Link>
      </div>
    </div>
  );
}
