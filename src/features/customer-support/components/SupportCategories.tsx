"use client";

import { TICKET_TYPES, visibleCategories } from "../data/ticketTypes";
import { navigateSupport } from "../store";
import type { SupportContext, SupportPhase, TicketType } from "../types";
import { BookingStrip } from "./ContextChips";
import { categoryIcon } from "./icons";
import { DoorButton, SectionLabel } from "./ui";

/** "WHAT DO YOU NEED?" — the scoped category list behind a door. */
export default function SupportCategories({
  type,
  phase,
  context,
}: {
  type: TicketType;
  phase: SupportPhase;
  context: SupportContext;
}) {
  const row = (t: TicketType, id: string) => {
    const c = TICKET_TYPES[t].categories.find((cat) => cat.id === id)!;
    return { type: t, id: c.id, label: c.label, description: c.description };
  };

  let rows = visibleCategories(type, phase).map((c) => row(type, c.id));

  // On the event day both doors show the same mixed set (as in the ideation
  // flow): last-minute changes go to the EM chat, vendor/booking problems to
  // the grievance flow.
  if (phase === "event_day" && type === "event_day_issue") {
    rows = [row("event_day_issue", "vendor"), row("event_day_issue", "booking"), row("order", "last-minute")];
  } else if (phase === "event_day" && type === "order") {
    rows = [
      row("order", "last-minute"),
      row("event_day_issue", "vendor"),
      row("event_day_issue", "booking"),
      row("order", "billing"),
    ];
  }

  return (
    <div className="flex flex-col gap-3">
      <BookingStrip context={context} />
      <SectionLabel>What do you need?</SectionLabel>
      {rows.map((row) => (
        <DoorButton
          key={`${row.type}-${row.id}`}
          icon={categoryIcon(row.type, row.id)}
          tone={row.type === "event_day_issue" ? "urgent" : "neutral"}
          title={row.label}
          subtitle={row.description}
          onClick={() => navigateSupport({ screen: "compose", type: row.type, category: row.id })}
          testId={`category-${row.id}`}
        />
      ))}
    </div>
  );
}
