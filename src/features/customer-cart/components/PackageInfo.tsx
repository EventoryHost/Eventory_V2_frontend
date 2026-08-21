import Image from "next/image";
import Link from "next/link";
import type { CartPackage, EventDetails as EventDetailsData } from "../types";
import { formatPrice } from "../utils/currency";
import EventDetails from "./EventDetails";
import RefundPolicyLink from "./RefundPolicyLink";
import VendorActions from "./VendorActions";

export default function PackageInfo({
  cartPackage,
  eventDetails,
  onEditDetails,
  onRemove,
  onMoveToWishlist,
}: {
  cartPackage: CartPackage;
  eventDetails: EventDetailsData;
  onEditDetails: () => void;
  onRemove: () => void;
  onMoveToWishlist: () => void;
}) {
  return (
    <div className="flex flex-col md:flex-row">
      <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-neutral-subtle md:w-1/3">
        {cartPackage.image && (
          <Image
            src={cartPackage.image}
            alt={cartPackage.title}
            fill
            sizes="(min-width: 768px) 33vw, 100vw"
            className="object-cover"
          />
        )}
      </div>

      <div className="flex w-full flex-col justify-between p-6 md:w-2/3">
        <div>
          <div className="mb-2 flex items-start justify-between gap-3">
            <span className="inline-flex items-center rounded-md bg-neutral-subtle px-2.5 py-1 font-figtree text-[10px] font-bold tracking-wide text-neutral-secondary uppercase">
              {cartPackage.categoryLabel}
            </span>
            <div className="shrink-0 text-right">
              <span className="font-figtree text-[20px] font-bold text-neutral-primary">
                {formatPrice(cartPackage.price)}
              </span>
              <span className="font-figtree text-[13px] text-neutral-secondary"> /event</span>
            </div>
          </div>

          <Link href={cartPackage.href} className="hover:underline">
            <h3 className="mb-4 font-figtree text-[18px] leading-snug font-semibold text-neutral-primary">
              {cartPackage.title}
            </h3>
          </Link>

          <EventDetails details={eventDetails} />

          <div className="mt-4">
            <RefundPolicyLink />
          </div>
        </div>

        <VendorActions onRemove={onRemove} onMoveToWishlist={onMoveToWishlist} onEdit={onEditDetails} />
      </div>
    </div>
  );
}
