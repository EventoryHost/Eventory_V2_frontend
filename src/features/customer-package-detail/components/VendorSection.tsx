import Link from "next/link";
import { Star } from "lucide-react";
import type { VendorInfo } from "../types";

export default function VendorSection({ vendor }: { vendor: VendorInfo }) {
  return (
    <section id="vendor" className="border-t border-black/5 pt-8">
      <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-black/10 p-6 md:flex-row md:items-center">
        <div className="flex items-center gap-4">
          <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-black/5 font-figtree text-[18px] font-bold text-brand-950">
            {vendor.initials}
            <div className="absolute -right-1 -bottom-1 flex items-center gap-0.5 rounded-md bg-brand-950 px-1.5 py-0.5 font-figtree text-[10px] font-bold text-white">
              {vendor.rating}
              <Star className="h-2.5 w-2.5 fill-warning-500 text-warning-500" />
            </div>
          </div>
          <div>
            <h3 className="font-figtree text-[16px] font-bold text-brand-950">Hosted by {vendor.name}</h3>
            <p className="mt-1 font-figtree text-[13px] text-neutral-tertiary">
              {vendor.eventsCount} events
              {vendor.businessName && <> · {vendor.businessName}</>}
              {vendor.repliesIn && <> · replies in {vendor.repliesIn}</>}
            </p>
          </div>
        </div>
        <Link href={vendor.href} className="font-figtree text-[13px] font-semibold text-brand-950 underline">
          Vendor info
        </Link>
      </div>
    </section>
  );
}
