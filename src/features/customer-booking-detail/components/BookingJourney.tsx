import Image from "next/image";
import Link from "next/link";
import { Check } from "lucide-react";
import type { BookingJourneyStep, BookingJourneyVendor } from "../types";

function formatStepDate(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

const BADGE_TONE: Record<NonNullable<BookingJourneyVendor["badge"]>["tone"], string> = {
  confirmed: "text-[#067647] bg-[#ECFDF3]",
  pending: "text-[#B54708] bg-[#FFFAEB]",
  declined: "text-[#B42318] bg-[#FEF3F2]",
};

/**
 * One vendor nested inside a step — the card list the vendor-confirmation
 * state shows under "N of M Vendors confirmed".
 */
function JourneyVendorCard({ vendor }: { vendor: BookingJourneyVendor }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-[#E4E4E7] bg-white p-3">
      {vendor.image && (
        <div className="relative h-12 w-14 shrink-0 overflow-hidden rounded-lg bg-neutral-subtle">
          <Image src={vendor.image} alt="" fill sizes="56px" className="object-cover" />
        </div>
      )}

      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-semibold text-[#030303]">
          {vendor.vendorName}
          {vendor.variantLabel && (
            <span className="font-normal text-[#71717B]"> · {vendor.variantLabel}</span>
          )}
        </p>
        <p className="truncate text-[12px] text-[#71717B]">{vendor.packageName}</p>
        {vendor.timeLabel && <p className="truncate text-[12px] text-[#9F9FA9]">{vendor.timeLabel}</p>}
      </div>

      {/* A vendor the customer can act on gets the link; everyone else a pill. */}
      {vendor.action ? (
        <Link
          href={vendor.action.href}
          className="shrink-0 text-[12px] font-semibold text-brand-primary hover:underline"
        >
          {vendor.action.label}
        </Link>
      ) : (
        vendor.badge && (
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide ${BADGE_TONE[vendor.badge.tone]}`}
          >
            {vendor.badge.label}
          </span>
        )
      )}
    </div>
  );
}

/**
 * The event journey (nodes 1629:6393 / 6731 / 7379 / 8629): a marker per
 * step joined by a connector, reached steps in full colour and the rest
 * muted. A completed step is ticked; the step in progress shows a hollow
 * ring; steps can carry a right-aligned action and a nested vendor list.
 */
export default function BookingJourney({ steps }: { steps: BookingJourneyStep[] }) {
  return (
    <ol className="flex flex-col">
      {steps.map((step, index) => {
        const isReached = step.state !== "upcoming";
        const isLast = index === steps.length - 1;
        const date = step.date ? formatStepDate(step.date) : null;

        return (
          <li key={step.id} className="flex gap-2">
            {/* Marker + connector */}
            <div className="flex w-8 shrink-0 flex-col items-center">
              <span
                className={`mt-1 flex h-[22px] w-[22px] items-center justify-center rounded-full border-2 ${
                  step.state === "current"
                    ? "border-brand-primary"
                    : step.state === "done"
                      ? "border-brand-primary bg-brand-primary"
                      : "border-[#E4E4E7]"
                }`}
              >
                {step.state === "done" ? (
                  <Check className="h-3 w-3 text-white" strokeWidth={3} />
                ) : (
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      step.state === "current" ? "bg-brand-primary" : "bg-white"
                    }`}
                  />
                )}
              </span>
              {!isLast && (
                <span
                  aria-hidden
                  className={`w-px flex-1 ${step.state === "done" ? "bg-brand-primary" : "bg-[#E4E4E7]"}`}
                />
              )}
            </div>

            <div className={`flex flex-1 flex-col gap-1.5 pt-1 ${isLast ? "" : "pb-8"}`}>
              <div className="flex items-baseline justify-between gap-4">
                <p
                  className={`text-[16px] font-semibold leading-[23px] ${
                    isReached ? "text-[#030303]" : "text-[#71717B]"
                  }`}
                >
                  {step.title}
                </p>
                {step.action ? (
                  <Link
                    href={step.action.href}
                    className="shrink-0 text-[13px] font-semibold text-brand-primary hover:underline"
                  >
                    {step.action.label}
                  </Link>
                ) : (
                  date && <span className="shrink-0 text-[14px] leading-5 text-[#9F9FA9]">{date}</span>
                )}
              </div>
              <p className={`text-[14px] leading-5 ${isReached ? "text-[#71717B]" : "text-[#9F9FA9]"}`}>
                {step.description}
              </p>

              {step.vendors && step.vendors.length > 0 && (
                <div className="mt-2 flex flex-col gap-2">
                  {step.vendors.map((vendor) => (
                    <JourneyVendorCard key={vendor.id} vendor={vendor} />
                  ))}
                </div>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
