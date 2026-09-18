"use client";

import { useState } from "react";
import Image from "next/image";
import { CalendarX, Check, CheckCircle2, Copy, ShieldCheck, TriangleAlert } from "lucide-react";
import type { BookingOrderGroup } from "../types";
import { formatAmount, formatBookedOn } from "../utils/groupBookings";

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-[12px] font-medium uppercase leading-[18px] text-[#9F9FA9]">{label}</p>
      <p className="text-[14px] font-medium leading-5 text-[#3F3F47]">{value}</p>
    </div>
  );
}

export default function ActiveBookingCard({ order }: { order: BookingOrderGroup }) {
  const [copied, setCopied] = useState(false);

  async function copyReference() {
    try {
      await navigator.clipboard.writeText(order.reference);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard blocked (insecure origin / permission) — the reference is
      // still on screen to copy by hand.
    }
  }

  return (
    <article className="overflow-hidden rounded-2xl border border-[#E4E4E7] bg-white px-4 py-[17px]">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-[15px]">
          {order.image ? (
            <Image
              src={order.image}
              alt={order.title}
              width={115}
              height={115}
              className="h-[115px] w-full shrink-0 rounded-[10px] object-cover sm:w-[115px]"
            />
          ) : (
            <div className="h-[115px] w-full shrink-0 rounded-[10px] bg-[#F4F4F5] sm:w-[115px]" />
          )}

          <div className="flex min-w-0 flex-1 flex-col gap-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex min-w-0 flex-col gap-0.5">
                <div className="flex flex-wrap items-center gap-1.5">
                  <h3 className="text-[16px] font-semibold leading-6 tracking-[-0.01em] text-black">
                    {order.title}
                  </h3>
                  <span aria-hidden className="h-1 w-1 rounded-full bg-[#D4D4D8]" />
                  <span className="text-[14px] font-medium leading-5 text-[#71717B]">
                    {order.packageCount} {order.packageCount === 1 ? "package" : "packages"}
                  </span>
                </div>
                {order.packagesSummary && (
                  <p className="truncate text-[14px] leading-5 text-[#71717B]">{order.packagesSummary}</p>
                )}
              </div>

              <div className="flex shrink-0 items-center gap-1.5">
                <span className="text-[12px] font-medium leading-[18px] text-[#71717B]">
                  {order.reference}
                </span>
                <button
                  type="button"
                  onClick={copyReference}
                  aria-label={`Copy booking reference ${order.reference}`}
                  className="text-[#71717B] transition-colors hover:text-[#3F3F47]"
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-[#008236]" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
              <Stat label="Order Total" value={formatAmount(order.orderTotal)} />
              <Stat label="Token Paid" value={formatAmount(order.tokenPaid)} />
              <Stat label="Booked On" value={formatBookedOn(order.bookedOn)} />
              <Stat label="Location of Event" value={order.location || "—"} />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 px-0.5">
          <span aria-hidden className="h-px w-full bg-[#E4E4E7]" />

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-2">
              <p className="text-[11px] leading-4 text-[#9F9FA9]">BOOKING STATUS</p>
              <div className="flex flex-wrap items-center gap-4">
                {/* Every package confirmed collapses to one row rather than a
                    count, per the design's "All packages confirmed". */}
                {order.allConfirmed ? (
                  <span className="flex items-center gap-[7px] text-[14px] font-medium text-[#008236]">
                    <ShieldCheck className="h-4 w-4 shrink-0" />
                    All packages confirmed
                  </span>
                ) : (
                  <>
                    {order.needsResponseCount > 0 && (
                      <span className="flex items-center gap-[7px] text-[14px] font-medium text-[#BB4D00]">
                        <TriangleAlert className="h-4 w-4 shrink-0" />
                        {order.needsResponseCount}{" "}
                        {order.needsResponseCount === 1 ? "package needs" : "packages need"} response
                      </span>
                    )}
                    {order.confirmedCount > 0 && (
                      <span className="flex items-center gap-[7px] text-[14px] font-medium text-[#008236]">
                        <CheckCircle2 className="h-4 w-4 shrink-0" />
                        {order.confirmedCount}{" "}
                        {order.confirmedCount === 1 ? "package" : "packages"} confirmed
                      </span>
                    )}
                  </>
                )}

                {order.cancelledCount > 0 && (
                  <span className="flex items-center gap-[7px] text-[14px] font-medium text-[#C81E0D]">
                    <CalendarX className="h-4 w-4 shrink-0" />
                    Cancelled by you
                  </span>
                )}
                {/* A vendor declining reads differently from a self-cancel, so
                    it gets its own wording rather than sharing the above. */}
                {order.declinedCount > 0 && (
                  <span className="flex items-center gap-[7px] text-[14px] font-medium text-[#C81E0D]">
                    <CalendarX className="h-4 w-4 shrink-0" />
                    {order.declinedCount === 1 ? "Declined by vendor" : `${order.declinedCount} declined by vendor`}
                  </span>
                )}
                {order.completedCount > 0 && (
                  <span className="flex items-center gap-[7px] text-[14px] font-medium text-[#008236]">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    {order.completedCount === 1 ? "Completed" : `${order.completedCount} completed`}
                  </span>
                )}
              </div>
            </div>

            {/* No customer-facing booking-detail route exists yet, so this
                stays inert rather than linking to a 404. */}
            <button
              type="button"
              aria-disabled
              title="Booking details page isn't built yet"
              className="shrink-0 cursor-default self-start rounded-full border border-[#E4E4E7] px-3 py-1.5 text-[14px] font-medium leading-5 text-[#27272A] sm:self-auto"
            >
              View Booking
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
