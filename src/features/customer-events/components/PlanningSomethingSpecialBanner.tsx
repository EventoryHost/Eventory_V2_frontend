import Image from "next/image";

export default function PlanningSomethingSpecialBanner() {
  return (
    <section className="relative mx-auto mt-16 min-h-[312px] w-full max-w-[1320px] overflow-hidden rounded-[44px] bg-[#FFF0F2]">
      <div className="absolute inset-y-0 right-0 hidden w-[820px] lg:block">
        <Image
          src="/images/customer/needhelp.png"
          alt="Friends celebrating with confetti"
          fill
          className="object-cover scale-x-[-1]"
        />
      </div>

      <div className="relative z-10 flex h-full max-w-full lg:max-w-[656px] flex-col items-start justify-center gap-8 lg:gap-12 p-8 lg:p-12 text-left">
        <h2 className="font-figtree font-bold text-brand-950 text-[28px] sm:text-[32px] leading-[1.2] tracking-[-0.02em]">
          Planning something special?
        </h2>
        <p className="font-figtree font-normal text-[16px] leading-[1.5] tracking-[-0.01em] text-body-secondary max-w-md">
          Let our expert event planners help you create an unforgettable
          experience. Tell us about your vision and we&apos;ll make it
          happen.
        </p>
        <button
          type="button"
          className="rounded-full bg-brand-primary px-8 py-3 text-[15px] font-semibold text-white"
        >
          Talk to Us
        </button>
      </div>
    </section>
  );
}
