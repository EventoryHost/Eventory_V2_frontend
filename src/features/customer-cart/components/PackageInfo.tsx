import Image from "next/image";
import Link from "next/link";
import type { CartPackage, EventDetails as EventDetailsData } from "../types";
import { getCategoryIconMeta, getCategoryLabel } from "../utils/categoryMeta";
import {
  formatDayMonth,
  getCancellationTiers,
  getCancellationTierStatus,
} from "@/features/customer-package-detail/utils/cancellationPolicy";
import EventDetails from "./EventDetails";
import VendorActions from "./VendorActions";

export default function PackageInfo({
  cartPackage,
  eventDetails,
  onRemove,
  onMoveToWishlist,
  vendorName,
  vendorVerified,
}: {
  vendorName?: string;
  vendorVerified?: boolean;
  cartPackage: CartPackage;
  eventDetails: EventDetailsData;
  onRemove: () => void;
  onMoveToWishlist: () => void;
}) {
  const categoryIcon = getCategoryIconMeta(cartPackage.categoryLabel);
  // Same platform-wide cancellation window used on the PDP's booking card —
  // there's no per-vendor structured refund schema to read a real timeline
  // from (see cancellationPolicy.ts), so this is Eventory's default tier,
  // computed off the real event date already sitting in this cart item.
  const cancellationTiers = eventDetails.date ? getCancellationTiers(eventDetails.date) : null;
  // Which of the three tiers "now" actually falls into — the cutoff dates
  // themselves don't move, so this used to always show the full-refund
  // cutoff even after it had already passed (still labeled "Free
  // cancellation" in green on a date that had come and gone).
  const cancellationStatus = cancellationTiers ? getCancellationTierStatus(cancellationTiers) : null;

  return (
    <div className="flex flex-col md:flex-row">
      <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-neutral-subtle md:aspect-auto md:min-h-[245px] md:w-[226px]">
        {cartPackage.image && (
          <Image
            src={cartPackage.image}
            alt={cartPackage.title}
            fill
            sizes="(min-width: 768px) 226px, 100vw"
            className="object-cover"
          />
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-between gap-2 p-4 md:py-3 md:pr-4 md:pl-4">
        <div>
          <div className="mb-2 flex items-start justify-between gap-3">
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
                <span className="font-figtree text-[12px] leading-[18px] font-bold tracking-[-0.12px] text-[#3C060D] uppercase whitespace-nowrap">
                  {getCategoryLabel(cartPackage.categoryLabel)}
                </span>
              </span>
            </div>
            <Link
              href={cartPackage.href}
              className="-mb-1.5 flex shrink-0 items-center gap-1.5 py-1 font-figtree text-[14px] leading-5.5 font-semibold text-[#3F3F47] transition-colors hover:text-brand-primary"
            >
              <img src="/images/customer/cart/edit.svg" alt="" className="h-4 w-4" />
              Edit Package
            </Link>
          </div>

          {/* Real bug fixed (PM reported 2026-11-02): an unbounded, very
              long package name (some run 150+ characters) had nothing to
              stop it wrapping across many lines and blowing out this
              card's layout — clamped to 2 lines, same pattern this
              feature's own addon cards already use (AddonCard, AddedAddonRow). */}
          <Link href={cartPackage.href} className="mb-2 block hover:underline" title={cartPackage.title}>
            <span className="line-clamp-2 font-figtree text-[16px] leading-[normal] font-medium text-[#030303]">
              {cartPackage.title}
              {cartPackage.variantType && (
                <>
                  <img
                    src="/images/customer/cart/title-dot.svg"
                    alt=""
                    className="mx-[5px] inline-block h-[5.281px] w-[2.281px] align-middle"
                  />
                  <span className="text-[#71717B]">{cartPackage.variantType}</span>
                </>
              )}
            </span>
          </Link>

          {vendorName && (
            <p className="mb-4 flex items-center gap-1.5 font-figtree text-[14px] leading-5 text-[#3F3F47]">
              <span className="truncate">By {vendorName}</span>
              {vendorVerified && (
                <img src="/images/customer/cart/verified.svg" alt="Verified vendor" className="h-[18px] w-[18px] shrink-0" />
              )}
            </p>
          )}

          <EventDetails details={eventDetails} />

          {cancellationTiers && cancellationStatus && (
            <p
              className={`font-figtree text-[14px] leading-[22px] font-medium ${
                cancellationStatus === "full"
                  ? "text-[#008236]"
                  : cancellationStatus === "half"
                    ? "text-amber-600"
                    : "text-red-600"
              }`}
            >
              {cancellationStatus === "full"
                ? `Free cancellation till ${formatDayMonth(cancellationTiers.fullRefundCutoff)}`
                : cancellationStatus === "half"
                  ? `50% refund if cancelled before ${formatDayMonth(cancellationTiers.halfRefundCutoff)}`
                  : "No refund on cancellation"}
            </p>
          )}
        </div>

        <VendorActions price={cartPackage.price} onRemove={onRemove} onMoveToWishlist={onMoveToWishlist} />
      </div>
    </div>
  );
}
