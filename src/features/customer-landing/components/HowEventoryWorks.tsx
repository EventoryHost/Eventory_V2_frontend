const STEPS = [
  {
    number: "1",
    title: "Tell us what you need",
    description:
      "Share your event type, location, and date. Browse curated packages tailored to your requirements.",
  },
  {
    number: "2",
    title: "Compare & Add to cart",
    description:
      "See transparent pricing, real reviews, and detailed inclusions. Add your favorites to cart.",
  },
  {
    number: "3",
    title: "Book & Celebrate",
    description:
      "Confirm your booking with our secure process. We handle coordination with vendors.",
  },
];

export default function HowEventoryWorks() {
  return (
    <section className="mx-auto mt-16 w-full max-w-[1320px]">
      <span className="font-figtree text-[13px] font-bold uppercase tracking-wider text-[#F0596F]">
        How eventory works
      </span>
      <h2 className="mt-2 font-figtree font-semibold text-brand-950 text-[28px] sm:text-[32px] leading-[1.2] tracking-[-0.02em]">
        Our Step-by-Step Platform Process
      </h2>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-8">
        {STEPS.map((step) => (
          <div key={step.number} className="flex flex-col gap-4">
            <div className="relative aspect-square w-full max-w-[424px] rounded-[28px] border-4 border-[#FFF0DB] bg-white">
              <span
                className="absolute -bottom-1 -left-1 flex h-14 items-center justify-center rounded-[50px] bg-[#FFF0DB] px-3 py-[1px] font-figtree text-[20px] font-bold text-[#3C060D]"
                style={{ minWidth: "56px" }}
              >
                {step.number}
              </span>
            </div>

            <div className="flex flex-col gap-2">
              <h3 className="font-figtree text-[18px] font-bold text-[#F0596F]">
                {step.title}
              </h3>
              <p className="font-figtree text-[14px] font-normal leading-[1.5] text-body-secondary">
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
