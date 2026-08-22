import Image from "next/image";
import Link from "next/link";
import { PartyPopper } from "lucide-react";
import type { CartPackage, EventDetails as EventDetailsData } from "../types";
import { formatPrice } from "../utils/currency";
import { getCategoryIcon, getCategoryLabel } from "../utils/categoryMeta";
import EventDetails from "./EventDetails";
import RefundPolicyLink from "./RefundPolicyLink";
import VendorActions from "./VendorActions";

const EVENT_TYPE_PREFIX = /^Event type:\s*/i;

export default function PackageInfo({
  cartPackage,
  eventDetails,
  specialRequest,
  onEditDetails,
  onRemove,
  onMoveToWishlist,
}: {
  cartPackage: CartPackage;
  eventDetails: EventDetailsData;
  specialRequest: string;
  onEditDetails: () => void;
  onRemove: () => void;
  onMoveToWishlist: () => void;
}) {
  const CategoryIcon = getCategoryIcon(cartPackage.categoryLabel);

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
            <span className="inline-flex items-center gap-1.5 rounded-md bg-brand-subtle px-2.5 py-1 font-figtree text-[11px] font-bold tracking-wide text-brand-primary uppercase">
              <CategoryIcon className="h-3.5 w-3.5" />
              {getCategoryLabel(cartPackage.categoryLabel)}
            </span>
            <div className="shrink-0 text-right">
              <span className="font-figtree text-[20px] font-bold text-neutral-primary">
                {formatPrice(cartPackage.price)}
              </span>
              <span className="font-figtree text-[13px] text-neutral-secondary"> /event</span>
            </div>
          </div>

          <Link href={cartPackage.href} className="hover:underline">
            <h3 className="mb-3 font-figtree text-[18px] leading-snug font-semibold text-neutral-primary">
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

          <RefundPolicyLink />
        </div>

        <VendorActions onRemove={onRemove} onMoveToWishlist={onMoveToWishlist} onEdit={onEditDetails} />
      </div>
    </div>
  );
}
