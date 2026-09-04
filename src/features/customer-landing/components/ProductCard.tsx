import Image from "next/image";
import Link from "next/link";
import { Bookmark, Star, Clock, Users, Map } from "lucide-react";

export type ProductCardProps = {
  image: string;
  categoryLabel: string;
  categoryIcon: string;
  tags: string[];
  title: string;
  rating: number;
  reviewCount: number;
  duration: string;
  guestCapacity: string;
  price: string;
  priceSuffix?: string;
  locations: string[];
  categoryGradientFrom?: string;
  categoryGradientTo?: string;
  href?: string;
};

function formatTags(tags: string[]) {
  const visible = tags.slice(0, 3);
  const remaining = tags.length - visible.length;
  const label = visible.join(" • ");
  return remaining > 0 ? `${label} • +${remaining} more` : label;
}

export default function ProductCard({
  image,
  categoryLabel,
  categoryIcon,
  tags,
  title,
  rating,
  reviewCount,
  duration,
  guestCapacity,
  price,
  priceSuffix = "/event",
  locations,
  categoryGradientFrom = "#FFE5E9",
  categoryGradientTo = "#ffffff",
  href = "/packages",
}: ProductCardProps) {
  return (
    <Link
      href={href}
      className="block w-[316px] overflow-hidden rounded-2xl border border-black/5 bg-white"
    >
      {/* Image */}
      <div className="relative h-[191px] w-[316px]">
        <Image src={image} alt={title} fill className="object-cover" />
        <button
          type="button"
          aria-label="Save"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
          }}
          className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full border border-white/70 bg-white/20 backdrop-blur-md"
        >
          <Bookmark className="h-4 w-4 text-white backdrop-blur-sm" />
        </button>
      </div>

      {/* Content */}
      <div className="flex w-[316px] flex-col gap-5 p-4">
        {/* Category badge + tags */}
        <div className="flex items-center gap-3">
          <div
            className="flex w-[132px] shrink-0 items-center gap-2 rounded-[52px] pt-1 pr-3 pb-1 pl-1"
            style={{
              background: `linear-gradient(to left, ${categoryGradientFrom}, ${categoryGradientTo})`,
            }}
          >
            <Image
              src={categoryIcon}
              alt={categoryLabel}
              width={16}
              height={16}
              className="h-4 w-4 rounded-full object-contain"
            />
            <span className="font-figtree text-[12px] font-semibold text-brand-950 whitespace-nowrap">
              {categoryLabel}
            </span>
          </div>

          <span className="h-4 w-px shrink-0 bg-black/10" />

          <p className="truncate font-figtree text-[14px] font-medium leading-[18px] tracking-[-0.01em] text-[#B4112A]">
            {formatTags(tags)}
          </p>
        </div>

        {/* Title */}
        <h3 className="font-figtree text-[20px] font-bold leading-[1.2] text-brand-950 line-clamp-2">
          {title}
        </h3>

        {/* Rating — only shown once the package actually has reviews */}
        {reviewCount > 0 && (
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-primary">
              <Star className="h-3 w-3 fill-white text-white" />
            </span>
            <span className="font-figtree text-[14px] font-medium text-[#71717B]">
              {rating} from {reviewCount} reviews
            </span>
          </div>
        )}

        {/* Duration / guests */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-[#71717B]" />
            <span className="font-figtree text-[14px] font-medium text-[#71717B]">
              {duration}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-[#71717B]" />
            <span className="font-figtree text-[14px] font-medium text-[#71717B]">
              {guestCapacity}
            </span>
          </div>
        </div>

        <div className="h-px w-full bg-black/10" />

        {/* Price */}
        <div>
          <p className="font-figtree text-[12px] font-medium uppercase tracking-wide text-[#A1A1AA]">
            Starting from
          </p>
          <p className="font-figtree text-[24px] font-bold text-brand-950">
            {price}
            <span className="text-[14px] font-medium text-[#71717B]">
              {priceSuffix}
            </span>
          </p>
        </div>
      </div>

      {/* Location — full-bleed footer strip, its own top border separate from
          the padded content above. Only the first 2 locations, "..." appended
          when there are more. */}
      <div className="flex items-center gap-2 border-t border-[#F0F0F0] px-4 py-1.5">
        <Map className="h-4 w-4 shrink-0 text-[#790B1A]" />
        <p className="truncate font-figtree text-[14px] font-medium text-[#790B1A]">
          Available in {locations.slice(0, 2).join(", ")}
          {locations.length > 2 ? "..." : ""}
        </p>
      </div>
    </Link>
  );
}
