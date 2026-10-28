import Image from "next/image";
import Link from "next/link";

// categoryId matches the ids VENDOR_CATEGORIES uses in
// customer-vendors/data/filterConfig.ts, so each card deep-links straight
// into that category's tab on /vendors.
//
// Decorator listed FIRST (PM instruction) — it's the only category with
// real package depth right now, so it leads, and every other category
// renders dimmed (see `dimmed` below) rather than competing for the same
// attention until they have comparable package volume.
const VENDOR_CATEGORIES = [
  {
    label: "Decorator",
    categoryId: "decorator",
    image: "/images/customer/decorator.png",
    color: "#FFEFC2",
  },
  {
    label: "Caterer",
    categoryId: "caterer",
    image: "/images/customer/caterers.png",
    color: "#FFCCD3",
    dimmed: true,
  },
  {
    label: "DJ Artist",
    categoryId: "dj-artist",
    image: "/images/customer/dj.png",
    color: "#E0CCFF",
    dimmed: true,
  },
  {
    label: "Makeup Artist",
    categoryId: "makeup-artist",
    image: "/images/customer/makeup.png",
    color: "#FFDFB2",
    dimmed: true,
  },
  {
    label: "Venue provider",
    categoryId: "venue-provider",
    image: "/images/customer/venue.png",
    color: "#C2E3FF",
    dimmed: true,
  },
  {
    label: "Photographer & Videographer",
    categoryId: "photographer",
    image: "/images/customer/video.png",
    color: "#CCFFE2",
    dimmed: true,
  },
];

export default function BrowseVendors() {
  return (
    <section className="mx-auto mt-16 w-full max-w-[1440px] px-4 sm:px-6 lg:px-16">
      <h2 className="font-figtree font-bold text-brand-950 text-[28px] sm:text-[32px] leading-[1.2] tracking-[-0.02em]">
        Browse our Vendors
      </h2>
      <p className="mt-2 font-figtree font-normal text-[16px] leading-[1.35] tracking-[-0.02em] text-body-secondary">
        Book venues, decorators, caterers, entertainers, and photographers
        packages together.
      </p>

      {/* Mobile: 2 rows of 3 small cards (grid-cols-3), shrunk to fit —
          sm+ keeps the original 202x172 card size and 3/6-col layout. */}
      <div className="mt-8 grid grid-cols-3 gap-2 sm:gap-4 lg:grid-cols-6">
        {VENDOR_CATEGORIES.map((category) => (
          <Link
            key={category.label}
            href={`/vendors?category=${category.categoryId}`}
            style={{
              background: `radial-gradient(circle at 100% 100%, ${category.color} 0%, #ffffff 65%)`,
            }}
            className={`relative mx-auto h-[108px] w-full max-w-[202px] overflow-hidden rounded-[14px] border border-black/5 text-left transition-opacity sm:h-[172px] sm:rounded-[20px] ${
              category.dimmed ? "opacity-45 hover:opacity-75" : ""
            }`}
          >
            <span className="absolute top-2.5 left-2.5 right-2.5 z-10 font-figtree font-semibold text-brand-950 text-[11px] leading-[1.2] sm:top-6 sm:left-5 sm:right-5 sm:text-[16px]">
              {category.label}
            </span>
            <Image
              src={category.image}
              alt={category.label}
              width={160}
              height={160}
              className="absolute -bottom-1 -right-1 h-[48%] w-[48%] object-contain sm:-bottom-2 sm:-right-2 sm:h-[55%] sm:w-[55%]"
            />
          </Link>
        ))}
      </div>
    </section>
  );
}
