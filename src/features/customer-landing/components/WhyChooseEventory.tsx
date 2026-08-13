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

export default function WhyChooseEventory() {
  return (
    <section className="mx-auto mt-24 grid w-full max-w-[1320px] grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
      <div className="flex flex-col gap-3">
        <span className="font-figtree text-[13px] font-bold uppercase tracking-wider text-[#F0596F]">
          Why choose eventory
        </span>
        <h2 className="font-figtree font-semibold text-brand-950 text-[36px] leading-[1.1] tracking-[-0.02em]">
          Why smart planners choose Eventory
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-10">
        {FEATURES.map((feature) => {
          const isPink = feature.variant === "pink";
          const Icon = feature.icon;

          return (
            <div
              key={feature.title}
              className={`relative w-full min-h-[152px] rounded-tl-[4px] rounded-tr-2xl rounded-br-2xl rounded-bl-2xl pt-11 pr-6 pb-6 pl-6 ${
                isPink ? "bg-[#F0596F]" : "bg-[#FFF9F1]"
              }`}
            >
              <span
                className={`absolute -top-6 left-6 flex h-14 w-14 items-center justify-center rounded-full ${
                  isPink
                    ? "bg-[#FFF9F1] text-[#F0596F] border border-[#F0596F]"
                    : "bg-[#F0596F] text-[#FFF9F1]"
                }`}
              >
                <Icon size={22} />
              </span>

              <h3
                className={`font-figtree text-[20px] font-bold leading-[1.2] ${
                  isPink ? "text-white" : "text-brand-950"
                }`}
              >
                {feature.title}
              </h3>
              <p
                className={`mt-2 font-figtree text-[14px] font-normal leading-[1.4] ${
                  isPink ? "text-white/90" : "text-body-secondary"
                }`}
              >
                {feature.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
