// A help ticket, posted to the Event Managers' Slack channel by
// /api/help-ticket/slack (the webhook stays server-side). The post carries
// a WhatsApp link to the customer's own number with a message pre-filled.

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

const clean = (s?: string | null) => s?.trim() || null;

/** "98180 30600" / "+91-9818030600" → "919818030600"; null if it can't be a number. */
export function toWhatsAppNumber(phone?: string | null) {
  let d = (phone ?? "").replace(/\D/g, "");
  if (d.length === 11 && d.startsWith("0")) d = d.slice(1);
  if (d.length === 10) d = `91${d}`;
  return d.length >= 11 && d.length <= 15 ? d : null;
}

/** What the Event Manager sends the customer. No issue → the fallback. */
export function buildCustomerMessage(t: HelpTicketSlackInput) {
  const name = clean(t.customerName)?.split(/\s+/)[0];
  const hi = name ? `Hi ${name},` : "Hi,";
  const em = clean(t.emName);
  const from = em ? `this is ${em.split(/\s+/)[0]} from Eventory` : "this is the Eventory team";
  const issue = clean(t.issue);
  if (!issue) {
    return `${hi} ${from}. We've received the help request you just raised and we're on it. Could you tell us a little more about what's going wrong so we can resolve it for you quickly?`;
  }
  const pkg = clean(t.packageName);
  const booking = clean(t.bookingId);
  return `${hi} ${from}. You raised a help request regarding "${issue}"${pkg ? ` for ${pkg}` : ""}${booking ? ` (Booking ${booking})` : ""}. We're on it — could you share a little more detail so we can resolve this for you quickly?`;
}

export function buildCustomerWhatsAppLink(t: HelpTicketSlackInput) {
  const number = toWhatsAppNumber(t.customerPhone);
  return number ? `https://wa.me/${number}?text=${encodeURIComponent(buildCustomerMessage(t))}` : null;
}

// Slack mrkdwn treats &, < and > as control characters.
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** The "Mark resolved" button's action; /api/slack/interactions handles it. */
export const RESOLVE_ACTION_ID = "help_ticket_resolve";

/** `resolvable`: show "Mark resolved" — only once Slack interactivity is set up, else the click errors. */
export function buildSlackPayload(t: HelpTicketSlackInput, { resolvable = false } = {}) {
  const issue = clean(t.issue);
  const name = clean(t.customerName);
  const pkg = clean(t.packageName);
  const pkgId = clean(t.packageId);
  const booking = clean(t.bookingId);
  const note = clean(t.note);
  const link = buildCustomerWhatsAppLink(t);
  // Header blocks cap plain text at 150 chars.
  const title = `${t.urgent ? "🚨 URGENT" : "🆘 New help ticket"}${issue ? ` — ${issue}` : ""}${clean(t.ticket) ? ` · ${clean(t.ticket)}` : ""}`.slice(0, 150);
  const details = (clean(t.details) ?? "").split("\n").map((d) => d.trim()).filter(Boolean);
  const lines = [
    `*Customer:* ${name ? esc(name) : "—"}`,
    `*Mobile:* ${clean(t.customerPhone) ? esc(t.customerPhone!.trim()) : "Not on file"}`,
    `*Package:* ${pkg ? esc(pkg) : "Not sure / the venue"}${pkgId ? `  (ID: \`${esc(pkgId)}\`)` : ""}`,
    ...(booking ? [`*Booking:* \`${esc(booking)}\``] : []),
    ...(clean(t.emName) ? [`*Event Manager:* ${esc(t.emName!.trim())}`] : []),
    ...(note && note !== issue ? [`*Note:* ${esc(note)}`] : []),
    ...details.map((d) => `• ${esc(d)}`),
  ];
  const firstName = name?.split(/\s+/)[0] ?? "the customer";
  const ticket = clean(t.ticket);
  const buttons = [
    ...(link
      ? [{ type: "button", style: "primary", text: { type: "plain_text", text: `💬 Message ${firstName} on WhatsApp`, emoji: true }, url: link }]
      : []),
    ...(resolvable && ticket
      ? [
          {
            type: "button",
            action_id: RESOLVE_ACTION_ID,
            value: ticket,
            text: { type: "plain_text", text: "✅ Mark resolved", emoji: true },
            confirm: {
              title: { type: "plain_text", text: "Resolve this ticket?" },
              text: { type: "mrkdwn", text: `${esc(ticket)} moves to Resolved in the customer's chats.` },
              confirm: { type: "plain_text", text: "Resolve" },
              deny: { type: "plain_text", text: "Cancel" },
            },
          },
        ]
      : []),
  ];
  return {
    text: title,
    blocks: [
      { type: "header", text: { type: "plain_text", text: title, emoji: true } },
      ...(t.urgent ? [{ type: "section", text: { type: "mrkdwn", text: "*Duty manager, please pick this up now.*" } }] : []),
      { type: "section", text: { type: "mrkdwn", text: lines.join("\n") } },
      ...(link ? [] : [{ type: "context", elements: [{ type: "mrkdwn", text: "No mobile number on file, so there's no WhatsApp link." }] }]),
      ...(buttons.length ? [{ type: "actions", elements: buttons }] : []),
    ],
  };
}

/** Fire-and-forget: Slack being down must never fail the ticket itself. */
export function notifyHelpTicketSlack(input: HelpTicketSlackInput) {
  fetch("/api/help-ticket/slack", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
    keepalive: true,
  }).catch(() => {});
}
