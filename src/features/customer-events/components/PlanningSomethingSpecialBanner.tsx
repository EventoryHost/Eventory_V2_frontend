import Image from "next/image";

export default function PlanningSomethingSpecialBanner() {
  return (
    <div className="mx-auto mt-16 w-full max-w-[1440px] px-4 sm:px-6 lg:px-16">
    <section className="relative min-h-[312px] w-full overflow-hidden rounded-[44px] bg-[#FFF0F2]">
      {/* Photo now fills the whole banner — left-to-right gradient (the
          banner's own background colour, not a generic black scrim) keeps
          the left side solid enough for the text to stay readable while
          still showing the photo through on the right. */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/customer/events/planningsomething.png"
          alt="Friends celebrating with confetti"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#FFF0F2] via-[#FFF0F2]/85 to-[#FFF0F2]/10 lg:to-transparent" />
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
    </div>
  );
}
