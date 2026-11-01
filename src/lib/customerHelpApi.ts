import { apiFetch } from "./apiClient";

// POST /api/customer/chat/help-request — the help panel's "Send to an Event
// Manager" brief. Stored as a ChatEnquiry lead (source "help_panel") and
// posted to the team's Slack channel; see Eventory_V2_backend
// src/controllers/customerChatController.js createHelpRequest.

const ANON_KEY = "eventory_help_anon_id";

export interface HelpRequestPayload {
  occasion: string;
  guests: string;
  budget: string;
  /** Optional: left out means "Not sure yet". */
  vendorType?: string;
  area?: string;
  date?: string;
  replyMode: "reply-here" | "call-me";
  /** A reference photo is in the brief. Not uploaded (yet) — the team asks for it. */
  hasPhoto?: boolean;
  callTime?: string;
  phone?: string;
  pageUrl?: string;
  transcript?: string[];
  /** The chat it's raised in: the ticket stays in it, one per chat. */
  conversationId?: string;
}

/** The help thread after the brief: GET /customer/chat/help-request/:id. */
export interface HelpRequestState {
  enquiryId: string;
  /** Short ref shown in the thread, e.g. "TKT-1042". */
  ticket: string;
  createdAt: string;
  replyMode: "reply-here" | "call-me";
  /** Sent outside 9 AM–9 PM IST. */
  offHours: boolean;
  /** 30 min with no reply; the team lead has been flagged. */
  late: boolean;
  /** An Event Manager has replied at least once. */
  replied: boolean;
  /** Resolved — by the team, or by the customer themselves. */
  resolved: boolean;
  /** Who resolved it; null while open. */
  resolvedBy?: "team" | "customer" | null;
  /** When the customer moved it to WhatsApp (the team was told). */
  whatsappAt: string | null;
  /** "report" = an event-day problem report (GRV ref). */
  kind?: "request" | "report";
  report?: HelpReport | null;
  /** The customer said it's sorted; the team closes it after checking. */
  customerSortedAt?: string | null;
  /** `window` is the chosen call time; null means as soon as possible. */
  callBack: {
    requestId: string;
    ticket: string;
    window: string | null;
    note: string | null;
    callBy: string;
  } | null;
  messages: HelpThreadMessage[];
}

export interface HelpThreadMessage {
  messageId: string;
  from: "customer" | "event_manager";
  senderName: string | null;
  text: string;
  sentAt: string;
}

interface HelpRequestResponse {
  success: true;
  enquiryId: string;
  anonId: string | null;
  request: HelpRequestState;
}

function readAnonId() {
  try {
    return localStorage.getItem(ANON_KEY) ?? undefined;
  } catch {
    return undefined;
  }
}

function rememberAnonId(anonId: string | null) {
  if (!anonId) return;
  try {
    localStorage.setItem(ANON_KEY, anonId);
  } catch {
    // Storage blocked — the next request just gets a fresh anon id.
  }
}

export async function createHelpRequest(payload: HelpRequestPayload) {
  const res = await apiFetch<HelpRequestResponse>("/customer/chat/help-request", {
    method: "POST",
    body: { ...payload, anon_id: readAnonId() },
  });
  rememberAnonId(res.anonId);
  return res;
}

const anonQuery = () => {
  const id = readAnonId();
  return id ? `?anon_id=${encodeURIComponent(id)}` : "";
};

/** `seen`: the chat is open in front of them, so its replies count as read. */
export async function getHelpRequest(enquiryId: string, { seen = false } = {}) {
  const q = anonQuery();
  const res = await apiFetch<{ success: true; request: HelpRequestState }>(
    `/customer/chat/help-request/${encodeURIComponent(enquiryId)}${q}${seen ? `${q ? "&" : "?"}seen=1` : ""}`,
  );
  return res.request;
}

/** `clientId` is the thread item's id, so the message is stored once. */
export async function sendHelpMessage(enquiryId: string, text: string, clientId?: string) {
  const res = await apiFetch<{ success: true; message: HelpThreadMessage }>(
    `/customer/chat/help-request/${encodeURIComponent(enquiryId)}/messages`,
    { method: "POST", body: { text, clientId, anon_id: readAnonId() } },
  );
  return res.message;
}

/** `window` is a call-time option label; left out = as soon as possible. */
export async function requestHelpCallBack(
  enquiryId: string,
  { phone, window, note }: { phone: string; window?: string; note?: string },
) {
  const res = await apiFetch<{ success: true; request: HelpRequestState }>(
    `/customer/chat/help-request/${encodeURIComponent(enquiryId)}/call-back`,
    { method: "POST", body: { phone, window, note: note || undefined, anon_id: readAnonId() } },
  );
  return res.request;
}

/** The customer opened WhatsApp from this ticket: noted once, team told on Slack. */
export async function continueHelpOnWhatsApp(enquiryId: string) {
  const res = await apiFetch<{ success: true; request: HelpRequestState }>(
    `/customer/chat/help-request/${encodeURIComponent(enquiryId)}/whatsapp`,
    { method: "POST", body: { anon_id: readAnonId() } },
  );
  return res.request;
}

/** POST /customer/chat/booking-help — a signed-in customer's request about their bookings. */
export interface BookingHelpPayload {
  bookingRefs: string[];
  /** What it's about, e.g. "Change guest count". */
  topic: string;
  /** Their own words. */
  text: string;
  /** Structured details, one line each. */
  details?: string[];
  /** The thread item id of `text`, so it's stored once. */
  clientId?: string;
  conversationId?: string;
  transcript?: string[];
  pageUrl?: string;
  /** Event-day problem report (GRV ref) instead of a request. */
  report?: HelpReport;
}

export interface HelpReport {
  issue: string;
  label: string;
  /** null = not sure / the venue. */
  packageRef: string | null;
  urgent?: boolean;
  photoUrl?: string;
  missing?: string[];
}

/** Event-day report: "It's sorted now". */
export async function markHelpRequestSorted(enquiryId: string) {
  const res = await apiFetch<{ success: true; request: HelpRequestState }>(
    `/customer/chat/help-request/${encodeURIComponent(enquiryId)}/sorted`,
    { method: "POST", body: {} },
  );
  return res.request;
}

/** "Mark as resolved" in the chat. Writing again reopens it. */
export async function resolveHelpRequest(enquiryId: string) {
  const res = await apiFetch<{ success: true; request: HelpRequestState }>(
    `/customer/chat/help-request/${encodeURIComponent(enquiryId)}/resolve`,
    // Guests' tickets are theirs by this browser's anon id.
    { method: "POST", body: { anon_id: readAnonId() } },
  );
  return res.request;
}

/** Event day: they opened a vendor's on-ground number — the Event Manager is told. */
export async function noteVendorContact(bookingRef: string) {
  await apiFetch<{ success: true }>("/customer/chat/booking-help/contact", { method: "POST", body: { bookingRef } });
}

export async function createBookingHelpRequest(payload: BookingHelpPayload) {
  const res = await apiFetch<{ success: true; enquiryId: string; request: HelpRequestState }>(
    "/customer/chat/booking-help",
    { method: "POST", body: payload },
  );
  return res.request;
}

/** GET /customer/chat/area-check — the help panel's location step (Figma 09). */
export interface HelpAreaCheck {
  input: string;
  /** Most specific part, e.g. "Rohini", "Sector 50, Noida". */
  label: string;
  serviceable: boolean;
  /** Platform city for the package search, e.g. "Noida". */
  city: string | null;
  pincode: string | null;
  /** "Sector 15" with no city: one choice per city that has one. */
  ambiguous: { label: string; city: string }[];
  /** Unserved: the closest areas we do cover. */
  closest: { label: string; city: string }[];
}

export async function checkHelpArea(area: string) {
  const res = await apiFetch<{ success: true; area: HelpAreaCheck }>(
    `/customer/chat/area-check?area=${encodeURIComponent(area)}`,
    { auth: false },
  );
  return res.area;
}

export interface AreaWaitlistPayload {
  area: string;
  areaSource: "typed" | "location_tag" | "current_location";
  phone: string;
  consent: true;
  occasion?: string;
  guests?: string;
  budget?: string;
  requestText?: string;
  pageUrl?: string;
}

/** POST /customer/chat/area-waitlist — "Notify me when Eventory begins serving {area}". */
export async function joinAreaWaitlist(payload: AreaWaitlistPayload) {
  const res = await apiFetch<{ success: true; anonId: string | null }>("/customer/chat/area-waitlist", {
    method: "POST",
    body: { ...payload, anon_id: readAnonId() },
  });
  rememberAnonId(res.anonId);
}

// Saved help panel chats ("Your chats"): /customer/chat/help-conversations.
// The thread is stored as the panel's own items and replayed as-is.

export interface HelpConversationSummary {
  conversationId: string;
  title: string | null;
  preview: string | null;
  ticket: string | null;
  enquiryId: string | null;
  lastMessageAt: string;
  /** Open = a ticket the team hasn't resolved; everything else is resolved. */
  status?: "open" | "resolved";
  /** An Event Manager replied since the customer last had it open. */
  unread?: boolean;
}

export interface HelpConversation<Item = Record<string, unknown>, State = Record<string, unknown>>
  extends HelpConversationSummary {
  items: Item[];
  state: State | null;
}

export async function listHelpConversations() {
  const res = await apiFetch<{ success: true; conversations: HelpConversationSummary[] }>(
    `/customer/chat/help-conversations${anonQuery()}`,
  );
  return res.conversations;
}

export async function getHelpConversation<Item, State>(conversationId: string) {
  const res = await apiFetch<{ success: true; conversation: HelpConversation<Item, State> }>(
    `/customer/chat/help-conversations/${encodeURIComponent(conversationId)}${anonQuery()}`,
  );
  return res.conversation;
}

export async function saveHelpConversation(
  conversationId: string,
  body: { items: unknown[]; state: unknown; enquiryId?: string; ticket?: string },
) {
  const res = await apiFetch<{ success: true; anonId: string | null }>(
    `/customer/chat/help-conversations/${encodeURIComponent(conversationId)}`,
    { method: "PUT", body: { ...body, anon_id: readAnonId() } },
  );
  rememberAnonId(res.anonId);
}
