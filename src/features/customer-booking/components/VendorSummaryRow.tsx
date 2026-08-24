import Image from "next/image";
import { Star } from "lucide-react";

export type VendorSummaryRowProps = {
  avatar?: string;
  avatarInitial?: string;
  vendorName: string;
  rating: number;
  reviewCount: number;
  eventsOnEventory: number;
  packageCount: number;
  subtotal: string;
};

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
    <div className="flex w-full max-w-[799px] flex-col gap-1">
      <div className="flex w-full items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {avatar ? (
            <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full">
              <Image src={avatar} alt={vendorName} fill className="object-cover" />
            </span>
          ) : (
            <span
              aria-hidden="true"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FFE5E9] font-figtree text-[14px] font-bold text-[#F0596F]"
            >
              {avatarInitial ?? vendorName[0]?.toUpperCase() ?? "V"}
            </span>
          )}

          <div className="flex flex-col gap-0.5">
            <span className="font-figtree text-[16px] font-semibold leading-[20px] tracking-[-0.02em] text-[#262626]">
              {vendorName}
            </span>

            <div className="flex items-center gap-1.5">
              <span className="flex items-center gap-0.5">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={i}
                    size={12}
                    className={
                      i < Math.round(rating)
                        ? "fill-[#F0596F] text-[#F0596F]"
                        : "fill-[#E5E7EB] text-[#E5E7EB]"
                    }
                  />
                ))}
              </span>

              <span className="font-figtree text-[14px] font-normal text-body-secondary whitespace-nowrap">
                {rating} ({reviewCount}) &middot; {eventsOnEventory} events on
                Eventory
              </span>
            </div>
          </div>
        </div>

        <span className="shrink-0 font-figtree text-[14px] font-normal text-body-secondary">
          {packageCount} package{packageCount === 1 ? "" : "s"}
        </span>
      </div>

      <div className="flex w-full items-center justify-between py-1.5 pl-[52px]">
        <span className="font-figtree text-[14px] font-normal text-body-secondary">
          Vendor subtotal
        </span>
        <span className="font-figtree text-[16px] font-bold text-[#101828]">
          {subtotal}
        </span>
      </div>
    </div>
  );
}
