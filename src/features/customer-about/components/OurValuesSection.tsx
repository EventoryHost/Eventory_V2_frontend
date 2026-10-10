// Figma: https://www.figma.com/design/fKzA9Z3TJHMEL93WM31azx/Customer-Side---Final-Dev?node-id=2438-22237
// Note: all three cards carry the exact same body copy in the Figma file
// itself (placeholder text, not yet written per-card) — not a mistake made
// while implementing this.

type ValueCard = {
  label: string;
  quote: string;
  /** "primary" = the pink-themed first card; "neutral" = the cream-themed other two. */
  variant: "primary" | "neutral";
};

const CARDS: ValueCard[] = [
  {
    label: "Our Values",
    quote:
      "At Eventory, we believe clarity builds trust. We value structured planning, honest communication, and partnerships that actually deliver. Every event deserves accountability, not chaos, and that's the standard we hold ourselves to",
    variant: "primary",
  },
  {
    label: "Our Vision",
    quote:
      "At Eventory, we believe clarity builds trust. We value structured planning, honest communication, and partnerships that actually deliver. Every event deserves accountability, not chaos, and that's the standard we hold ourselves to",
    variant: "neutral",
  },
  {
    label: "Our Mission",
    quote:
      "At Eventory, we believe clarity builds trust. We value structured planning, honest communication, and partnerships that actually deliver. Every event deserves accountability, not chaos, and that's the standard we hold ourselves to",
    variant: "neutral",
  },
];

function ValueCardItem({ card }: { card: ValueCard }) {
  const isPrimary = card.variant === "primary";
  return (
    <div
      className={`relative flex flex-1 flex-col rounded-[28px] p-1 ${isPrimary ? "bg-[#F0596F]" : "bg-[#FFF0DB]"}`}
    >
      <div
        className={`relative flex flex-1 flex-col rounded-[24px] bg-white px-6 pt-10 pb-14 ${
          isPrimary ? "" : "border border-[#FFF0DB]"
        }`}
      >
        <span
          className={`font-figtree text-[80px] leading-[64px] font-bold ${
            isPrimary ? "text-[#F0596F]" : "text-[#3C060D]"
          }`}
        >
          &ldquo;
        </span>
        <p className="mt-2 font-figtree text-[16px] leading-[1.5] font-medium tracking-[-0.16px] text-[#3F3F47]">
          {card.quote}
        </p>
      </div>

      <div
        className={`absolute bottom-1 left-1 flex h-[56px] items-center rounded-tr-[50px] rounded-bl-[27px] pr-9 pl-6 ${
          isPrimary ? "bg-[#F0596F]" : "bg-[#FFF0DB]"
        }`}
      >
        <span
          className={`font-figtree text-[24px] font-bold tracking-[-0.5px] whitespace-nowrap ${
            isPrimary ? "text-white" : "text-[#3C060D]"
          }`}
        >
          {card.label}
        </span>
      </div>
    </div>
  );
}

export default function OurValuesSection() {
  return (
    <section className="w-full bg-[#FFF8EB] px-4 py-16 sm:px-6 lg:px-16">
      <div className="mx-auto flex max-w-[1312px] flex-col gap-4">
        <p className="font-figtree text-[16px] leading-[18px] font-semibold text-[#EA1D3B] uppercase [text-shadow:0_0_4px_rgba(0,0,0,0.1)]">
          What Drives Us
        </p>
        <h2 className="font-figtree text-[32px] leading-[1.1] font-semibold tracking-[-0.72px] text-[#030303] sm:text-[36px]">
          Our Values, Mission &amp; Vision
        </h2>

        <div className="mt-10 flex flex-col gap-6 lg:flex-row">
          {CARDS.map((card) => (
            <ValueCardItem key={card.label} card={card} />
          ))}
        </div>
      </div>
    </section>
  );
}
