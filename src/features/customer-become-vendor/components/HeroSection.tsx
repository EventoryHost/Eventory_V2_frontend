import Image from "next/image";
import Link from "next/link";

// Static placeholder — no vendor-count endpoint exists yet. Replace with a
// real fetched total once one does; explicitly not treated as live data
// until then (see CLAUDE session working rules: never silently present a
// hardcoded number as if it were real).
const TOTAL_VENDORS = "4503";

export default function HeroSection() {
  return (
    <section className="mx-auto flex max-w-[1360px] flex-col items-center gap-10 px-4 pt-14 pb-16 sm:pl-16 lg:flex-row lg:items-center lg:justify-between lg:gap-16 lg:pt-20 lg:pb-24">
      <div className="flex max-w-[620px] flex-col items-start gap-6 text-center lg:text-left">
        {/* Gradient border via a two-layer trick: the outer layer IS the
            gradient "border" (1px padding reveals it), the inner layer
            holds the actual pink→white background at radius-1. Plain
            `border` + `border-image` ignores border-radius in most
            browsers, so it can't be used for a rounded gradient border. */}
        <div className="rounded-[49px] bg-[linear-gradient(90deg,_#FFE0E4_0%,_#FFFFFF_100%)] p-px">
          <div className="flex items-center gap-1 rounded-[48px] bg-[linear-gradient(90deg,_#FFF0F2_0%,_#FFFFFF_100%)] px-[9px] py-[7px]">
            <span className="font-figtree text-[14px] leading-[16px] font-semibold tracking-[-0.56px] text-[#030303]">
              Total Number of Vendors on Eventory:
            </span>
            <span className="font-figtree text-[14px] leading-[16px] font-bold tracking-[-0.56px] text-[#EA1D3B]">
              {TOTAL_VENDORS}
            </span>
          </div>
        </div>

        <h1 className="font-figtree text-[36px] leading-[44px] font-semibold tracking-[-1.8px] text-[#3F3F47] sm:text-[44px] sm:leading-[52px] lg:text-[56px] lg:leading-[64px] lg:tracking-[-2.8px]">
          Where Inquiries turn into{" "}
          <span className="font-bold text-[#030303]">Bookings</span>
        </h1>

        <p className="font-figtree text-[16px] leading-[24px] font-medium text-[#71717B]">
          Description about the hero line
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 lg:justify-start">
          <Link
            href="/register"
            className="flex h-11 w-[140px] items-center justify-center rounded-[52px] bg-[#F0596F] font-figtree text-[15px] font-semibold text-white transition hover:bg-rose-600"
          >
            Register Now
          </Link>
          <Link
            href="/contact"
            className="flex h-11 w-[123px] items-center justify-center rounded-[52px] bg-[#FDEEF0] font-figtree text-[15px] font-semibold text-[#F0596F] transition hover:bg-[#FBE0E5]"
          >
            Contact Us
          </Link>
        </div>
      </div>

      {/* Real file is 1145x1374 (portrait) — taller than the 418x384 box the
          design gave, so object-contain (not cover) is what shows the whole
          image without cropping; the box just caps how large it renders. */}
      <div className="relative w-full max-w-[418px] shrink-0">
        <Image
          src="/images/customer/become.png"
          alt="Vendors on Eventory — chef, decorator, DJ, makeup artist and photographer"
          width={1145}
          height={1374}
          className="h-auto max-h-[460px] w-full object-contain"
          priority
        />
      </div>
    </section>
  );
}
