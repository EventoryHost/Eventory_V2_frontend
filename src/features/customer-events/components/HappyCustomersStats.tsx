import Image from "next/image";

const STATS = [
  {
    value: "98%",
    label: "Satisfaction Rate",
    image: "/images/customer/events/satisfaction.png",
  },
  {
    value: "15K+",
    label: "Event Delivered",
    image: "/images/customer/events/event-delivered.png",
  },
  {
    value: "500+",
    label: "Verified Vendors",
    image: "/images/customer/events/verified.png",
  },
];

export default function HappyCustomersStats() {
  return (
    <section className="relative mx-auto mt-16 w-full max-w-[1312px] overflow-hidden rounded-[44px]">
      <Image
        src="/images/customer/events/confetti.jpg"
        alt=""
        fill
        className="object-cover"
      />

      <div className="relative z-10 flex flex-col gap-8 p-8 lg:p-12">
        <h2 className="max-w-[444px] font-figtree text-[28px] lg:text-[36px] font-bold leading-[1.1] tracking-[-0.02em] text-[#1E0306]">
          50,000+ Happy Customers
        </h2>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="relative h-[212px] overflow-hidden rounded-[24px] border border-[#FFEACC] bg-white"
            >
              <div className="absolute top-6 left-6">
                <p className="font-figtree text-[48px] font-bold leading-[1.1] tracking-[-0.02em] text-[#1E0306]">
                  {stat.value}
                </p>
                <p className="mt-1 w-[154px] text-center font-figtree text-[20px] font-semibold leading-[30px] tracking-[-0.01em] text-body-secondary">
                  {stat.label}
                </p>
              </div>

              <Image
                src={stat.image}
                alt=""
                width={170}
                height={170}
                className="absolute -bottom-6 -right-6 h-[170px] w-[170px] object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
