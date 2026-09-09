import Image from "next/image";
import Link from "next/link";
import { PartyPopper, SquarePen } from "lucide-react";
import type { CartPackage, EventDetails as EventDetailsData } from "../types";
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
            </div>
            <Link
              href={cartPackage.href}
              className="flex shrink-0 items-center gap-1.5 font-figtree text-[14px] font-semibold text-neutral-primary transition-colors hover:text-brand-primary"
            >
              <SquarePen className="h-4 w-4" />
              Edit Package
            </Link>
          </div>

          <Link href={cartPackage.href} className="mb-3 flex flex-wrap items-baseline gap-1 hover:underline">
            <span className="font-figtree text-[16px] leading-none font-medium text-[#030303]">
              {cartPackage.title}
            </span>
            {cartPackage.variantType && (
              <span className="font-figtree text-[16px] leading-none font-medium text-[#71717B]">
                &middot; {cartPackage.variantType}
              </span>
            )}
          </Link>

          <EventDetails details={eventDetails} />

          {specialRequest && (
            <div className="mb-3 flex items-center gap-1.5 font-figtree text-[13px] text-neutral-secondary">
              <PartyPopper className="h-4 w-4 shrink-0 text-brand-primary" />
              {specialRequest.replace(EVENT_TYPE_PREFIX, "")}
            </div>
          )}

          {cancellationTiers && (
            <p className="font-figtree text-[14px] leading-[22px] font-medium text-[#008236]">
              Free cancellation till {formatDayMonth(cancellationTiers.fullRefundCutoff)}
            </p>
          )}
        </div>

        <VendorActions price={cartPackage.price} onRemove={onRemove} onMoveToWishlist={onMoveToWishlist} />
      </div>
    </div>
  );
}
