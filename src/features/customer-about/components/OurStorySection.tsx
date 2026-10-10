// Figma: https://www.figma.com/design/fKzA9Z3TJHMEL93WM31azx/Customer-Side---Final-Dev?node-id=2438-22170
// (header) through node-id=2438-22229 (last story dot) — the alternating
// timeline below the hero.

type Step = {
  tag: string;
  title: string;
  description: string;
  image: string;
  /** Which side the illustration sits on at desktop width — alternates every step (1,3,5 image-left/text-right; 2,4,6 text-left/image-right), matching the Figma layout exactly rather than a fixed pattern guessed from scratch. */
  imageSide: "left" | "right";
};

const STEPS: Step[] = [
  {
    tag: "2024 — THE IDEA",
    title: "It Started With a Frustration",
    description:
      "Event planning felt far more complicated than it should. Finding vendors meant jumping between Instagram, Google, referrals and WhatsApp. Prices were unclear, comparison was difficult, and coordinating everything became a job of its own. That frustration became the starting point for Eventory",
    image: "/images/customer/about-us-story-1.png",
    imageSide: "left",
  },
  {
    tag: "02 — 2024, THE FIRST STEP",
    title: "Listening Before Building",
    description:
      "Before building the solution, we started by understanding how the industry actually worked. Conversations with vendors and customers helped us understand pricing, quotations, negotiation, discovery and what creates trust before a booking",
    image: "/images/customer/about-us-story-2.png",
    imageSide: "right",
  },
  {
    tag: "03 — 2025, BUILDING THE SYSTEM",
    title: "Turning Learnings Into a Real Product",
    description:
      "In 2025, product, technology, sales, vendor onboarding and operations started coming together. What began as an idea was becoming a real system, shaped by what we were seeing and learning from the market.",
    image: "/images/customer/about-us-story-3.png",
    imageSide: "left",
  },
  {
    tag: "04 — EVENTORY V1",
    title: "Our First Real Journey",
    description:
      "V1 connected customers and vendors through discovery, quotations, conversations and booking. But it also taught us something important: discovery alone wasn't enough. Event services change with requirements, pricing, customisation, timing and add-ons — so the service itself needed to become structured.",
    image: "/images/customer/about-us-story-4.png",
    imageSide: "right",
  },
  {
    tag: "05 — 2026, BUILDING V2",
    title: "From Marketplace to Event Commerce",
    description:
      "V2 is being built around everything we learned from V1. Services are becoming structured products with packages, add-ons, pricing, availability and customisation — while conversations can turn into requirements, quotations and a smoother path to checkout.",
    image: "/images/customer/about-us-story-5.png",
    imageSide: "left",
  },
  {
    tag: "06 — TODAY & WHAT'S NEXT",
    title: "Building the Complete Event Journey",
    description:
      "Today, V1 is live, our vendor network is growing and V2 is being built. The next step is bigger: creating a place where someone can arrive with an event in mind and move through discovery, planning, customisation, quotations, payments, booking and eventually execution — all in one journey.",
    // Same illustration as step 5 — the Figma file itself reuses this one
    // asset for both steps (confirmed: both exports are byte-identical),
    // not a fetch mistake on this end.
    image: "/images/customer/about-us-story-5.png",
    imageSide: "right",
  },
];

// How far down the track (out of its full height) the solid pink "progress"
// fill extends before fading to the pale pink track colour — 274px of a
// 2176px line in Figma.
const PROGRESS_PERCENT = (274 / 2176) * 100;

function StepText({ step }: { step: Step }) {
  return (
    <div className="flex flex-col items-start gap-3">
      <p className="font-figtree text-[16px] leading-[18px] font-semibold tracking-[-0.02em] text-[#EA1D3B] uppercase">
        {step.tag}
      </p>
      <h3 className="font-figtree text-[24px] leading-[32px] font-semibold text-[#3C060D] sm:text-[28px] sm:leading-[36px]">
        {step.title}
      </h3>
      <p className="font-figtree text-[16px] leading-[1.5] font-medium tracking-[-0.16px] text-[#3F3F47]">
        {step.description}
      </p>
    </div>
  );
}

function StepImage({ step }: { step: Step }) {
  return (
    <img
      src={step.image}
      alt=""
      className="aspect-[394/266] w-full max-w-[394px] rounded-[20px] object-cover"
    />
  );
}

export default function OurStorySection() {
  return (
    <section className="w-full bg-white px-4 py-16 sm:px-6 lg:px-16">
      <div className="mx-auto flex max-w-[572px] flex-col items-center gap-2 text-center">
        <p className="font-figtree text-[16px] leading-[24px] font-semibold text-[#EA1D3B] uppercase [text-shadow:0_0_4px_rgba(0,0,0,0.1)]">
          Our Story
        </p>
        <h2 className="font-figtree text-[32px] leading-[40px] font-semibold tracking-[-0.5px] text-[#030303] sm:text-[36px]">
          How Eventory Came to Be
        </h2>
      </div>

      <div className="relative mx-auto mt-16 max-w-[1245px]">
        {/* Center timeline — desktop/tablet only; mobile just stacks the
            steps with no line (nothing to align it against in one column). */}
        <div className="absolute top-0 left-1/2 hidden h-full w-[8px] -translate-x-1/2 rounded-full bg-[#FDEEF0] lg:block">
          <div
            className="absolute inset-x-0 top-0 rounded-full bg-[#F0596F]"
            style={{ height: `${PROGRESS_PERCENT}%` }}
          />
        </div>

        <div className="flex flex-col gap-16 lg:gap-24">
          {STEPS.map((step) => (
            <div
              key={step.tag}
              className="relative grid grid-cols-1 items-center gap-6 lg:grid-cols-2 lg:gap-16"
            >
              <img
                src="/images/customer/about-us-story-dot.svg"
                alt=""
                aria-hidden="true"
                className="absolute top-1/2 left-1/2 z-10 hidden size-10 -translate-x-1/2 -translate-y-1/2 lg:block"
              />

              {step.imageSide === "left" ? (
                <>
                  <div className="flex justify-center lg:justify-end lg:pr-8">
                    <StepImage step={step} />
                  </div>
                  <div className="lg:pl-8">
                    <StepText step={step} />
                  </div>
                </>
              ) : (
                <>
                  <div className="lg:order-1 lg:pr-8">
                    <StepText step={step} />
                  </div>
                  <div className="flex justify-center lg:order-2 lg:justify-start lg:pl-8">
                    <StepImage step={step} />
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
