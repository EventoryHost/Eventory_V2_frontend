"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X, Calendar, Clock, MapPin, Tag, Pencil } from "lucide-react";
import CollapsibleSection from "./CollapsibleSection";
import SetupArticleCard, { type SetupArticleCardProps } from "./SetupArticleCard";
import AddOnRow from "./AddOnRow";
import NotIncludedRow from "./NotIncludedRow";
import AllPoliciesContent from "./AllPoliciesContent";
import VendorNoteSection from "./VendorNoteSection";
import PriceBreakdownContent from "./PriceBreakdownContent";
import type { BookingAddon } from "../types";
import { getPackageDetail } from "@/features/customer-package-detail/services/getPackageDetail";
import type { PackageDetail } from "@/features/customer-package-detail/types";
import { formatPrice } from "@/features/customer-cart/utils/currency";

const FALLBACK_IMAGE = "/images/customer/packages-pics.png";

function mapSetups(detail: PackageDetail): SetupArticleCardProps[] {
  return detail.includedItems.map((entry) => ({
    image: entry.image || FALLBACK_IMAGE,
    title: entry.title,
    price: entry.price ? formatPrice(entry.price) : "",
    details: entry.details.filter((d) => d.value && d.value !== "—"),
    items: entry.items.map((line) => ({
      name: line.label,
      quantity: line.qty,
      subtitle: [line.category, line.type].filter(Boolean).join(" · "),
      requests: [],
    })),
  }));
}

export type ServiceDetailsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  packageId?: string;
  sessionId?: string;
  lineId?: string;
  vendorName: string;
  serviceName: string;
  packageTier: string;
  date: string;
  time: string;
  location: string;
  eventType?: string;
  price: string;
  addons?: BookingAddon[];
  note?: string;
  onNoteSaved?: () => void;
};

export default function ServiceDetailsModal({
  isOpen,
  onClose,
  packageId,
  sessionId,
  lineId,
  vendorName,
  serviceName,
  packageTier,
  date,
  time,
  location,
  eventType,
  price,
  addons = [],
  note = "",
  onNoteSaved,
}: ServiceDetailsModalProps) {
  const [detail, setDetail] = useState<PackageDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !packageId) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    getPackageDetail(packageId)
      .then((result) => {
        if (!cancelled) setDetail(result);
      })
      .catch(() => {
        if (!cancelled) setError("Couldn't load the full package details right now.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isOpen, packageId]);

  if (!isOpen) return null;

  const setups = detail ? mapSetups(detail) : [];
  const notIncluded = detail?.notIncluded ?? [];
  const policies = detail?.policies ?? [];

  const breakdownItems = detail
    ? detail.includedItems
        .filter((entry) => entry.price > 0)
        .map((entry) => ({
          id: entry.id,
          title: entry.title,
          subtitle: entry.details.find((d) => d.value && d.value !== "—")?.value,
          price: formatPrice(entry.price),
        }))
    : [];
  const itemsSubtotal = detail ? detail.includedItems.reduce((sum, entry) => sum + entry.price, 0) : 0;
  const addonsSubtotal = addons.reduce((sum, addon) => sum + addon.amount * addon.quantity, 0);
  const breakdownSubtotal = itemsSubtotal + addonsSubtotal;
  const gstPercent = detail?.pricing.gstPercent ?? 0;
  const gstAmount = Math.round((breakdownSubtotal * gstPercent) / 100);
  const breakdownTotal = breakdownSubtotal + gstAmount;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto sm:p-4 md:p-8">
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-10 flex min-h-full w-full flex-col bg-white sm:min-h-0 sm:max-w-[640px] sm:rounded-[24px] sm:shadow-xl">
        <div className="relative flex flex-col gap-2 border-b border-[#E4E4E7] pt-5 pr-7 pb-5 pl-7">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute top-5 right-7 flex h-8 w-8 items-center justify-center rounded-full text-[#030303] transition-colors hover:bg-[#F4F4F5]"
          >
            <X size={20} />
          </button>

          <span className="font-figtree text-[12px] font-normal leading-[18px] text-[#71717B]">
            {vendorName}
          </span>

          <h2 className="pr-10 font-figtree text-[18px] font-semibold leading-[28px] tracking-[-0.27px] text-[#030303]">
            {serviceName}
            {packageTier ? <> &middot; {packageTier}</> : null}
          </h2>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-1.5">
            <span className="flex items-center gap-2 font-figtree text-[12px] font-normal leading-[18px] text-[#3F3F47]">
              <Calendar size={16} className="text-[#9F9FA9]" />
              {date}
            </span>
            <span className="flex items-center gap-2 font-figtree text-[12px] font-normal leading-[18px] text-[#3F3F47]">
              <Clock size={16} className="text-[#9F9FA9]" />
              {time}
            </span>
            <span className="flex items-center gap-2 font-figtree text-[12px] font-normal leading-[18px] text-[#3F3F47]">
              <MapPin size={16} className="text-[#9F9FA9]" />
              {location}
            </span>
            {eventType && (
              <span className="flex items-center gap-2 font-figtree text-[12px] font-normal leading-[18px] text-[#3F3F47]">
                <Tag size={16} className="text-[#9F9FA9]" />
                {eventType}
              </span>
            )}
          </div>

          <div className="mt-1 flex items-center justify-between">
            <span className="font-figtree text-[18px] font-semibold leading-[20px] text-[#030303]">
              {price}
            </span>

            <Link
              href="/cart"
              className="flex items-center gap-1.5 font-figtree text-[14px] font-semibold leading-[22px] text-[#F0596F]"
            >
              <Pencil size={14} />
              Edit Package
            </Link>
          </div>
        </div>

        <div className="flex flex-col px-4 sm:px-7">
          {loading && (
            <p className="py-8 text-center font-figtree text-[13px] text-[#71717B]">
              Loading package details…
            </p>
          )}

          {error && (
            <p className="py-8 text-center font-figtree text-[13px] text-[#E7000B]">{error}</p>
          )}

          {!loading && !error && detail && (
            <>
              <CollapsibleSection label="Setups" count={`${setups.length} setup${setups.length === 1 ? "" : "s"}`}>
                <div className="flex flex-col gap-4">
                  {setups.map((article, i) => (
                    <SetupArticleCard key={i} {...article} />
                  ))}
                </div>
              </CollapsibleSection>

              <CollapsibleSection label="Add-ons" count={`${addons.length}`}>
                <div className="flex flex-col gap-5">
                  {addons.map((addon) => (
                    <AddOnRow
                      key={addon.id}
                      image={FALLBACK_IMAGE}
                      name={addon.name}
                      quantity={addon.quantity}
                      price={addon.price}
                      category=""
                      attributes={[]}
                    />
                  ))}
                </div>
              </CollapsibleSection>

              <CollapsibleSection label="Not included" count={`${notIncluded.length}`}>
                <div className="flex flex-col gap-4">
                  {notIncluded.map((name) => (
                    <NotIncludedRow key={name} name={name} />
                  ))}
                </div>
              </CollapsibleSection>

              {sessionId && lineId && (
                <CollapsibleSection label="Vendor Notes">
                  <VendorNoteSection sessionId={sessionId} lineId={lineId} initialNote={note} onSaved={onNoteSaved} />
                </CollapsibleSection>
              )}

              <CollapsibleSection label="Price breakdown">
                <PriceBreakdownContent
                  items={breakdownItems}
                  addons={addons}
                  subtotal={formatPrice(breakdownSubtotal)}
                  gstPercent={gstPercent}
                  gstAmount={formatPrice(gstAmount)}
                  total={formatPrice(breakdownTotal)}
                />
              </CollapsibleSection>

              <CollapsibleSection label="All policies" count={`${policies.length}`}>
                <AllPoliciesContent policies={policies} />
              </CollapsibleSection>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
