"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CalendarX, Check, CheckCircle2, Copy, ShieldCheck } from "lucide-react";
import type { BookingOrderGroup } from "../types";
import { formatAmount, formatBookedOn } from "../utils/groupBookings";

/** The pie-filled "waiting" glyph from the design; no lucide icon matches it. */
const PENDING_ICON = "/images/customer/booking-status-pending.svg";

type ChipTone = "pending" | "success" | "danger" | "neutral";
type ChipIcon = "pending" | "confirmed" | "locked" | "cancelled" | "completed";

interface StatusChip {
  id: string;
  icon: ChipIcon;
  tone: ChipTone;
  text: string;
}

const TONE_CLASS: Record<ChipTone, string> = {
  pending: "text-[#BB4D00]",
  success: "text-[#008236]",
  danger: "text-[#C81E0D]",
  neutral: "text-[#030303]",
};

function plural(count: number, singular: string, pluralForm: string) {
  return count === 1 ? singular : pluralForm;
}

/**
 * The booking card's status line, per the card's five designed states
 * (component set 1545:7339): Response for proposal, Booking pending,
 * Advance pending, canceled, compelted.
 *
 * A booking here is a GROUP of packages for one event, so a group can land
 * between those states (some cancelled, some confirmed). The designed states
 * are matched first, and anything left over is reported as its own chip
 * rather than being rounded to the nearest state.
 */
function statusChips(order: BookingOrderGroup): StatusChip[] {
  const total = order.packageCount;

  // Terminal states — the design gives each of these a single line of its own.
  if (total > 0 && order.cancelledCount === total) {
    return [{ id: "cancelled", icon: "cancelled", tone: "danger", text: "Cancelled by you" }];
  }
  if (total > 0 && order.completedCount === total) {
    return [{ id: "completed", icon: "completed", tone: "neutral", text: "Completed successfully" }];
  }

  const chips: StatusChip[] = [];

  if (order.allConfirmed) {
    chips.push({
      id: "locked",
      icon: "locked",
      tone: "success",
      text: "Event Locked in for all packages",
    });
  } else if (total > 0 && order.needsResponseCount === total) {
    // Nothing accepted yet — the whole booking is still sitting with vendors.
    chips.push({
      id: "pending",
      icon: "pending",
      tone: "pending",
      text: "Booking pending at Vendors",
    });
  } else {
    if (order.needsResponseCount > 0) {
      chips.push({
        id: "needs-response",
        icon: "pending",
        tone: "pending",
        text: `${order.needsResponseCount} ${plural(order.needsResponseCount, "package needs", "packages need")} response`,
      });
    }
    if (order.confirmedCount > 0) {
      chips.push({
        id: "confirmed",
        icon: "confirmed",
        tone: "success",
        text: `${order.confirmedCount} ${plural(order.confirmedCount, "package", "packages")} confirmed`,
      });
    }
  }

  if (order.advancePendingCount > 0) {
    chips.push({
      id: "advance",
      icon: "pending",
      tone: "pending",
      text: `Advance ${order.advancePendingCount} pending`,
    });
  }

  // Leftovers from a mixed group — no designed state covers these.
  if (order.cancelledCount > 0 && order.cancelledCount < total) {
    chips.push({
      id: "cancelled-some",
      icon: "cancelled",
      tone: "danger",
      text: `${order.cancelledCount} cancelled by you`,
    });
  }
  // A vendor declining reads differently from a self-cancel.
  if (order.declinedCount > 0) {
    chips.push({
      id: "declined",
      icon: "cancelled",
      tone: "danger",
      text:
        order.declinedCount === 1
          ? "Declined by vendor"
          : `${order.declinedCount} declined by vendor`,
    });
  }
  if (order.completedCount > 0 && order.completedCount < total) {
    chips.push({
      id: "completed-some",
      icon: "completed",
      tone: "neutral",
      text: `${order.completedCount} completed`,
    });
  }

  return chips;
}

function ChipIconGlyph({ icon }: { icon: ChipIcon }) {
  switch (icon) {
    case "pending":
      return <Image src={PENDING_ICON} alt="" width={14} height={14} className="h-3.5 w-3.5 shrink-0" />;
    case "confirmed":
      // Filled disc with a white tick, as the design's bold check circle.
      return <CheckCircle2 className="h-4 w-4 shrink-0 fill-[#008236] text-white" />;
    case "locked":
      return <ShieldCheck className="h-4 w-4 shrink-0" />;
    case "cancelled":
      return <CalendarX className="h-4 w-4 shrink-0" />;
    case "completed":
    default:
      return <CheckCircle2 className="h-4 w-4 shrink-0" />;
  }
}

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

  const chips = statusChips(order);

  return (
    <article className="overflow-hidden rounded-2xl border border-[#F0F0F0] bg-white px-4 py-[17px]">
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
                    {order.packageCount} {plural(order.packageCount, "package", "packages")}
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
              <div className="flex flex-wrap items-center gap-x-[17px] gap-y-2">
                {chips.map((chip) => (
                  <span
                    key={chip.id}
                    className={`flex items-center gap-[7px] text-[14px] font-medium ${TONE_CLASS[chip.tone]}`}
                  >
                    <ChipIconGlyph icon={chip.icon} />
                    {chip.text}
                  </span>
                ))}
              </div>
            </div>

            <Link
              href={`/bookings/${order.reference}`}
              className="shrink-0 self-start rounded-full border border-[#E4E4E7] px-3 py-1.5 text-[14px] font-medium leading-5 text-[#27272A] transition-colors hover:bg-[#FAFAFA] sm:self-auto"
            >
              View Booking
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
