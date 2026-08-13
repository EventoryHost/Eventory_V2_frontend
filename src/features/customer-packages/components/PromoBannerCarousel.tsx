import type { PromoBanner } from "../types";
import PromoBannerCard from "./PromoBannerCard";
import ScrollableRow from "./ScrollableRow";

export default function PromoBannerCarousel({ banners }: { banners: PromoBanner[] }) {
  return (
    <ScrollableRow contentClassName="px-4 sm:px-6 lg:px-8 snap-x snap-mandatory">
      {banners.map((banner, i) => (
        <PromoBannerCard key={banner.id} banner={banner} seed={i} />
      ))}
    </ScrollableRow>
  );
}
