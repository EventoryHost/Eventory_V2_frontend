import { SUPPORT_WHATSAPP_NUMBER } from "../config";
import { TICKET_TYPES, categoryOf } from "../data/ticketTypes";
import type { SupportContext, Ticket } from "../types";
import { formatContextDate } from "./format";

function waLink(text: string) {
  return `https://wa.me/${SUPPORT_WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

function contextLines(ctx: SupportContext): string[] {
  const lines: string[] = [];
  if (ctx.packageName) lines.push(`Package: ${ctx.packageName}${ctx.vendorName ? ` (${ctx.vendorName})` : ""}`);
  if (ctx.bookingId) lines.push(`Booking ID: ${ctx.bookingId}${ctx.eventTitle ? ` · ${ctx.eventTitle}` : ""}`);
  if (ctx.eventType) lines.push(`Event type: ${ctx.eventType}`);
  if (ctx.eventDate) lines.push(`Date: ${formatContextDate(ctx.eventDate)}`);
  if (ctx.location) lines.push(`Location: ${ctx.location}`);
  if (ctx.guests) lines.push(`Guests: ${ctx.guests}`);
  return lines;
}

/** Link back to the ticket on the customer site, for the support agent on WhatsApp. */
export function ticketUrl(ticketId: string) {
  const origin = typeof window !== "undefined" ? window.location.origin : "https://eventory.in";
  return `${origin}/account/support?ticket=${encodeURIComponent(ticketId)}`;
}

/** Prefilled wa.me link carrying everything the ticket knows. */
export function whatsappLinkForTicket(ticket: Ticket): string {
  const def = TICKET_TYPES[ticket.type];
  const category = categoryOf(ticket.type, ticket.category);
  const ctx: SupportContext = {
    ...ticket.context,
    eventType: ticket.fields.eventType || ticket.context.eventType,
    eventDate: ticket.fields.eventDate || ticket.context.eventDate,
    location: ticket.fields.location || ticket.context.location,
    guests: ticket.fields.guests || ticket.context.guests,
  };
  const pkg = ticket.fields.package ? `About package: ${ticket.fields.package}` : null;
  const extra = Object.entries(ticket.fields)
    .filter(([key]) => ["severity", "budget"].includes(key))
    .map(([key, value]) => `${key === "severity" ? "Severity" : "Budget"}: ${value}`);

  const lines = [
    `Hi Eventory, following up on my support ticket.`,
    ``,
    `Ticket: ${ticket.id}`,
    `Type: ${def.label}${def.categories.length > 1 ? ` › ${category.label}` : ""}`,
    ticket.topic ? `Topic: ${ticket.topic}` : null,
    ...contextLines(ctx),
    pkg,
    ...extra,
    ticket.rating ? `Rating: ${ticket.rating}/5` : null,
    ticket.description ? `Summary: ${ticket.description}` : null,
    ticket.attachments.length ? `Attachments: ${ticket.attachments.length} (on the ticket)` : null,
    ``,
    `Ticket link: ${ticketUrl(ticket.id)}`,
  ].filter((line): line is string => line !== null);

  return waLink(lines.join("\n"));
}

/** For entry points that hand straight to WhatsApp without a ticket (PDP, empty listing). */
export function whatsappLinkForContext(ctx: SupportContext, opener: string): string {
  return waLink([opener, ...contextLines(ctx)].join("\n"));
}
