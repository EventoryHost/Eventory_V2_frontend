import Image from "next/image";
import Link from "next/link";
import { PartyPopper, ShieldCheck } from "lucide-react";
import type { CartPackage, EventDetails as EventDetailsData } from "../types";
import { formatPrice } from "../utils/currency";
import { getCategoryIconMeta, getCategoryLabel } from "../utils/categoryMeta";
import {
  formatDayMonth,
  getCancellationTiers,
} from "@/features/customer-package-detail/utils/cancellationPolicy";
import EventDetails from "./EventDetails";
import VendorActions from "./VendorActions";

const EVENT_TYPE_PREFIX = /^Event type:\s*/i;

export default function PackageInfo({
  cartPackage,
  eventDetails,
  specialRequest,
  onRemove,
  onMoveToWishlist,
}: {
  cartPackage: CartPackage;
  eventDetails: EventDetailsData;
  specialRequest: string;
  onRemove: () => void;
  onMoveToWishlist: () => void;
}) {
  const categoryIcon = getCategoryIconMeta(cartPackage.categoryLabel);
  // Same platform-wide cancellation window used on the PDP's booking card —
  // there's no per-vendor structured refund schema to read a real timeline
  // from (see cancellationPolicy.ts), so this is Eventory's default tier,
  // computed off the real event date already sitting in this cart item.
  const cancellationTiers = eventDetails.date ? getCancellationTiers(eventDetails.date) : null;

  return (
    <div className="flex flex-col md:flex-row">
      <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-neutral-subtle md:aspect-auto md:w-[280px]">
        {cartPackage.image && (
          <Image
            src={cartPackage.image}
            alt={cartPackage.title}
            fill
            sizes="(min-width: 768px) 280px, 100vw"
            className="object-cover"
          />
        )}
      </div>

      <div className="flex w-full flex-col justify-between p-6">
        <div>
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <span
                className="flex w-fit shrink-0 items-center gap-1.5 rounded-[52px] py-1 pr-3 pl-1"
                style={{ background: `linear-gradient(to left, ${categoryIcon.gradientFrom}, #ffffff)` }}
              >
                <Image
                  src={categoryIcon.icon}
                  alt=""
                  width={16}
                  height={16}
                  className="h-4 w-4 rounded-full object-contain"
                />
                <span className="font-figtree text-[11px] font-bold tracking-wide text-brand-950 uppercase whitespace-nowrap">
                  {getCategoryLabel(cartPackage.categoryLabel)}
                </span>
              </span>
              <span className="h-4 w-px shrink-0 bg-black/10" />
            </div>
            <div className="shrink-0 text-right">
              <span className="font-figtree text-[20px] font-bold text-neutral-primary">
                {formatPrice(cartPackage.price)}
              </span>
              <span className="font-figtree text-[13px] text-neutral-secondary"> /event</span>
            </div>
          </div>

          <Link href={cartPackage.href} className="hover:underline">
            <h3
              className="mb-3 font-figtree text-[16px] font-medium tracking-[-0.02em] text-[#3F3F47]"
              style={{ lineHeight: "100%" }}
            >
              {cartPackage.title}
            </h3>
          </Link>

          <EventDetails details={eventDetails} />

          {specialRequest && (
            <div className="mb-3 flex items-center gap-1.5 font-figtree text-[13px] text-neutral-secondary">
              <PartyPopper className="h-4 w-4 shrink-0 text-brand-primary" />
              {specialRequest.replace(EVENT_TYPE_PREFIX, "")}
            </div>
          )}

          {cancellationTiers && (
            <div className="flex items-center gap-1.5 font-figtree text-[13px] font-semibold text-success-700">
              <ShieldCheck className="h-4 w-4 shrink-0" />
              Free cancellation till {formatDayMonth(cancellationTiers.fullRefundCutoff)}
            </div>
          )}
        </div>

        <VendorActions onRemove={onRemove} onMoveToWishlist={onMoveToWishlist} editHref={cartPackage.href} />
      </div>
    </div>
  );
}
