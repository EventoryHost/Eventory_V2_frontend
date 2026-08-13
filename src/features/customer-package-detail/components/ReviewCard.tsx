import { Star } from "lucide-react";
import type { Review } from "../types";

export default function ReviewCard({ review, isLast = false }: { review: Review; isLast?: boolean }) {
  return (
    <div className={isLast ? "" : "border-b border-black/5 pb-6"}>
      <div className="mb-2 flex items-start justify-between gap-2">
        <div>
          <div className="font-figtree text-[14px] font-bold text-brand-950">
            {review.authorName}
            <span className="ml-2 font-figtree text-[12px] font-normal text-neutral-tertiary">
              {review.eventTag}
            </span>
          </div>
          <div className="mt-1 flex gap-0.5 text-brand-primary">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className={`h-3 w-3 ${i < review.rating ? "fill-brand-primary" : "fill-none text-black/15"}`} />
            ))}
          </div>
        </div>
        <span className="shrink-0 font-figtree text-[12px] text-neutral-tertiary">{review.date}</span>
      </div>
      <p className="mb-2 font-figtree text-[13px] text-neutral-secondary">{review.comment}</p>
      {review.photoNote && (
        <div className="font-figtree text-[11px] text-neutral-tertiary italic">{review.photoNote}</div>
      )}
    </div>
  );
}
