import type { SupportContext, SupportPhase, TicketPriority, TicketType } from "../types";

/**
 * Ticket catalogue. Categories and sub-topic chips follow Amit's Help &
 * Support ideation files (Billings & payments / My bookings before the
 * event, "Issue with vendor" / "Issue with the booking" on the day,
 * rate / delivery issue / report after), mapped onto the six ticket types
 * from the support brief.
 */

export interface TicketFieldDef {
  id: string;
  label: string;
  kind: "text" | "select" | "date";
  options?: string[];
  placeholder?: string;
  /** Prefill from the page context when the page knows it. */
  contextKey?: keyof Pick<SupportContext, "eventType" | "eventDate" | "location" | "guests">;
  optional?: boolean;
}

export interface TicketCategory {
  id: string;
  label: string;
  description: string;
  subtopics: string[];
  placeholder: string;
  /** Shown above the form, e.g. a policy reminder. */
  notice?: string;
  priority?: TicketPriority;
  /** Star rating instead of sub-topic chips. */
  rating?: boolean;
  evidence?: boolean;
  /** Only listed in these phases (all when omitted). */
  phases?: SupportPhase[];
  /** Reached from a dedicated link rather than the category list. */
  hidden?: boolean;
}

export interface TicketTypeDef {
  type: TicketType;
  label: string;
  /** One-liner on the door/card. */
  description: string;
  group: "pre_booking" | "post_booking" | "grievance";
  priority: TicketPriority;
  idPrefix: string;
  routedTo: string;
  sla: string;
  submitLabel: string;
  categories: TicketCategory[];
  fields?: TicketFieldDef[];
  /** "Which package is this about?" picker, from the booking's packages. */
  packagePicker?: "required" | "optional";
  evidence?: boolean;
}

const EVENT_TYPES = ["Birthday", "Wedding", "Corporate", "Anniversary", "Baby shower", "House party", "Other"];

export const TICKET_TYPES: Record<TicketType, TicketTypeDef> = {
  event: {
    type: "event",
    label: "Event support",
    description: "Tell us about your event and we'll point you to the right packages",
    group: "pre_booking",
    priority: "normal",
    idPrefix: "TKT",
    routedTo: "Eventory sales team",
    sla: "Usually within 30 min",
    submitLabel: "Get package suggestions",
    categories: [
      {
        id: "plan-event",
        label: "Plan my event",
        description: "Share the basics and we'll suggest packages",
        subtopics: ["Which package fits my event", "Budget planning", "Multiple vendors, one event", "Others"],
        placeholder: "Theme, must-haves, anything we should know…",
      },
    ],
    fields: [
      { id: "eventType", label: "Event type", kind: "select", options: EVENT_TYPES, contextKey: "eventType" },
      { id: "eventDate", label: "Event date", kind: "date", contextKey: "eventDate" },
      { id: "location", label: "City / venue", kind: "text", placeholder: "e.g. Indiranagar, Bangalore", contextKey: "location" },
      { id: "guests", label: "Guests", kind: "text", placeholder: "e.g. 80", contextKey: "guests", optional: true },
      {
        id: "budget",
        label: "Budget",
        kind: "select",
        options: ["Under ₹25k", "₹25k – ₹75k", "₹75k – ₹2L", "Above ₹2L", "Not sure yet"],
        optional: true,
      },
    ],
  },
  package: {
    type: "package",
    label: "Package support",
    description: "What's included, how to customise it, and how to book",
    group: "pre_booking",
    priority: "normal",
    idPrefix: "TKT",
    routedTo: "Eventory sales team",
    sla: "Usually within 30 min",
    submitLabel: "Ask about this package",
    categories: [
      {
        id: "package-question",
        label: "About this package",
        description: "Inclusions, customisation, pricing",
        subtopics: ["What's included", "Customise this package", "Pricing & add-ons", "How to book", "Others"],
        placeholder: "Ask anything about this package…",
      },
    ],
  },
  booking: {
    type: "booking",
    label: "Booking support",
    description: "Checkout, payments and how your booking is handled",
    group: "pre_booking",
    priority: "high",
    idPrefix: "TKT",
    routedTo: "Eventory sales team",
    sla: "Same business hour",
    submitLabel: "Get booking help",
    categories: [
      {
        id: "checkout",
        label: "Help with my booking",
        description: "Checkout, token payment, what happens next",
        subtopics: [
          "Issue in making payment",
          "Payment modes",
          "Token & payment schedule",
          "Cancellation policy",
          "How my booking is executed",
          "Others",
        ],
        placeholder: "Tell us where you're stuck…",
        evidence: true,
      },
    ],
  },
  order: {
    type: "order",
    label: "Chat with your Event Manager",
    description: "Questions, changes or anything non-urgent",
    group: "post_booking",
    priority: "normal",
    idPrefix: "TKT",
    routedTo: "your Event Manager",
    sla: "Usually within 30 min",
    submitLabel: "Send to my Event Manager",
    packagePicker: "optional",
    categories: [
      {
        id: "order-status",
        label: "Order status",
        description: "Review process, response time, confirmation",
        subtopics: ["Vendor review process", "When will I hear back?", "Confirmation status", "How event day is handled", "Others"],
        placeholder: "What would you like to know about your order?",
        phases: ["booked"],
      },
      {
        id: "billing",
        label: "Billings & payments",
        description: "Dues, payment modes, invoices & refunds",
        subtopics: ["My dues", "Payment modes", "Invoices", "Refunds", "Issue in making payment", "Others"],
        placeholder: "Tell us about the payment or billing question…",
      },
      {
        id: "my-bookings",
        label: "My bookings",
        description: "Add-ons, guest count, items & location",
        subtopics: [
          "Change in add-ons",
          "Change in guest count",
          "Removal of an item",
          "Change in location",
          "Reschedule event date",
          "Others",
        ],
        placeholder: "Tell us what you'd like to change…",
        notice: "Changes may affect your package price. We'll confirm any difference before anything is charged.",
        phases: ["booked"],
      },
      {
        id: "last-minute",
        label: "Last minute changes",
        description: "Add-ons or an extra area, today",
        subtopics: ["Add-ons", "Addition of an area", "Others"],
        placeholder: "Tell us what you need added or changed…",
        notice: "Your event is today, so this goes straight to your Event Manager as priority.",
        priority: "high",
        phases: ["event_day"],
      },
      {
        id: "cancel",
        label: "Cancel booking",
        description: "Request a cancellation",
        subtopics: ["Change of plans", "Event postponed", "Found another vendor", "Budget constraints", "Something else"],
        placeholder: "Anything we should know?",
        notice:
          "Cancellation refunds follow each package's policy (shown on your booking). Nothing is charged or released until your Event Manager confirms the exact refund.",
        hidden: true,
      },
    ],
  },
  event_day_issue: {
    type: "event_day_issue",
    label: "Something's wrong right now",
    description: "Live issue at your event — get help fast",
    group: "grievance",
    priority: "urgent",
    idPrefix: "GRV",
    routedTo: "your Event Manager (priority line)",
    sla: "Immediate",
    submitLabel: "Submit report",
    packagePicker: "required",
    evidence: true,
    categories: [
      {
        id: "vendor",
        label: "Issue with vendor",
        description: "Missing, delayed, misconduct or extra charges",
        subtopics: ["Where is my vendor", "Vendor delayed arrival", "Vendor misconduct", "Vendor charging extra", "Others"],
        placeholder: "Tell us what's happening with the vendor…",
        evidence: true,
      },
      {
        id: "booking",
        label: "Issue with the booking",
        description: "Quality mismatch or missing items",
        subtopics: ["Quality mismatch", "Items missing", "Setup incomplete", "Others"],
        placeholder: "Tell us what's wrong with what was delivered…",
        evidence: true,
      },
    ],
    fields: [
      {
        id: "severity",
        label: "How bad is it?",
        kind: "select",
        options: ["Blocking the event", "Needs fixing soon", "Minor, but flagging it"],
      },
    ],
  },
  feedback: {
    type: "feedback",
    label: "After your event",
    description: "Rate your experience or flag something from the event",
    group: "grievance",
    priority: "normal",
    idPrefix: "FBK",
    routedTo: "Eventory quality team",
    sla: "24–48h",
    submitLabel: "Submit",
    packagePicker: "optional",
    categories: [
      {
        id: "rate",
        label: "Rate vendor / experience",
        description: "How was it?",
        subtopics: [],
        placeholder: "What went well, what could be better?",
        rating: true,
        evidence: true,
      },
      {
        id: "delivery",
        label: "Delivery issue",
        description: "Setup or execution didn't match what was booked",
        subtopics: ["Quality mismatch", "Missing item", "Setup incomplete", "Others"],
        placeholder: "Describe what went wrong…",
        evidence: true,
        priority: "high",
      },
      {
        id: "report",
        label: "Report an issue",
        description: "Billing, general feedback, other",
        subtopics: ["Billing / refund", "General feedback", "Other"],
        placeholder: "Tell us more…",
      },
    ],
  },
};

export function categoryOf(type: TicketType, categoryId?: string): TicketCategory {
  const def = TICKET_TYPES[type];
  return def.categories.find((c) => c.id === categoryId) ?? def.categories[0];
}

export function visibleCategories(type: TicketType, phase: SupportPhase): TicketCategory[] {
  return TICKET_TYPES[type].categories.filter((c) => !c.hidden && (!c.phases || c.phases.includes(phase)));
}
