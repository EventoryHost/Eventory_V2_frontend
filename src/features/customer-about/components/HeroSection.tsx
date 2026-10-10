// Figma: https://www.figma.com/design/fKzA9Z3TJHMEL93WM31azx/Customer-Side---Final-Dev?node-id=2438-22169
export default function HeroSection() {
  return (
    // Full-bleed: no max-width cap, so the image spans edge-to-edge with no
    // side gaps at any viewport width. Text overlays the top of the
    // illustration (where it has its own built-in blank space) rather than
    // sitting above it on plain white. The container is locked to the
    // image's real aspect ratio (1672x941) so the image is NEVER cropped
    // (object-cover only crops when the container's ratio differs from the
    // image's own — here they always match). The text's top offset is a
    // PERCENTAGE of that height — matching the proportion between Figma's
    // image (810 tall) and text block (starting 104px into it, ~12.8%) —
    // so it stays correctly placed at every viewport width instead of
    // fixed pixels drifting off position as the image scales, with a
    // further 60px pulled up on top of that (PM request, 2026-10-13).
    <section className="relative w-full aspect-[1672/941]">
      <img
        src="/images/customer/about-us-hero-bg.png"
        alt="Eventory vendors setting up a lakeside wedding — florists, a photographer, and a catering team at work"
        className="absolute inset-0 h-full w-full object-cover"
      />

      <div className="absolute inset-x-0 top-[calc(12.8%-60px)] z-10 mx-auto flex max-w-[745px] flex-col items-center gap-5 px-4 text-center">
        <div className="rounded-[49px] bg-[linear-gradient(90deg,_#FFF0F2_0%,_#FFFFFF_100%)] px-[9px] py-[7px] shadow-[0_0_0_1px_#FFE0E4]">
          <span className="font-figtree text-[14px] leading-[16px] font-semibold tracking-[-0.56px] text-[#EA1D3B]">
            About Us
          </span>
        </div>

        <h1 className="font-figtree text-[20px] leading-[1.05] font-medium tracking-[-0.96px] text-[#1E0306] sm:text-[28px] lg:text-[48px]">
          We bring the right people together to create{" "}
          <span className="italic" style={{ fontFamily: "var(--font-lora)", color: "#F0596F" }}>
            unforgettable events
          </span>
        </h1>

        <p className="hidden max-w-[492px] font-figtree text-[16px] leading-[1.35] font-normal tracking-[-0.32px] text-[#636363] sm:block">
          Eventory connects customers, vendors, and services to make event planning feel simpler, smoother, and more memorable
        </p>
      </div>
    </section>
  );
}
