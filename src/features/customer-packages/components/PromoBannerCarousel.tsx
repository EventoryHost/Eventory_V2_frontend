import type { PromoBanner } from "../types";
import PromoBannerCard from "./PromoBannerCard";

// A plain wrapping flex row, not a scroll carousel — PM request, 2026-10-23:
// "get rid of left/right move buttons". A scroll track also meant the
// rightmost card's right edge could sit flush against the viewport/overflow
// boundary mid-scroll, clipping its rounded corner into a flat edge; each
// card now has a fixed 424.808x206.75 size (PM spec) and simply wraps to a
// new line if the row ever gets too narrow to fit all 3, rather than
// scrolling or being clipped.
export default function PromoBannerCarousel({ banners }: { banners: PromoBanner[] }) {
  // max-w is 1440 (= 1312 content + 64px gutter on each side via lg:px-16),
  // so the content area itself is exactly 1312px wide at desktop.
  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-wrap justify-center gap-5 px-4 sm:px-6 lg:flex-nowrap lg:justify-start lg:px-16">
      {banners.map((banner, i) => (
        <PromoBannerCard key={banner.id} banner={banner} seed={i} />
      ))}
    </div>
  );
}
