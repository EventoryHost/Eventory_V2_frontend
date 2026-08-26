import Image from "next/image";
import AnimatedCheckBadge from "./AnimatedCheckBadge";

export type BookingHeroBannerProps = {
  customerFirstName: string;
  eventDateLabel: string;
  whatsappNumber: string;
};

export default function BookingHeroBanner({
  customerFirstName,
  eventDateLabel,
  whatsappNumber,
}: BookingHeroBannerProps) {
  return (
    <section
      className="relative w-full overflow-hidden rounded-b-[32px] sm:rounded-b-[48px]"
      style={{ background: "linear-gradient(180deg, white 0%, #FDEEF0 100%)" }}
    >
      <div className="mx-auto flex w-full max-w-[1320px] flex-col items-start gap-10 px-4 py-12 sm:px-6 lg:flex-row lg:items-center lg:gap-8 lg:px-16 lg:py-20">
        <div className="flex w-full flex-col items-start gap-5 lg:max-w-[692px]">
          <AnimatedCheckBadge />

          <div className="flex flex-col gap-6">
            <h1 className="font-figtree text-[26px] font-semibold leading-[1.2] tracking-[-0.02em] text-black sm:text-[32px]">
              You are all set, {customerFirstName}.
            </h1>
            <p className="font-figtree text-[16px] font-normal leading-[1.6] text-[#3F3F47] sm:text-[20px]">
              Your event is booked for {eventDateLabel}, and thank you for
              planning it with Eventory.{" "}
              {whatsappNumber && (
                <>
                  We&apos;ve sent everything to <span className="font-semibold">{whatsappNumber}</span> (your
                  WhatsApp number).{" "}
                </>
              )}
              Now comes the best part: looking forward to the day.
            </p>
          </div>
        </div>

        <div className="relative aspect-square w-full max-w-[420px] shrink-0 self-center lg:max-w-[420px]">
          <Image
            src="/images/customer/ready-1.png"
            alt="Excited customers celebrating"
            fill
            className="rounded-[32px] object-cover"
          />
        </div>
      </div>
    </section>
  );
}
