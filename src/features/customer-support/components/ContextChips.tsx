"use client";

import { CalendarDays, FileText, MapPin, Package, PartyPopper, Store, Users } from "lucide-react";
import type { SupportContext } from "../types";
import { formatContextDate } from "../utils/format";

/** "Shared with your ticket" — everything the page auto-attaches, so nothing is a surprise. */
export default function ContextChips({ context, title = "Shared with your ticket" }: { context: SupportContext; title?: string }) {
  const items = [
    context.bookingId && { icon: FileText, text: context.bookingId },
    context.packageName && { icon: Package, text: context.packageName },
    context.vendorName && { icon: Store, text: context.vendorName },
    context.eventType && { icon: PartyPopper, text: context.eventType },
    context.eventDate && { icon: CalendarDays, text: formatContextDate(context.eventDate) },
    context.location && { icon: MapPin, text: context.location },
    context.guests && { icon: Users, text: context.guests },
  ].filter(Boolean) as { icon: typeof FileText; text: string }[];

  if (items.length === 0 && !context.pageName) return null;

  return (
    <div className="rounded-2xl border border-dashed border-[#D4D4D8] bg-[#FAFAFA] p-3" data-testid="support-context-chips">
      <p className="mb-2 font-figtree text-[11px] font-bold tracking-[0.08em] text-[#71717B] uppercase">
        {title}
        {context.pageName && <span className="ml-1 font-medium tracking-normal normal-case">· from {context.pageName}</span>}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {items.map(({ icon: Icon, text }) => (
          <span
            key={text}
            className="flex max-w-full items-center gap-1.5 rounded-full border border-[#E4E4E7] bg-white px-2.5 py-1 font-figtree text-[12px] font-medium text-[#3F3F47]"
          >
            <Icon className="h-3.5 w-3.5 shrink-0 text-[#71717B]" />
            <span className="truncate">{text}</span>
          </span>
        ))}
        {items.length === 0 && (
          <span className="font-figtree text-[12px] text-[#9F9FA9]">Page link only</span>
        )}
      </div>
    </div>
  );
}

/** The pin strip at the top of booking-scoped screens: "BK-12347890 · Birthday Celebration · 12 Mar". */
export function BookingStrip({ context }: { context: SupportContext }) {
  if (!context.bookingId) return null;
  const parts = [
    context.bookingId,
    context.eventTitle,
    context.eventDate ? formatContextDate(context.eventDate).replace(/ \d{4}$/, "") : undefined,
  ].filter(Boolean);
  return (
    <div className="flex items-center gap-2 rounded-full border border-[#E4E4E7] bg-[#FAFAFA] px-3 py-1.5 font-figtree text-[12.5px] text-[#3F3F47]">
      <MapPin className="h-3.5 w-3.5 shrink-0 text-[#71717B]" />
      <span className="truncate">{parts.join(" · ")}</span>
    </div>
  );
}
