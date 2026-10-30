import { Award, ShieldCheck, Headphones, BadgePercent } from "lucide-react";

const FEATURES = [
  {
    icon: Award,
    title: "Verified Vendors",
    description:
      "Every vendor is thoroughly vetted and verified for quality and reliability",
    variant: "pink",
  },
  {
    icon: ShieldCheck,
    title: "Secure Booking",
    description:
      "Your payments are protected with bank-grade security and guarantees",
    variant: "cream",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    description:
      "Dedicated support team available round the clock to assist you",
    variant: "cream",
  },
  {
    icon: BadgePercent,
    title: "Best Price Gaurantee",
    description:
      "Transparent pricing with no hidden costs. Get the best deals guaranteed",
    variant: "pink",
  },
] as const;

type Feature = (typeof FEATURES)[number];

// Figma node 1:7626 — a plain static 2x2 grid, no interaction. Replaces the
// previous swipeable deck-of-cards version (PM request for this specific
// redesign superseded that earlier one); same 4 features/variant colors, so
// no data changes, just the layout.
function FeatureCard({ feature }: { feature: Feature }) {
  const isPink = feature.variant === "pink";
  const Icon = feature.icon;
  return (
    <div
      className={`relative mt-6 flex flex-col gap-4 rounded-tl-[4px] rounded-tr-2xl rounded-br-2xl rounded-bl-2xl px-6 pt-11 pb-6 ${
        isPink ? "bg-[#F0596F]" : "bg-[#FFF9F1]"
      }`}
    >
      <span
        className={`absolute -top-6 left-4 flex h-12 w-12 -rotate-[11.25deg] items-center justify-center rounded-full border-2 ${
          isPink ? "border-[#F0596F] bg-[#FFF9F1] text-[#F0596F]" : "border-[#FFF9F1] bg-[#F0596F] text-white"
        }`}
      >
        <Icon size={20} />
      </span>
      <h3 className={`font-figtree text-[24px] font-semibold tracking-[-0.02em] ${isPink ? "text-white" : "text-[#3C060D]"}`}>
        {feature.title}
      </h3>
      <p
        className={`font-figtree text-[16px] leading-[1.5] font-medium tracking-[-0.01em] ${
          isPink ? "text-white/90" : "text-[#3C060D]"
        }`}
      >
        {feature.description}
      </p>
    </div>
  );
}

export default function WhyChooseEventory() {
  return (
    <section className="mx-auto mt-16 grid w-full max-w-[1440px] grid-cols-1 gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-16">
      <div className="flex flex-col gap-3">
        <span className="font-figtree text-[13px] font-bold uppercase tracking-wider text-[#F0596F]">
          Why choose eventory
        </span>
        <h2 className="font-figtree font-semibold text-brand-950 text-[36px] leading-[1.1] tracking-[-0.02em]">
          Why smart planners choose Eventory
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2">
        {FEATURES.map((feature) => (
          <FeatureCard key={feature.title} feature={feature} />
        ))}
      </div>
    </section>
  );
}
