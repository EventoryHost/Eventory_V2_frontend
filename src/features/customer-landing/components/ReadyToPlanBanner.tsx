import Image from "next/image";

export default function ReadyToPlanBanner() {
  return (
    <section
      className="relative mx-auto mt-16 h-auto min-h-[336px] w-full max-w-[1312px] overflow-hidden rounded-[32px] py-10 sm:rounded-[48px] lg:h-[336px] lg:py-0"
      style={{
        background: "linear-gradient(to right, #FFEFD0, #FCDFE2 50%, #FCDFE2)",
      }}
    >
      <div className="absolute inset-y-0 right-0 hidden w-1/2 lg:block">
        <Image
          src="/images/customer/ready-1.png"
          alt="Excited customers"
          fill
          className="object-cover"
        />
      </div>

      <div className="relative z-10 flex h-full max-w-[692px] flex-col items-start justify-center gap-4 px-8 lg:pl-12 lg:pr-0">
        <h2 className="font-figtree font-bold text-brand-950 text-[28px] sm:text-[32px] leading-[1.2] tracking-[-0.02em]">
          Ready to plan your perfect Event?
        </h2>
        <p className="w-full max-w-[692px] font-figtree font-normal text-[16px] leading-[22px] tracking-[-0.01em] text-body-secondary">
          Corporate event planning made better with verified vendors&apos;
          coordination, a dedicated event manager, and professional on-ground
          execution.
        </p>
        <button
          type="button"
          className="mt-2 rounded-full bg-brand-primary px-8 py-3 text-[15px] font-semibold text-white"
        >
          Get started - It&apos;s Free
        </button>
        <p className="font-figtree text-[13px] font-medium text-body-secondary">
          100% free to Browse &bull; Instant access
        </p>
      </div>
    </section>
  );
}
