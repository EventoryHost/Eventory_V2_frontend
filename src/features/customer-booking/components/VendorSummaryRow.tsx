import Image from "next/image";
import { Star } from "lucide-react";

export type VendorSummaryRowProps = {
  avatar?: string;
  avatarInitial: string;
  vendorName: string;
  rating: number;
  reviewCount: number;
  eventsOnEventory: number;
  packageCount: number;
  subtotal: string;
};

// Same header markup/styling as customer-cart's VendorGroupCard (minus the
// select-all checkbox, which only makes sense in the cart) — kept in sync on
// purpose so a vendor looks identical across cart and booking summary.
export default function VendorSummaryRow({
  avatar,
  avatarInitial,
  vendorName,
  rating,
  reviewCount,
  eventsOnEventory,
  packageCount,
  subtotal,
}: VendorSummaryRowProps) {
  return (
    <div className="flex w-full max-w-[799px] flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          {avatar ? (
            <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full">
              <Image src={avatar} alt={vendorName} fill className="object-cover" />
            </span>
          ) : (
            <span
              aria-hidden="true"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-subtle font-figtree text-[13px] font-bold text-brand-primary"
            >
              {avatarInitial}
            </span>
          )}

          <div className="flex flex-col gap-0.5">
            <span className="font-figtree text-[16px] font-semibold text-neutral-primary">{vendorName}</span>

            {(reviewCount > 0 || eventsOnEventory > 0) && (
              <div className="flex items-center gap-1.5">
                {reviewCount > 0 && (
                  <>
                    <span className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star
                          key={i}
                          size={12}
                          className={
                            i < Math.round(rating)
                              ? "fill-brand-primary text-brand-primary"
                              : "fill-[#E5E7EB] text-[#E5E7EB]"
                          }
                        />
                      ))}
                    </span>
                    <span className="font-figtree text-[13px] text-neutral-secondary whitespace-nowrap">
                      {rating} ({reviewCount})
                    </span>
                  </>
                )}
                {eventsOnEventory > 0 && (
                  <span className="font-figtree text-[13px] text-neutral-secondary whitespace-nowrap">
                    {reviewCount > 0 ? "· " : ""}
                    {eventsOnEventory} events on Eventory
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        <span className="shrink-0 font-figtree text-[13px] text-neutral-secondary">
          {packageCount} package{packageCount === 1 ? "" : "s"}
        </span>
      </div>

      <div className="flex items-center justify-between pl-7">
        <span className="font-figtree text-[14px] text-neutral-secondary">Vendor subtotal</span>
        <span className="font-figtree text-[16px] font-bold text-neutral-primary">{subtotal}</span>
      </div>
    </div>
  );
}
