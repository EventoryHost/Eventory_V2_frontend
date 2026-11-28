"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X, ChevronDown, ChevronRight } from "lucide-react";
import type { IncludedItemEntry, SelectedAddon } from "../types";
import type { RawConvenienceFeeBreakdown } from "@/lib/customerCartApi";
import ConvenienceFeeInfo from "@/components/customer/ConvenienceFeeInfo";
import { formatPrice } from "../utils/formatPrice";
import { getCancellationTiers, formatShortDate } from "../utils/cancellationPolicy";

// What sits under a setup's name in the "What's included" list: the items it
// contains ("Balloons + Jasmine"), or failing that its first descriptive fact.
function setupSubtitle(item: IncludedItemEntry): string | undefined {
  const names = item.items.map((line) => line.label.trim()).filter(Boolean);
  if (names.length > 0) {
    const shown = names.slice(0, 3).join(" + ");
    return names.length > 3 ? `${shown} + ${names.length - 3} more` : shown;
  }
  const detail = item.details.find((entry) => entry.value && entry.value !== "—");
  return detail ? `${detail.label}: ${detail.value}` : undefined;
}

const NUMBER_WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];

/**
 * Price breakdown (Figma nodes 3331:35732, 3331:35779, 3331:35843). Everything
 * shown is computed from the package and the customer's own choices: the
 * package name, event date and guests in the subtitle, each setup's price, the
 * crew and equipment line (only when the vendor charges one), the selected
 * add-ons, GST, the service fee, the total and the refund dates.
 */
export default function PriceBreakdownDialog({
  isOpen,
  onClose,
  packageTitle,
  categoryLabel,
  guestCount,
  includedItems,
  teamAndEquipmentCharge,
  selectedAddons,
  overtimeChargeRate,
  overtimeBillingUnit,
  subtotal,
  gstPercent,
  gstAmount,
  convenienceFee = 0,
  convenienceFeePending = false,
  convenienceFeeReason = null,
  convenienceFeeBreakdown = null,
  estimatedTotal,
  eventDateIso,
  onViewCancellationPolicy,
}: {
  isOpen: boolean;
  onClose: () => void;
  packageTitle: string;
  categoryLabel: string;
  /** The guests the customer entered, "" when this package has none or none is entered. */
  guestCount: string;
  includedItems: IncludedItemEntry[];
  /** The vendor's flat crew and equipment charge, 0 when there isn't one. */
  teamAndEquipmentCharge: number;
  selectedAddons: SelectedAddon[];
  overtimeChargeRate: number;
  overtimeBillingUnit?: string;
  subtotal: number;
  gstPercent: number;
  gstAmount: number;
  /** Platform fee (0 when no event date is picked yet, see convenienceFeePending). */
  convenienceFee?: number;
  /** A date is picked but the backend couldn't compute the fee: show "calculated once you set your event date" instead of ₹0. */
  convenienceFeePending?: boolean;
  convenienceFeeReason?: string | null;
  convenienceFeeBreakdown?: RawConvenienceFeeBreakdown | null;
  estimatedTotal: number;
  eventDateIso: string | null;
  onViewCancellationPolicy: () => void;
}) {
  const [includedOpen, setIncludedOpen] = useState(false);
  if (typeof document === "undefined") return null;

  const addonsTotal = selectedAddons.reduce((sum, addon) => sum + addon.price * addon.quantity, 0);
  const tiers = eventDateIso ? getCancellationTiers(eventDateIso) : null;
  const eventDate = tiers ? formatShortDate(tiers.eventDate) : null;
  const guests = Number(guestCount);

  // The package line is the package price, which is everything except the add-ons.
  const packageAmount = Math.max(0, subtotal - addonsTotal);
  const crewCharge = Math.max(0, teamAndEquipmentCharge);

  // Each setup at its own price (before the crew share was spread over them),
  // plus the crew line, which together add up to the package amount.
  const setupRows = includedItems.map((item) => ({
    id: item.id,
    title: item.title,
    subtitle: setupSubtitle(item),
    price: item.basePrice ?? item.price,
  }));
  const listedTotal = setupRows.reduce((sum, row) => sum + row.price, 0) + crewCharge;
  // The vendor's package price can be higher than the setups they listed. Show the
  // rest as its own line so what is listed always adds up to the package price.
  const unlisted = packageAmount - listedTotal;
  const otherCharges = unlisted > 0 ? unlisted : 0;
  const lineCount = setupRows.length + (crewCharge > 0 ? 1 : 0) + (otherCharges > 0 ? 1 : 0);
  const canListIncluded = setupRows.length > 0;
  const listAddsUp = unlisted >= 0;

  const subtitle = [
    packageTitle,
    eventDate,
    Number.isFinite(guests) && guests > 0 ? `${guests} guest${guests === 1 ? "" : "s"}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const includes = [
    gstAmount > 0 ? `${gstPercent}% GST` : null,
    crewCharge > 0 ? "setup crew and equipment" : null,
    convenienceFee > 0 ? "the service & security fee" : null,
  ].filter((part): part is string => part !== null);
  const includesText =
    includes.length === 0
      ? "Estimated for your current selections"
      : `Includes ${includes.length > 1 ? `${includes.slice(0, -1).join(", ")} and ${includes[includes.length - 1]}` : includes[0]}`;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60"
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Price breakdown"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="relative flex max-h-[90vh] w-full max-w-[512px] flex-col gap-5 overflow-y-auto rounded-3xl bg-white p-6 shadow-[0_6px_8px_rgba(3,3,3,0.05)]"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <h3 className="font-figtree text-[24px] leading-8 font-bold text-[#030303]">Price breakdown</h3>
                <p className="font-figtree text-[14px] leading-5 text-[#3F3F47]">{subtitle}</p>
              </div>
              <button
                type="button"
                aria-label="Close"
                onClick={onClose}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F4F4F5] text-[#030303] transition-colors hover:bg-[#E4E4E7]"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <div className="flex items-start gap-4 font-figtree text-[16px] leading-6 font-semibold text-[#030303]">
                  <p className="min-w-0 flex-1">{categoryLabel} package</p>
                  <p className="shrink-0 whitespace-nowrap">{formatPrice(packageAmount)}</p>
                </div>
                {canListIncluded && (
                  <button
                    type="button"
                    onClick={() => setIncludedOpen((open) => !open)}
                    aria-expanded={includedOpen}
                    className="flex w-fit items-center gap-1 pt-2 font-figtree text-[14px] leading-5 font-semibold text-[#030303]"
                  >
                    What&apos;s included
                    <ChevronDown className={`h-3.5 w-3.5 transition-transform ${includedOpen ? "rotate-180" : ""}`} />
                  </button>
                )}
              </div>

              {canListIncluded && includedOpen && (
                <div className="flex flex-col gap-3 rounded-xl bg-[#FAFAFA] p-4">
                  {setupRows.map((row) => (
                    <div key={row.id} className="flex items-start gap-4">
                      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <p className="font-figtree text-[16px] leading-6 text-[#030303]">{row.title}</p>
                        {row.subtitle && (
                          <p className="font-figtree text-[12px] leading-[18px] text-[#3F3F47]">{row.subtitle}</p>
                        )}
                      </div>
                      <p className="shrink-0 font-figtree text-[16px] leading-6 font-medium whitespace-nowrap text-[#3F3F47]">
                        {formatPrice(row.price)}
                      </p>
                    </div>
                  ))}
                  {crewCharge > 0 && (
                    <div className="flex items-start gap-4">
                      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <p className="font-figtree text-[16px] leading-6 text-[#030303]">Setup crew &amp; equipment</p>
                        <p className="font-figtree text-[12px] leading-[18px] text-[#3F3F47]">
                          Delivery, installation and takedown by the vendor
                        </p>
                      </div>
                      <p className="shrink-0 font-figtree text-[16px] leading-6 font-medium whitespace-nowrap text-[#3F3F47]">
                        {formatPrice(crewCharge)}
                      </p>
                    </div>
                  )}
                  {otherCharges > 0 && (
                    <div className="flex items-start gap-4">
                      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <p className="font-figtree text-[16px] leading-6 text-[#030303]">Other package charges</p>
                        <p className="font-figtree text-[12px] leading-[18px] text-[#3F3F47]">
                          Part of the package price the vendor hasn&apos;t itemised
                        </p>
                      </div>
                      <p className="shrink-0 font-figtree text-[16px] leading-6 font-medium whitespace-nowrap text-[#3F3F47]">
                        {formatPrice(otherCharges)}
                      </p>
                    </div>
                  )}
                  <p className="font-figtree text-[12px] leading-[18px] text-[#3F3F47]">
                    {!listAddsUp
                      ? "Setup prices are shown for reference. The package price above is what you pay."
                      : lineCount > 1
                        ? `These ${NUMBER_WORDS[lineCount] ?? lineCount} lines add up to the ${formatPrice(packageAmount)} package price.`
                        : "This price includes setup crew and equipment."}
                  </p>
                </div>
              )}

              {selectedAddons.length > 0 && (
                <>
                  <div className="h-px w-full bg-[#E4E4E7]" />
                  <div className="flex flex-col gap-2">
                    <div className="flex items-start gap-4 font-figtree text-[16px] leading-6 font-semibold text-[#030303]">
                      <p className="min-w-0 flex-1">Add-ons ({selectedAddons.length})</p>
                      <p className="shrink-0 whitespace-nowrap">{formatPrice(addonsTotal)}</p>
                    </div>
                    <div className="flex flex-col gap-1.5 font-figtree text-[16px] leading-6 text-[#3F3F47]">
                      {selectedAddons.map((addon) => (
                        <div key={addon.lineKey} className="flex items-start gap-4">
                          <p className="min-w-0 flex-1">
                            {addon.title}
                            {addon.quantity > 1 && ` × ${addon.quantity}`}
                          </p>
                          <p className="shrink-0 whitespace-nowrap">{formatPrice(addon.price * addon.quantity)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <div className="h-px w-full bg-[#E4E4E7]" />

              <div className="flex flex-col gap-2 font-figtree text-[16px] leading-6 text-[#3F3F47]">
                <div className="flex items-end gap-4">
                  <p className="min-w-0 flex-1">Subtotal</p>
                  <p className="shrink-0 whitespace-nowrap">{formatPrice(subtotal)}</p>
                </div>
                {gstAmount > 0 && (
                  <div className="flex items-end gap-4">
                    <p className="min-w-0 flex-1">GST {gstPercent}%</p>
                    <p className="shrink-0 whitespace-nowrap">{formatPrice(gstAmount)}</p>
                  </div>
                )}
                {convenienceFee > 0 && (
                  <div className="flex items-end gap-4">
                    <p className="flex min-w-0 flex-1 items-center gap-1">
                      Service &amp; security fee
                      <ConvenienceFeeInfo reason={convenienceFeeReason} breakdown={convenienceFeeBreakdown} />
                    </p>
                    <p className="shrink-0 whitespace-nowrap">{formatPrice(convenienceFee)}</p>
                  </div>
                )}
                {convenienceFeePending && (
                  <div className="flex items-end gap-4 text-[#71717B]">
                    <p className="min-w-0 flex-1">Service &amp; security fee</p>
                    <p className="text-right">Calculated once you set your event date</p>
                  </div>
                )}
              </div>

              <div className="flex items-start justify-between gap-4 rounded-2xl bg-[#FAFAFA] p-5">
                <div className="flex min-w-0 flex-col gap-1">
                  <p className="font-figtree text-[16px] leading-6 font-semibold text-[#030303]">Total you pay</p>
                  <p className="max-w-[200px] font-figtree text-[14px] leading-5 text-[#3F3F47]">{includesText}</p>
                </div>
                <p className="shrink-0 font-figtree text-[32px] leading-10 font-bold whitespace-nowrap text-[#030303]">
                  {formatPrice(estimatedTotal)}
                </p>
              </div>
            </div>

            {overtimeChargeRate > 0 && (
              <p className="font-figtree text-[12px] leading-[18px] text-[#71717B]">
                Overtime charged at {formatPrice(overtimeChargeRate)}
                {overtimeBillingUnit ? `/${overtimeBillingUnit}` : ""} if the event runs over. Not included above.
              </p>
            )}

            <div className="h-px w-full bg-[#E4E4E7]" />

            <button type="button" onClick={onViewCancellationPolicy} className="flex flex-col gap-1 text-left">
              <span className="flex w-full items-center justify-between font-figtree text-[12px] leading-4 font-medium tracking-[0.72px] text-[#3F3F47]">
                CANCELLATION
                <ChevronRight className="h-4 w-4" />
              </span>
              {tiers ? (
                <>
                  <span className="font-figtree text-[16px] leading-6 font-semibold text-[#030303]">
                    Full refund until {formatShortDate(tiers.fullRefundCutoff)}
                  </span>
                  <span className="font-figtree text-[14px] leading-5 text-[#3F3F47]">
                    50% refund until {formatShortDate(tiers.halfRefundCutoff)} · no refund after
                  </span>
                </>
              ) : (
                <span className="font-figtree text-[14px] leading-5 text-[#3F3F47]">
                  Pick an event date to see exactly when you get a full or 50% refund.
                </span>
              )}
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
