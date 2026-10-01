import Image from "next/image";

// Card 2 and card 6 are genuinely duplicates in the design handoff (both
// "Get Paid Fast & Secure", same copy, same icon) — kept as given rather
// than silently "fixed" to a different heading, since that would be
// inventing content not specified.
const STEPS = [
  {
    title: "Reach Thousands of Customers",
    description: "Put your business in front of couples and planners actively looking for vendors like you.",
    image: "/images/customer/become/reach.png",
  },
  {
    title: "Get Paid Fast & Secure",
    description: "Receive secure payments without constantly chasing clients for what you're owed.",
    image: "/images/customer/become/get.png",
  },
  {
    title: "Dedicated Support",
    description: "Our team is here to help you get set up, manage your business, and make the most of the platform.",
    image: "/images/customer/become/dedicated.png",
  },
  {
    title: "Manage Everything in One Place",
    description: "Manage bookings, your calendar, payments, and business insights from a single dashboard.",
    image: "/images/customer/become/manage.png",
  },
  {
    title: "Build Trust & Reputation",
    description: "Verified profiles, genuine reviews, and real customer feedback help you win more business.",
    image: "/images/customer/become/build.png",
  },
  {
    title: "Get Paid Fast & Secure",
    description: "Receive secure payments without constantly chasing clients for what you're owed.",
    image: "/images/customer/become/get.png",
  },
];

export default function WhyChooseSection() {
  return (
    // The section's own background still starts flush against the Hero
    // section above (no gap there), but its content ("Why Choose Eventory")
    // sits 48px below that background's top edge. Rounded bottom corners
    // only (not top, which would leave a visible gap at the flush edge
    // against Hero) — this cream block is its own self-contained section,
    // distinct from Grow Your Business right after it, which sits on a
    // plain white background, not this same cream.
    <section className="w-full rounded-b-[44px] bg-[#FFF8EB] px-4 pt-12 pb-16 sm:px-6 lg:px-16">
      <div className="mx-auto max-w-[1320px]">
        <p className="font-figtree text-[13px] leading-[18px] font-semibold tracking-[0.05em] text-[#EA1D3B] uppercase">
          Why Choose Eventory
        </p>
        <h2 className="mt-2 font-figtree text-[36px] leading-[44px] font-bold tracking-[-0.72px] text-[#030303]">
          Our Step-by-Step Platform Process
        </h2>

        <div className="mt-10 grid grid-cols-1 gap-[33px] sm:grid-cols-2 lg:grid-cols-3">
          {STEPS.map((step, index) => (
            <div
              key={`${step.title}-${index}`}
              className="flex w-full max-w-[414px] flex-col rounded-[24px] border border-[#FFE4B2] bg-white p-6"
            >
              <div className="relative h-[178px] w-full max-w-[304px]">
                <Image src={step.image} alt="" fill className="object-contain" />
              </div>
              <h3 className="mt-5 font-figtree text-[20px] leading-[28px] font-bold text-[#1E0306]">
                {step.title}
              </h3>
              <p className="mt-2 font-figtree text-[16px] leading-[24px] font-medium text-[#3F3F47]">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
