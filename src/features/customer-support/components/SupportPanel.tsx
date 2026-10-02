"use client";

import { useEffect } from "react";
import { ChevronLeft, X } from "lucide-react";
import { TICKET_TYPES, categoryOf } from "../data/ticketTypes";
import { useMyTickets, useSupport } from "../hooks/useSupport";
import type { SupportPhase } from "../types";
import SupportCategories from "./SupportCategories";
import SupportCompose from "./SupportCompose";
import SupportHome from "./SupportHome";
import SupportTicketView from "./SupportTicketView";
import { navigateSupport } from "../store";
import { TYPE_ICON } from "./icons";
import { DoorButton } from "./ui";

/**
 * The Help & Support surface: a right-hand drawer on desktop (the
 * "Right sidebar" option in the ideation flow) and a bottom sheet on mobile.
 */
export default function SupportPanel() {
  const { panel, context, closeSupport, backSupport } = useSupport();
  const tickets = useMyTickets() ?? [];
  const phase: SupportPhase = context.phase ?? "browsing";

  useEffect(() => {
    if (!panel.open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeSupport();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [panel.open, closeSupport]);

  if (!panel.open) return null;

  let title = "Help & Support";
  if (panel.screen === "categories" && panel.type) {
    title = panel.type === "event_day_issue" || phase === "event_day" ? "Event day help" : TICKET_TYPES[panel.type].label;
  } else if (panel.screen === "compose" && panel.type) {
    const def = TICKET_TYPES[panel.type];
    title =
      def.group === "grievance"
        ? panel.type === "feedback"
          ? categoryOf(panel.type, panel.category).label
          : "Report an issue"
        : def.group === "post_booking"
          ? panel.category === "cancel"
            ? "Cancel booking"
            : "Booking support"
          : def.label;
  } else if (panel.screen === "ticket") {
    const ticket = tickets.find((t) => t.id === panel.ticketId);
    title = ticket?.assignee ? `${ticket.assignee.name.split(" ")[0]} · ${ticket.assignee.role}` : "Your ticket";
  } else if (panel.screen === "tickets") {
    title = "My support tickets";
  }

  const isUrgentHeader =
    (panel.screen === "categories" && panel.type === "event_day_issue") ||
    (panel.screen === "compose" && panel.type === "event_day_issue");

  return (
    <div className="fixed inset-0 z-[70]" role="dialog" aria-modal="true" aria-label="Help and Support">
      <button
        type="button"
        aria-label="Close help"
        onClick={closeSupport}
        className="absolute inset-0 h-full w-full cursor-default bg-[#04222D]/40 backdrop-blur-[1px]"
      />
      <div
        data-testid="support-panel"
        className="absolute inset-x-0 bottom-0 flex max-h-[92dvh] min-h-[60dvh] flex-col overflow-hidden rounded-t-[28px] bg-white shadow-2xl md:inset-y-0 md:right-0 md:left-auto md:max-h-none md:w-[460px] md:rounded-none md:rounded-l-[24px]"
      >
        <span aria-hidden className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-[#D4D4D8] md:hidden" />
        <div
          className={`flex shrink-0 items-center gap-2.5 border-b px-5 py-3.5 md:px-6 md:py-5 ${
            isUrgentHeader ? "border-[#FFCAC5] bg-[#FFF2F1]" : "border-[#E4E4E7]"
          }`}
        >
          {panel.history.length > 0 && (
            <button
              type="button"
              aria-label="Back"
              onClick={backSupport}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F4F4F5] text-[#3F3F47]"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
          <h2
            className={`min-w-0 flex-1 truncate font-figtree text-[18px] font-bold ${isUrgentHeader ? "text-[#C81E0D]" : "text-[#09090B]"}`}
          >
            {title}
          </h2>
          <button
            type="button"
            aria-label="Close"
            onClick={closeSupport}
            className="flex h-8 w-8 items-center justify-center rounded-full text-[#71717B] hover:bg-[#F4F4F5]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain px-5 pt-5 pb-6 md:px-6" key={`${panel.screen}-${panel.type}-${panel.category}-${panel.ticketId}`}>
          {panel.screen === "home" && <SupportHome phase={phase} context={context} tickets={tickets} />}
          {panel.screen === "categories" && panel.type && (
            <SupportCategories type={panel.type} phase={phase} context={context} />
          )}
          {panel.screen === "compose" && panel.type && (
            <SupportCompose type={panel.type} categoryId={panel.category} initialTopic={panel.topic} context={context} />
          )}
          {panel.screen === "ticket" && panel.ticketId && <SupportTicketView ticketId={panel.ticketId} />}
          {panel.screen === "tickets" && (
            <div className="flex flex-col gap-2">
              {tickets.map((ticket) => (
                <DoorButton
                  key={ticket.id}
                  icon={TYPE_ICON[ticket.type]}
                  title={ticket.subject}
                  subtitle={`${ticket.id} · ${TICKET_TYPES[ticket.type].label}`}
                  onClick={() => navigateSupport({ screen: "ticket", ticketId: ticket.id })}
                />
              ))}
              {tickets.length === 0 && <p className="font-figtree text-[14px] text-[#71717B]">No tickets yet.</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

