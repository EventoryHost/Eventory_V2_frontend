import Image from "next/image";
import Link from "next/link";

// Category ids match VENDOR_CATEGORIES in
// src/features/customer-vendors/data/filterConfig.ts so these cards deep-link
// straight into the pre-filtered vendor listing.
const VENDOR_CATEGORIES = [
  {
    id: "caterer",
    label: "Caterer",
    image: "/images/customer/caterers.png",
    color: "#FFCCD3",
  },
  {
    id: "decorator",
    label: "Decorator",
    image: "/images/customer/decorator.png",
    color: "#FFEFC2",
  },
  {
    id: "dj-artist",
    label: "DJ Artist",
    image: "/images/customer/dj.png",
    color: "#E0CCFF",
  },
  {
    id: "makeup-artist",
    label: "Makeup Artist",
    image: "/images/customer/makeup.png",
    color: "#FFDFB2",
  },
  {
    id: "venue-provider",
    label: "Venue provider",
    image: "/images/customer/venue.png",
    color: "#C2E3FF",
  },
  {
    id: "photographer",
    label: "Photographer & Videographer",
    image: "/images/customer/video.png",
    color: "#CCFFE2",
  },
];

export default function BrowseVendors() {
  return (
    <section className="mx-auto mt-6 w-full max-w-[1320px]">
      <h2 className="font-figtree font-bold text-brand-950 text-[28px] sm:text-[32px] leading-[1.2] tracking-[-0.02em]">
        Browse our Vendors
      </h2>
      <p className="mt-2 font-figtree font-normal text-[16px] leading-[1.35] tracking-[-0.02em] text-body-secondary">
        Book venues, decorators, caterers, entertainers, and photographers
        packages together.
      </p>

      <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {VENDOR_CATEGORIES.map((category) => (
          <Link
            key={category.id}
            href={`/vendors?category=${category.id}`}
            style={{
              background: `radial-gradient(circle at 100% 100%, ${category.color} 0%, #ffffff 65%)`,
            }}
            className="relative mx-auto block w-full max-w-[202px] h-[172px] overflow-hidden rounded-[20px] border border-black/5 text-left"
          >
            <span className="absolute top-6 left-5 right-5 z-10 font-figtree font-semibold text-brand-950 text-[16px] leading-[1.2]">
              {category.label}
            </span>
            <Image
              src={category.image}
              alt={category.label}
              width={160}
              height={160}
              className="absolute -bottom-2 -right-2 h-[55%] w-[55%] object-contain"
            />
          </Link>
        ))}
      </div>
    </section>
  );
}
