"use client";

import { CheckCircle2, CircleDot, Inbox, Info, MessageCircle, Zap } from "lucide-react";
import { TICKET_TYPES } from "../data/ticketTypes";
import { navigateSupport } from "../store";
import type { SupportContext, SupportPhase, Ticket, TicketType } from "../types";
import { whatsappLinkForContext } from "../utils/whatsapp";
import { formatRelative } from "../utils/format";
import { BookingStrip } from "./ContextChips";
import { TYPE_ICON, categoryIcon } from "./icons";
import { DoorButton, SectionLabel, StatusPill, WhatsAppIcon } from "./ui";

const PRE_BOOKING_TYPES: TicketType[] = ["event", "package", "booking"];

function openType(type: TicketType, category?: string) {
  const def = TICKET_TYPES[type];
  if (category || def.categories.length === 1) {
    navigateSupport({ screen: "compose", type, category: category ?? def.categories[0].id });
  } else {
    navigateSupport({ screen: "categories", type });
  }
}

function TicketRows({ tickets }: { tickets: Ticket[] }) {
  if (tickets.length === 0) {
    return (
      <div className="flex flex-col items-center gap-1 rounded-2xl border border-[#E4E4E7] bg-white px-4 py-6 text-center">
        <Inbox className="h-6 w-6 text-[#9F9FA9]" />
        <p className="font-figtree text-[14px] font-semibold text-[#09090B]">No tickets yet</p>
        <p className="font-figtree text-[12.5px] text-[#71717B]">
          When you raise something with us, it&apos;ll live here so you can follow along.
        </p>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-2">
      {tickets.slice(0, 4).map((ticket) => (
        <button
          key={ticket.id}
          type="button"
          onClick={() => navigateSupport({ screen: "ticket", ticketId: ticket.id })}
          className="flex w-full items-center gap-3 rounded-2xl border border-[#E4E4E7] bg-white px-3.5 py-3 text-left transition-colors hover:border-[#D4D4D8]"
        >
          <span
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
              ticket.status === "resolved" ? "bg-[#F0FDF4] text-[#00A63E]" : "bg-[#FFFBEB] text-[#E17100]"
            }`}
          >
            {ticket.status === "resolved" ? <CheckCircle2 className="h-4 w-4" /> : <CircleDot className="h-4 w-4" />}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate font-figtree text-[14px] font-bold text-[#09090B]">{ticket.subject}</span>
            <span className="block font-figtree text-[12px] text-[#71717B]">
              {ticket.id} · updated {formatRelative(ticket.updatedAt)}
            </span>
          </span>
          <StatusPill status={ticket.status} />
        </button>
      ))}
      {tickets.length > 4 && (
        <button
          type="button"
          onClick={() => navigateSupport({ screen: "tickets" })}
          className="py-1 font-figtree text-[13px] font-semibold text-[#F0596F]"
        >
          See all {tickets.length} tickets
        </button>
      )}
    </div>
  );
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-2.5 rounded-2xl bg-[#F4F4F5] p-3.5">
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#71717B]" />
      <p className="font-figtree text-[12.5px] leading-[18px] text-[#3F3F47]">{children}</p>
    </div>
  );
}

function CancelLink() {
  return (
    <button
      type="button"
      onClick={() => navigateSupport({ screen: "compose", type: "order", category: "cancel" })}
      className="self-center py-1 font-figtree text-[13px] text-[#71717B] underline-offset-2 hover:underline"
    >
      Want to cancel your booking?
    </button>
  );
}

function WhatsAppDoor({ context }: { context: SupportContext }) {
  const href = whatsappLinkForContext(
    context,
    context.packageName ? `Hi Eventory, I have a question about this package.` : `Hi Eventory, I need some help.`
  );
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      data-testid="support-home-whatsapp"
      className="flex w-full items-center gap-3.5 rounded-2xl border border-[#BFE9DD] bg-[#F2FBF8] p-4 text-left transition-colors hover:border-[#00AB82]"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#00AB82] text-white">
        <WhatsAppIcon />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-figtree text-[15.5px] font-bold text-[#09090B]">Chat on WhatsApp</span>
        <span className="block font-figtree text-[13px] text-[#71717B]">
          Fastest for quick questions · we&apos;ll see this page&apos;s details
        </span>
      </span>
    </a>
  );
}

export default function SupportHome({
  phase,
  context,
  tickets,
}: {
  phase: SupportPhase;
  context: SupportContext;
  tickets: Ticket[];
}) {
  const ticketsBlock = (
    <div>
      <SectionLabel>My support tickets</SectionLabel>
      <TicketRows tickets={tickets} />
    </div>
  );

  if (phase === "event_day") {
    return (
      <div className="flex flex-col gap-3.5">
        <BookingStrip context={context} />
        <DoorButton
          icon={Zap}
          tone="urgent"
          title="Something's wrong right now"
          subtitle="Live issue at your event — get help fast"
          onClick={() => openType("event_day_issue")}
          testId="door-urgent"
        />
        <DoorButton
          icon={MessageCircle}
          title="Chat with your Event Manager"
          subtitle="Last-minute changes or anything non-urgent"
          onClick={() => openType("order")}
        />
        {ticketsBlock}
        <CancelLink />
      </div>
    );
  }

  if (phase === "post_event") {
    const feedback = TICKET_TYPES.feedback;
    return (
      <div className="flex flex-col gap-3.5">
        <BookingStrip context={context} />
        <p className="font-figtree text-[14px] leading-5 text-[#3F3F47]">
          Hope it went well! Here&apos;s where to flag anything from your event, or share how it went.
        </p>
        {feedback.categories.map((category) => (
          <DoorButton
            key={category.id}
            icon={categoryIcon("feedback", category.id)}
            title={category.label}
            subtitle={category.description}
            tone={context.suggestedType === "feedback" && category.id === "rate" ? "suggested" : "neutral"}
            badge={context.suggestedType === "feedback" && category.id === "rate" ? "Suggested" : undefined}
            onClick={() => openType("feedback", category.id)}
            testId={`door-feedback-${category.id}`}
          />
        ))}
        <button
          type="button"
          onClick={() => openType("order", "billing")}
          className="self-start font-figtree text-[13.5px] font-semibold text-[#F0596F]"
        >
          Need help with billing or payments? →
        </button>
        {ticketsBlock}
        <Note>Booking changes were for before your event — they&apos;re closed now that it&apos;s complete.</Note>
      </div>
    );
  }

  if (phase === "booked") {
    return (
      <div className="flex flex-col gap-3.5">
        <BookingStrip context={context} />
        {ticketsBlock}
        <DoorButton
          icon={MessageCircle}
          title="Chat with your Event Manager"
          subtitle="Order status, payments, changes or anything non-urgent"
          tone={context.suggestedType === "order" ? "suggested" : "neutral"}
          onClick={() => openType("order")}
          testId="door-order"
        />
        <CancelLink />
        <Note>
          On-event help (vendor delays, setup issues) unlocks automatically on the day of your event. After-event support
          (ratings, delivery issues) opens once it&apos;s complete.
        </Note>
      </div>
    );
  }

  // Browsing and checkout: pre-booking help, with the page's suggestion first.
  const suggested = context.suggestedType && PRE_BOOKING_TYPES.includes(context.suggestedType) ? context.suggestedType : undefined;
  const others = PRE_BOOKING_TYPES.filter((type) => type !== suggested && (type !== "package" || context.packageName));

  return (
    <div className="flex flex-col gap-3.5">
      {suggested && (
        <div>
          <SectionLabel>Suggested for this page</SectionLabel>
          <DoorButton
            icon={TYPE_ICON[suggested]}
            tone="suggested"
            title={TICKET_TYPES[suggested].label}
            subtitle={TICKET_TYPES[suggested].description}
            onClick={() => openType(suggested)}
            testId={`door-${suggested}`}
          />
        </div>
      )}
      <WhatsAppDoor context={context} />
      <div className="flex flex-col gap-2.5">
        <SectionLabel>{suggested ? "Other help" : "How can we help?"}</SectionLabel>
        {others.map((type) => (
          <DoorButton
            key={type}
            icon={TYPE_ICON[type]}
            title={TICKET_TYPES[type].label}
            subtitle={TICKET_TYPES[type].description}
            onClick={() => openType(type)}
            testId={`door-${type}`}
          />
        ))}
      </div>
      {tickets.length > 0 && ticketsBlock}
    </div>
  );
}

export { openType };
