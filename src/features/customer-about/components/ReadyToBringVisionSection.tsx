import Link from "next/link";

// Figma: https://www.figma.com/design/fKzA9Z3TJHMEL93WM31azx/Customer-Side---Final-Dev?node-id=2438-22340
export default function ReadyToBringVisionSection() {
  return (
    <section className="w-full bg-white px-4 py-16 sm:px-6 lg:px-16">
      <div
        className="relative mx-auto max-w-[1312px] overflow-hidden rounded-[48px] bg-cover bg-center"
        style={{ backgroundImage: "url(/images/customer/about-us-cta-bg.jpg)" }}
      >
        {/* Same fade-to-cream gradient the design uses so the text stays
            readable over the busy table-setting photo without a flat
            overlay hiding the image entirely. */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(270deg, rgba(255,255,255,0) 19.25%, rgb(255,239,208) 83.9%)",
          }}
        />

        <div className="relative z-10 flex max-w-[692px] flex-col gap-10 px-6 py-12 sm:px-12 sm:py-16">
          <div className="flex flex-col gap-4">
            <h2 className="font-figtree text-[28px] leading-[1.1] font-semibold tracking-[-0.72px] text-[#030303] sm:text-[36px]">
              Ready to bring your vision to life?
            </h2>
            <p className="max-w-[586px] font-figtree text-[16px] leading-[1.35] font-medium tracking-[-0.16px] text-[#3F3F47]">
              Now that you know who we are, let&apos;s talk about your celebration. Explore curated packages or
              build something completely custom with us.
            </p>
          </div>

          <div className="flex flex-col items-start gap-4">
            <Link
              href="/packages"
              className="flex items-center justify-center rounded-[34px] bg-[#F0596F] px-8 py-4 font-figtree text-[16px] font-semibold text-white transition hover:bg-rose-600"
            >
              Browse Packages
            </Link>
            <p className="font-figtree text-[14px] font-medium text-[#3F3F47]">
              Free to browse • No commitments required
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
