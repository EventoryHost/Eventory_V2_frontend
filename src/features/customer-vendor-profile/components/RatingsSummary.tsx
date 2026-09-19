import { Star } from "lucide-react";
import type { RawReviewAggregate } from "@/lib/customerPackageDetailApi";

/** 4.9 → "Excellent". Plain thresholds, matching the design's sample copy. */
function ratingWord(average: number) {
  if (average >= 4.5) return "Excellent";
  if (average >= 4) return "Very Good";
  if (average >= 3) return "Good";
  if (average >= 2) return "Fair";
  return "Poor";
}

/**
 * The RATINGS card: big average with stars on the left, the 5→1
 * distribution histogram on the right.
 *
 * `aggregate.distribution` comes straight from the backend's
 * computeReviewAggregate, which always returns all five buckets (zero-filled),
 * so the bars never depend on which ratings happen to exist.
 */
export default function RatingsSummary({ aggregate }: { aggregate: RawReviewAggregate }) {
  const average = aggregate.averageRating ?? 0;
  const total = aggregate.count;

  return (
    <div className="flex flex-col gap-4">
      <p className="font-figtree text-[16px] leading-[24px] font-semibold text-[#030303]">RATINGS</p>

      <div className="flex flex-col items-start justify-between gap-6 rounded-[16px] border border-[#e4e4e7] bg-white px-6 py-5 lg:flex-row">
        <div className="flex w-full flex-col gap-3 lg:w-[243px]">
          <div className="flex flex-col gap-2">
            <p className="font-figtree text-[40px] leading-[48px] font-bold tracking-[-0.5px] text-[#030303]">
              {average.toFixed(1)}
            </p>
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star
                  key={index}
                  className={`size-6 ${
                    index < Math.round(average)
                      ? "fill-[#ea1d3b] text-[#ea1d3b]"
                      : "fill-none text-[#ea1d3b]"
                  }`}
                  strokeWidth={1.5}
                />
              ))}
            </div>
          </div>
          <p className="font-figtree text-[16px] leading-[24px] font-medium text-[#3f3f47]">
            {total > 0
              ? `${ratingWord(average)} • Based on ${total} ${total === 1 ? "Review" : "Reviews"}`
              : "No reviews yet"}
          </p>
        </div>

        <span className="hidden w-px self-stretch bg-[#e4e4e7] lg:block" />

        <div className="flex w-full flex-col gap-2 lg:w-[433px]">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = aggregate.distribution?.[String(star)] ?? 0;
            // Guard the divide: a vendor with no reviews yet would make
            // every bar NaN% wide.
            const percent = total > 0 ? (count / total) * 100 : 0;
            return (
              <div key={star} className="flex items-center gap-3">
                <div className="flex w-7 shrink-0 items-center justify-between">
                  <span className="font-figtree text-[16px] leading-[24px] font-semibold text-[#3f3f47]">
                    {star}
                  </span>
                  <Star className="size-3 fill-[#ea1d3b] text-[#ea1d3b]" />
                </div>
                <div className="h-2.5 flex-1 overflow-hidden rounded-[20px] bg-[#f4f4f5]">
                  <div className="h-full rounded-[20px] bg-[#3f3f47]" style={{ width: `${percent}%` }} />
                </div>
                <span className="w-7 shrink-0 text-center font-figtree text-[14px] leading-[20px] font-medium text-[#71717b]">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
