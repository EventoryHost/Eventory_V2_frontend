"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { CalendarDays, ChevronDown, Clock, MapPin, Tag, X } from "lucide-react";
import { formatAmount } from "@/features/customer-account/utils/groupBookings";
import { getPackagePanelView, type PackagePanelView } from "../services/getPackagePanelView";
import PackageSetupCard from "./PackageSetupCard";

/** The stepper across the top of the panel, and where each status sits on it. */
const JOURNEY = ["Booking confirmed", "Additional request pending", "Proposal", "Event Locked"] as const;

const STATUS_STEP: Record<string, number> = {
  NewBooking: -1,
  Viewed: -1,
  InDiscussion: 1,
  Confirmed: 0,
  Completed: 3,
  Declined: -1,
  Cancelled: -1,
};

/** The highlighted "where things stand" line under the stepper. */
const STATUS_CALLOUT: Record<string, { title: string; description: string }> = {
  NewBooking: { title: "Booking sent", description: "Waiting for vendor to view." },
  Viewed: { title: "Vendor has viewed your booking", description: "Waiting for them to respond." },
  InDiscussion: { title: "Additional request pending", description: "The vendor is reviewing your requests." },
  Confirmed: { title: "Booking confirmed", description: "Your package is locked in for the event." },
  Completed: { title: "Event complete", description: "This package has been delivered." },
  Declined: { title: "Declined by vendor", description: "This package wasn't taken up." },
  Cancelled: { title: "Cancelled", description: "This package was cancelled." },
};

function MetaChip({ icon: Icon, children }: { icon: typeof Clock; children: React.ReactNode }) {
  return (
    <span className="flex items-center gap-1.5 text-[12px] leading-[18px] text-[#71717B]">
      <Icon className="h-3.5 w-3.5 shrink-0" />
      {children}
    </span>
  );
}

function Section({
  title,
  count,
  defaultOpen = false,
  children,
}: {
  title: string;
  count?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <section className="border-b border-[#E4E4E7]">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between py-4 text-left"
      >
        <span className="flex items-baseline gap-2">
          <span className="text-[16px] font-semibold leading-[23px] text-[#030303]">{title}</span>
          {count && <span className="text-[16px] leading-[23px] text-[#71717B]">({count})</span>}
        </span>
        <ChevronDown
          className={`h-[18px] w-[18px] shrink-0 text-[#71717B] transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      {isOpen && <div className="pb-5">{children}</div>}
    </section>
  );
}

function formatEventDate(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

/**
 * The 640px package panel (node 1629:9256) — one booked package in full:
 * where it stands, what's in it, what the customer asked to change, what it
 * costs and the policies behind it.
 */
export default function BookingPackagePanel({
  bookingReference,
  onClose,
}: {
  bookingReference: string;
  onClose: () => void;
}) {
  const [view, setView] = useState<PackagePanelView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasSettled, setHasSettled] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getPackagePanelView(bookingReference)
      .then((next) => {
        if (!cancelled) setView(next);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Could not load this package");
      })
      .finally(() => {
        if (!cancelled) setHasSettled(true);
      });

    return () => {
      cancelled = true;
    };
  }, [bookingReference]);

  // Escape closes, and the page behind shouldn't scroll while this is open.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  const currentStep = view ? (STATUS_STEP[view.status] ?? -1) : -1;
  const callout = view ? STATUS_CALLOUT[view.status] : undefined;
  const eventDate = view ? formatEventDate(view.eventDate) : null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40" role="dialog" aria-modal="true">
      <button type="button" aria-label="Close" className="flex-1 cursor-default" onClick={onClose} />

      <div className="flex h-full w-full max-w-[640px] flex-col overflow-y-auto bg-white">
        {!hasSettled ? (
          <p className="p-7 text-[14px] leading-5 text-[#71717B]">Loading this package…</p>
        ) : error || !view ? (
          <div className="flex flex-col items-start gap-3 p-7">
            <p className="text-[14px] leading-5 text-[#C81E0D]">{error ?? "Could not load this package"}</p>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-[#E4E4E7] px-4 py-1.5 text-[14px] font-medium text-[#27272A]"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex flex-col gap-3 border-b border-[#E4E4E7] px-7 py-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 flex-col gap-0.5">
                  {view.vendorName && (
                    <p className="text-[12px] leading-[18px] text-[#71717B]">{view.vendorName}</p>
                  )}
                  <h3 className="text-[20px] font-semibold leading-7 text-[#030303]">
                    {view.packageName}
                    {view.variantLabel ? ` · ${view.variantLabel}` : ""}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close package details"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#030303] transition-colors hover:bg-[#F4F4F5]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                {eventDate && <MetaChip icon={CalendarDays}>{eventDate}</MetaChip>}
                {(view.startTime || view.endTime) && (
                  <MetaChip icon={Clock}>
                    {[view.startTime, view.endTime].filter(Boolean).join(" – ")}
                  </MetaChip>
                )}
                {view.location && <MetaChip icon={MapPin}>{view.location}</MetaChip>}
                {view.eventType && <MetaChip icon={Tag}>{view.eventType}</MetaChip>}
              </div>

              <p className="text-[20px] font-semibold leading-7 text-[#030303]">{formatAmount(view.total)}</p>
            </div>

            <div className="flex flex-col bg-[#FAFAFA] px-7">
              <Section title="Timeline" defaultOpen>
                <div className="flex flex-col gap-6">
                  <ol className="flex items-start justify-between gap-2">
                    {JOURNEY.map((label, index) => {
                      const isReached = index <= currentStep;
                      return (
                        <li key={label} className="flex flex-1 flex-col items-center gap-3 text-center">
                          <span className="flex w-full items-center">
                            <span aria-hidden className={`h-px flex-1 ${index === 0 ? "bg-transparent" : "bg-[#E4E4E7]"}`} />
                            <span
                              className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-2 ${
                                isReached ? "border-brand-primary bg-white" : "border-[#E4E4E7] bg-white"
                              }`}
                            >
                              {isReached && <span className="h-2 w-2 rounded-full bg-brand-primary" />}
                            </span>
                            <span
                              aria-hidden
                              className={`h-px flex-1 ${index === JOURNEY.length - 1 ? "bg-transparent" : "bg-[#E4E4E7]"}`}
                            />
                          </span>
                          <span
                            className={`text-[14px] leading-5 ${
                              isReached ? "font-semibold text-[#030303]" : "text-[#9F9FA9]"
                            }`}
                          >
                            {label}
                          </span>
                        </li>
                      );
                    })}
                  </ol>

                  {callout && (
                    <div className="flex items-start gap-3 rounded-xl border border-brand-primary bg-brand-subtle px-4 py-3">
                      <span className="mt-1 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border-2 border-brand-primary">
                        <span className="h-1 w-1 rounded-full bg-brand-primary" />
                      </span>
                      <div className="flex flex-col">
                        <p className="text-[16px] font-semibold leading-6 text-[#030303]">{callout.title}</p>
                        <p className="text-[14px] leading-5 text-[#71717B]">{callout.description}</p>
                      </div>
                    </div>
                  )}
                </div>
              </Section>

              <Section
                title="Setups"
                count={`${view.setups.length} ${view.setups.length === 1 ? "setup" : "setups"}`}
                defaultOpen
              >
                <div className="flex flex-col gap-4">
                  {view.setups.length === 0 ? (
                    <p className="text-[14px] leading-5 text-[#71717B]">
                      This package doesn&apos;t list individual setups.
                    </p>
                  ) : (
                    view.setups.map((setup) => <PackageSetupCard key={setup.entry.id} setup={setup} />)
                  )}
                </div>
              </Section>

              {view.addOns.length > 0 && (
                <Section title="Add-ons" count={String(view.addOns.length)} defaultOpen>
                  <ul className="flex flex-col gap-5">
                    {view.addOns.map((addOn) => (
                      <li key={addOn.id} className="flex gap-3">
                        <div className="relative h-[84px] w-[84px] shrink-0 overflow-hidden rounded-xl bg-[#F4F4F5]">
                          {addOn.image && (
                            <Image src={addOn.image} alt={addOn.name} fill sizes="84px" className="object-cover" />
                          )}
                        </div>

                        <div className="flex min-w-0 flex-1 flex-col gap-2">
                          <div className="flex flex-col gap-0.5">
                            <div className="flex items-baseline justify-between gap-3">
                              <p className="truncate text-[14px] font-semibold leading-5 text-[#030303]">
                                {addOn.name} ×{addOn.quantity}
                              </p>
                              <span className="shrink-0 text-[14px] font-semibold leading-5 text-[#030303]">
                                {formatAmount(addOn.price * addOn.quantity)}
                              </span>
                            </div>
                            {addOn.categoryLabel && (
                              <p className="truncate text-[14px] leading-5 text-[#71717B]">{addOn.categoryLabel}</p>
                            )}
                          </div>

                          {addOn.colourLabel && (
                            <p className="rounded-lg bg-[#F4F4F5] px-3 py-2 text-[12px] leading-[18px] text-[#3F3F47]">
                              Color: {addOn.colourLabel}
                            </p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </Section>
              )}

              {view.notIncluded.length > 0 && (
                <Section title="Not included" count={String(view.notIncluded.length)}>
                  <ul className="flex list-disc flex-col gap-2 pl-5">
                    {view.notIncluded.map((item) => (
                      <li key={item} className="text-[14px] leading-5 text-[#3F3F47]">
                        {item}
                      </li>
                    ))}
                  </ul>
                </Section>
              )}

              {view.notes && (
                <Section title="Your notes" defaultOpen>
                  <p className="text-[14px] leading-5 text-[#3F3F47]">{view.notes}</p>
                </Section>
              )}

              <Section title="Pricing Breakdown" defaultOpen>
                <div className="flex flex-col gap-3 rounded-xl border border-[#E4E4E7] bg-white p-4">
                  {view.charges.map((charge, index) => (
                    <div key={`${charge.label}-${index}`} className="flex items-baseline justify-between gap-4">
                      <span className="text-[14px] leading-6 text-[#3F3F47]">{charge.label}</span>
                      <span className="text-[14px] font-medium leading-6 text-[#030303]">
                        {formatAmount(charge.amount)}
                      </span>
                    </div>
                  ))}

                  <span aria-hidden className="h-px w-full bg-[#E4E4E7]" />

                  <div className="flex items-baseline justify-between gap-4">
                    <span className="text-[14px] leading-6 text-[#3F3F47]">Package subtotal</span>
                    <span className="text-[14px] font-medium leading-6 text-[#030303]">
                      {formatAmount(view.subtotal)}
                    </span>
                  </div>
                  {view.discountAmount > 0 && (
                    <div className="flex items-baseline justify-between gap-4">
                      <span className="text-[14px] leading-6 text-[#3F3F47]">Discount</span>
                      <span className="text-[14px] font-medium leading-6 text-[#008236]">
                        -{formatAmount(view.discountAmount)}
                      </span>
                    </div>
                  )}
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="text-[14px] font-semibold leading-6 text-[#030303]">Total</span>
                    <span className="text-[14px] font-semibold leading-6 text-[#030303]">
                      {formatAmount(view.grandTotal)}
                    </span>
                  </div>
                </div>
              </Section>

              <Section title="All policies">
                <div className="flex flex-col gap-5">
                  {[
                    { title: "Cancellation", slot: view.policies.cancellation },
                    { title: "Last-minute changes", slot: view.policies.lastMinute },
                    ...view.policies.general.map((slot, index) => ({
                      title: slot.templateTitle || `Vendor policy ${index + 1}`,
                      slot,
                    })),
                  ]
                    .filter((policy) => policy.slot)
                    .map((policy, index) => (
                      <div key={`${policy.title}-${index}`} className="flex flex-col gap-1.5">
                        <p className="text-[14px] font-semibold leading-5 text-[#030303]">{policy.title}</p>
                        <p className="text-[14px] leading-5 text-[#3F3F47]">
                          {policy.slot?.writtenText || policy.slot?.templateTitle}
                        </p>
                        {policy.slot?.files?.[0] && (
                          <a
                            href={policy.slot.files[0]}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[14px] font-medium leading-5 text-brand-primary hover:underline"
                          >
                            Read the full policy
                          </a>
                        )}
                      </div>
                    ))}

                  {!view.policies.cancellation &&
                    !view.policies.lastMinute &&
                    view.policies.general.length === 0 && (
                      <p className="text-[14px] leading-5 text-[#71717B]">
                        This vendor hasn&apos;t published policies yet.
                      </p>
                    )}

                  {view.policies.note && (
                    <p className="text-[12px] leading-[18px] text-[#9F9FA9]">{view.policies.note}</p>
                  )}
                </div>
              </Section>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
