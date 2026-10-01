import Image from "next/image";

const STEPS = [
  {
    step: "STEP 1",
    title: "Register & Build Profile",
    description: "Create your vendor account in under 5 minutes with basic business details.",
    image: "/images/customer/become/step1.png",
    badge: "5 mins to register",
  },
  {
    step: "STEP 2",
    title: "Get Verified",
    description: "Add your services, pricing, portfolio photos, and availability calendar.",
    image: "/images/customer/become/step2.png",
  },
  {
    step: "STEP 3",
    title: "Create Package",
    description: "Start receiving booking requests from customers looking for your services.",
    image: "/images/customer/become/step3.png",
  },
  {
    step: "STEP 4",
    title: "Get Bookings, Earn More",
    description: "Scale your business with insights, reviews, and our marketing tools.",
    image: "/images/customer/become/step4.png",
  },
];

export default function HowItWorksSection() {
  return (
    <section className="w-full bg-white px-4 pt-16 pb-20 sm:px-6 lg:px-16">
      <div className="mx-auto max-w-[1312px]">
        <p className="font-figtree text-[13px] leading-[18px] font-semibold tracking-[0.05em] text-[#EA1D3B] uppercase">
          How it works?
        </p>
        <h2 className="mt-2 font-figtree text-[36px] leading-[44px] font-bold tracking-[-0.72px] text-[#030303]">
          Join Eventory in 4 simple steps and start growing your business today
        </h2>

        <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((item) => (
            <div key={item.step} className="flex flex-col items-center">
              <div className="relative w-full">
                {item.badge && (
                  <span className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 rounded-full bg-[#3C060D] px-3 py-1 font-figtree text-[11px] font-semibold whitespace-nowrap text-white">
                    {item.badge}
                  </span>
                )}
                <div className="relative h-[203px] w-full max-w-[304px] overflow-hidden rounded-[24px] border border-[#FCDEE2]">
                  <Image src={item.image} alt="" fill className="object-cover" />
                </div>
              </div>

              <span className="mt-5 flex h-[26px] items-center justify-center rounded-full border border-black/10 bg-white px-3 font-figtree text-[11px] leading-[16px] font-semibold text-[#3F3F47]">
                {item.step}
              </span>
              <h3 className="mt-3 text-center font-figtree text-[20px] leading-[28px] font-semibold text-[#030303]">
                {item.title}
              </h3>
              <p className="mt-2 text-center font-figtree text-[16px] leading-[24px] font-medium text-[#3F3F47]">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
