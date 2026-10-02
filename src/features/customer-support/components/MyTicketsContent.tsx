"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Headphones, Inbox } from "lucide-react";
import { TICKET_TYPES, categoryOf } from "../data/ticketTypes";
import { useMyTickets, useRegisterSupportContext, useSupport } from "../hooks/useSupport";
import { formatRelative } from "../utils/format";
import { TYPE_ICON } from "./icons";
import { StatusPill } from "./ui";

/** Account → Help Center: every ticket the customer has raised, from any page. */
export default function MyTicketsContent() {
  useRegisterSupportContext({ pageName: "Help Center" });
  const tickets = useMyTickets();
  const { openSupport } = useSupport();
  const searchParams = useSearchParams();
  const deepLink = searchParams.get("ticket");

  // Links from WhatsApp land here with ?ticket=ID.
  useEffect(() => {
    if (deepLink) openSupport({ ticketId: deepLink });
  }, [deepLink, openSupport]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[24px] font-semibold leading-8 text-[#030303]">Help Center</h1>
          <p className="text-[14px] text-[#71717B]">Your support tickets, live. Replies from your Event Manager show up here.</p>
        </div>
        <button
          type="button"
          onClick={() => openSupport()}
          className="flex items-center gap-2 rounded-full bg-brand-primary px-4 py-2 text-[14px] font-semibold text-white"
        >
          <Headphones className="h-4 w-4" /> Get help
        </button>
      </div>

      {tickets === null ? (
        <p className="text-[14px] text-[#71717B]">Loading your tickets…</p>
      ) : tickets.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-[20px] border border-[#E4E4E7] bg-white px-6 py-12 text-center">
          <Inbox className="h-8 w-8 text-[#9F9FA9]" />
          <p className="text-[16px] font-semibold text-[#09090B]">No tickets yet</p>
          <p className="max-w-[360px] text-[14px] text-[#71717B]">
            When you raise something with us from any page, it&apos;ll live here so you can follow along.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-[20px] border border-[#E4E4E7] bg-white">
          {tickets.map((ticket, index) => {
            const Icon = TYPE_ICON[ticket.type];
            const def = TICKET_TYPES[ticket.type];
            return (
              <button
                key={ticket.id}
                type="button"
                onClick={() => openSupport({ ticketId: ticket.id })}
                className={`flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-[#FAFAFA] ${
                  index > 0 ? "border-t border-[#E4E4E7]" : ""
                }`}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FDEEF0] text-[#F0596F]">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[15px] font-semibold text-[#09090B]">{ticket.subject}</span>
                  <span className="block truncate text-[13px] text-[#71717B]">
                    {ticket.id} · {def.label}
                    {def.categories.length > 1 ? ` › ${categoryOf(ticket.type, ticket.category).label}` : ""}
                    {ticket.context.bookingId ? ` · ${ticket.context.bookingId}` : ""} · updated {formatRelative(ticket.updatedAt)}
                  </span>
                </span>
                <StatusPill status={ticket.status} />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
