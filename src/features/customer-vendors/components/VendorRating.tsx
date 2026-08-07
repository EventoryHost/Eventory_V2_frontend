import { Star } from "lucide-react";

export default function VendorRating({
  rating,
  reviewCount,
  size = "sm",
}: {
  rating: number;
  reviewCount: number;
  size?: "sm" | "md";
}) {
  const starSize = size === "md" ? "h-[18px] w-[18px]" : "h-4 w-4";
  const textSize = size === "md" ? "text-[15px]" : "text-[13px]";

  return (
    <div className="flex items-center gap-1">
      <Star className={`${starSize} fill-brand-primary text-brand-primary`} />
      <span className={`font-figtree ${textSize} font-bold text-neutral-primary`}>{rating}</span>
      <span className={`font-figtree ${textSize} text-neutral-tertiary`}>
        from {reviewCount} reviews
      </span>
    </div>
  );
}
