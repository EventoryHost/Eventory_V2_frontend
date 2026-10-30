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

export function buildSlackPayload(t: HelpTicketSlackInput) {
  const issue = clean(t.issue);
  const name = clean(t.customerName);
  const pkg = clean(t.packageName);
  const pkgId = clean(t.packageId);
  const booking = clean(t.bookingId);
  const note = clean(t.note);
  const link = buildCustomerWhatsAppLink(t);
  // Header blocks cap plain text at 150 chars.
  const title = `🆘 New help ticket${issue ? ` — ${issue}` : ""}${clean(t.ticket) ? ` · ${clean(t.ticket)}` : ""}`.slice(0, 150);
  const lines = [
    `*Customer:* ${name ? esc(name) : "—"}`,
    `*Mobile:* ${clean(t.customerPhone) ? esc(t.customerPhone!.trim()) : "Not on file"}`,
    `*Package:* ${pkg ? esc(pkg) : "Not sure / the venue"}${pkgId ? `  (ID: \`${esc(pkgId)}\`)` : ""}`,
    ...(booking ? [`*Booking:* \`${esc(booking)}\``] : []),
    ...(clean(t.emName) ? [`*Event Manager:* ${esc(t.emName!.trim())}`] : []),
    ...(note && note !== issue ? [`*Note:* ${esc(note)}`] : []),
  ];
  const firstName = name?.split(/\s+/)[0] ?? "the customer";
  return {
    text: title,
    blocks: [
      { type: "header", text: { type: "plain_text", text: title, emoji: true } },
      { type: "section", text: { type: "mrkdwn", text: lines.join("\n") } },
      link
        ? {
            type: "actions",
            elements: [
              { type: "button", style: "primary", text: { type: "plain_text", text: `💬 Message ${firstName} on WhatsApp`, emoji: true }, url: link },
            ],
          }
        : { type: "context", elements: [{ type: "mrkdwn", text: "No mobile number on file, so there's no WhatsApp link." }] },
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
