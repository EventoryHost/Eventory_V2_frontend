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
  vendorType: string;
  area?: string;
  date?: string;
  replyMode: "reply-here" | "call-me";
  /** A reference photo is in the brief. Not uploaded (yet) — the team asks for it. */
  hasPhoto?: boolean;
  callTime?: string;
  phone?: string;
  pageUrl?: string;
  transcript?: string[];
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
  /** `window` is the brief's call-time chip; null means as soon as possible. */
  callBack: { requestId: string; ticket: string; window: string | null; callBy: string } | null;
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

export async function createHelpRequest(payload: HelpRequestPayload) {
  const res = await apiFetch<HelpRequestResponse>("/customer/chat/help-request", {
    method: "POST",
    body: { ...payload, anon_id: readAnonId() },
  });
  if (res.anonId) {
    try {
      localStorage.setItem(ANON_KEY, res.anonId);
    } catch {
      // Storage blocked — the next request just gets a fresh anon id.
    }
  }
  return res;
}

const anonQuery = () => {
  const id = readAnonId();
  return id ? `?anon_id=${encodeURIComponent(id)}` : "";
};

export async function getHelpRequest(enquiryId: string) {
  const res = await apiFetch<{ success: true; request: HelpRequestState }>(
    `/customer/chat/help-request/${encodeURIComponent(enquiryId)}${anonQuery()}`,
  );
  return res.request;
}

export async function sendHelpMessage(enquiryId: string, text: string) {
  const res = await apiFetch<{ success: true; message: HelpThreadMessage }>(
    `/customer/chat/help-request/${encodeURIComponent(enquiryId)}/messages`,
    { method: "POST", body: { text, anon_id: readAnonId() } },
  );
  return res.message;
}

export async function requestHelpCallBack(enquiryId: string, phone: string) {
  const res = await apiFetch<{ success: true; request: HelpRequestState }>(
    `/customer/chat/help-request/${encodeURIComponent(enquiryId)}/call-back`,
    { method: "POST", body: { phone, anon_id: readAnonId() } },
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
  areaSource: "typed" | "location_tag";
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
  if (res.anonId) {
    try {
      localStorage.setItem(ANON_KEY, res.anonId);
    } catch {
      // Storage blocked — nothing to remember.
    }
  }
}
