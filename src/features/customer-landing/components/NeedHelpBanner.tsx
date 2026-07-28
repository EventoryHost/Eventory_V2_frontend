import Image from "next/image";
import { ArrowRight } from "lucide-react";

export default function NeedHelpBanner() {
  return (
    <section className="relative mx-auto mt-16 min-h-[312px] w-full max-w-[1320px] overflow-hidden rounded-[44px] bg-[#FFF0F2]">
      <div className="absolute inset-y-0 right-0 w-full lg:w-[820px]">
        <Image
          src="/images/customer/needhelp.png"
          alt="People celebrating"
          fill
          className="object-cover scale-x-[-1]"
        />
      </div>

      <div className="relative z-10 flex h-full max-w-full lg:max-w-[656px] flex-col items-start justify-center gap-8 lg:gap-12 p-8 lg:p-12 text-left">
        <h2 className="font-figtree font-bold text-brand-950 text-[28px] sm:text-[32px] leading-[1.2] tracking-[-0.02em]">
          Need help planning your event?
        </h2>
        <p className="font-figtree font-normal text-[16px] leading-[1.5] tracking-[-0.01em] text-body-secondary max-w-md">
          Just tell us what you have in mind, from intimate gatherings to
          large-scale events, we&apos;ve got you covered.
        </p>
        <div className="flex items-center gap-6">
          <button
            type="button"
            className="rounded-full bg-brand-primary px-8 py-3 text-[15px] font-semibold text-white"
          >
            Know More
          </button>
          <button
            type="button"
            className="flex items-center gap-2 text-[15px] font-semibold text-brand-primary"
          >
            Talk to Our Team
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </section>
  );
}
