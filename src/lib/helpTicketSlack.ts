import { apiFetch } from "./apiClient";

// A help ticket, posted to the Event Managers' Slack channel by the backend
// (POST /customer/chat/slack/ticket). The backend builds the post — with a
// WhatsApp link to the customer and a "Mark resolved" button — and holds the
// webhook and signing secret, which its deploy writes from GitHub Secrets.
// Nothing Slack-related needs to be set on the frontend's host.

export interface HelpTicketSlackInput {
  /** e.g. "TKT-1042". */
  ticket?: string | null;
  /** The problem they picked ("Running late") or the request topic. */
  issue?: string | null;
  /** Their own words, when they added any. */
  note?: string | null;
  customerName?: string | null;
  customerPhone?: string | null;
  packageName?: string | null;
  packageId?: string | null;
  /** Only when the ticket is about a booking. */
  bookingId?: string | null;
  emName?: string | null;
  /** No-show / safety report: the duty manager is flagged in the post. */
  urgent?: boolean;
  /** Structured lines, newline-separated ("New guest count: 60", "Missing: …", "Photo: …"). */
  details?: string | null;
}

/** Fire-and-forget: Slack being down must never fail the ticket itself. */
export function notifyHelpTicketSlack(input: HelpTicketSlackInput) {
  apiFetch("/customer/chat/slack/ticket", { method: "POST", body: input }).catch((error: unknown) => {
    // Shows in the browser console when the backend can't post (e.g. webhook not set).
    console.warn("[help] Slack post failed:", error instanceof Error ? error.message : error);
  });
}
