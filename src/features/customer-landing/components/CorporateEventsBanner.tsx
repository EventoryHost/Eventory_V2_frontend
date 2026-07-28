import Image from "next/image";

export default function CorporateEventsBanner() {
  return (
    <section className="relative mx-auto mt-16 min-h-[320px] w-full max-w-[1320px] overflow-hidden rounded-[44px]">
      <Image
        src="/images/customer/planningcorp.jpg"
        alt="Corporate event"
        fill
        className="object-cover"
      />

      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(to right, #3C060D, transparent)",
        }}
      />

      <div className="relative z-10 flex h-full max-w-xl flex-col items-start gap-4 p-8 lg:p-12 text-left">
        <h2 className="font-figtree font-bold text-white text-[28px] sm:text-[32px] leading-[1.2] tracking-[-0.02em]">
          Planning Corporate Events?
        </h2>
        <p className="font-figtree font-normal text-[16px] leading-[1.5] tracking-[-0.01em] text-white/85">
          Corporate event planning made better with verified vendors&apos;
          coordination, a dedicated event manager, and professional
          on-ground execution.
        </p>
        <div className="mt-2 flex items-center gap-4">
          <button
            type="button"
            className="rounded-full bg-brand-primary px-8 py-3 text-[15px] font-semibold text-white"
          >
            Know More
          </button>
          <button
            type="button"
            className="rounded-full bg-white px-8 py-3 text-[15px] font-semibold text-brand-950"
          >
            Talk to Our Team
          </button>
        </div>
        <p className="mt-2 font-figtree text-[13px] font-medium text-white/70">
          Trusted by 200+ companies including Fortune 500 enterprises
        </p>
      </div>
    </section>
  );
}
