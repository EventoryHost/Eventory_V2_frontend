"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError } from "@/lib/apiClient";
import { detectCurrentLocation } from "@/lib/geocoding";
import {
  checkHelpArea,
  createHelpRequest,
  getHelpConversation,
  getHelpRequest,
  joinAreaWaitlist,
  saveHelpConversation,
  requestHelpCallBack,
  sendHelpMessage,
  continueHelpOnWhatsApp,
  createBookingHelpRequest,
  markHelpRequestSorted,
  type HelpReport,
  type HelpAreaCheck,
  type HelpConversation,
  type HelpRequestState,
} from "@/lib/customerHelpApi";
import type { HelpPackageContext as HelpPageContext } from "../helpContext";
import {
  OCCASIONS as BRIEF_OCCASIONS,
  VENDOR_TYPES as BRIEF_VENDOR_TYPES,
  type HelpBrief,
} from "../components/HelpBriefCard";
import { answerQuestion, FALLBACK_ANSWER } from "./answers";
import { REQUEST_TOPIC, type BookingAction, type BookingReply, type BookingRequestKind } from "./bookingAnswers";
import { findPackages, type HelpPackageResult } from "./findPackages";
import {
  BUDGET_OPTIONS,
  GUEST_OPTIONS,
  OCCASION_OPTIONS,
  REQUIREMENT_OCCASIONS,
  SERVICE_OPTIONS,
  AREA_OPTIONS,
  areaPhrase,
  hasExplorerSignal,
  parseRequest,
  type ParsedRequest,
} from "./parseRequest";

// Figma "04 — Explorer: describe the event → packages" (node 2369:11135).
// Pull out what's already said, ask at most two follow-ups as chips, then
// show packages with a "fits" line. Tapped chips appear as the customer's
// own message. "Done" closes the answer; "Chat with Event Manager" opens
// the brief. Figma "05 — Learner": package-page questions answer from the
// package's data; ones only the vendor can answer open the brief inline.
// Figma "06 — Delegator": the sent brief posts as the customer's message,
// one status card tracks it (sent → late at 30 min → call back), and the
// thread becomes the Event Manager chat: replies are polled from the
// backend and the status card goes once a person has replied.
// Figma "09 — Location": the area (typed, else the location tag) is checked
// against the served region first. Unserved → an honest answer, the closest
// areas we cover and a "Notify me" lead; "Sector 15" → one question.

export type FollowUpField = "occasion" | "guests" | "budget" | "area";
/** Fields on the requirements card. */
export type RequirementField = "occasion" | "service" | "guests" | "budget" | "area" | "date";
type AskedField = Exclude<FollowUpField, "area">;

// `at` (ISO) is when a line was posted: the thread's date chips and the
// ticket's "raised" time read it. Older saved chats only have `time`.
export type ThreadItem =
  | { kind: "me"; id: string; time: string; at?: string; text: string; photoUrl?: string }
  | { kind: "assistant"; id: string; time: string; at?: string; text: string }
  | {
      kind: "event-manager";
      id: string;
      time: string;
      at?: string;
      text: string;
      senderName: string;
    }
  | { kind: "typing"; id: string }
  /**
   * A follow-up question: the assistant's bubble with what it understood
   * so far and the answer chips (v6f4). `understood` is the old tag list,
   * kept for chats saved before the read-only line.
   */
  | {
      kind: "question";
      id: string;
      time?: string;
      at?: string;
      text?: string;
      understoodLine?: string;
      understood: string[];
      field: FollowUpField;
      options: string[];
      answered: boolean;
    }
  /** Packages: one assistant bubble with the line, cards and "See all". */
  | {
      kind: "results";
      id: string;
      time?: string;
      at?: string;
      text?: string;
      understoodLine?: string;
      understood: string[];
      cards: HelpPackageResult[];
      seeAll?: { count: number; href: string };
      /** For the card's "₹X over your budget". */
      budgetMax?: number;
      closed: boolean;
    }
  /**
   * "Your requirements" (v6f4): one per chat, kept as the chat moves on.
   * `req` is what's confirmed (or proposed, while draft); `edit` is the
   * chip editor's working copy. `photo` = asked before a photo's actions.
   */
  | {
      kind: "requirements";
      id: string;
      state: "draft" | "edit" | "confirmed";
      req: ParsedRequest;
      edit?: ParsedRequest;
      prev?: "draft" | "confirmed";
      photo?: boolean;
      /** Field to scroll to and highlight when editing opens. */
      focus?: RequirementField;
      showErrors?: boolean;
    }
  /** The sent brief, as a card (v6f4 "Your brief"). */
  | {
      kind: "brief-sent";
      id: string;
      time: string;
      at?: string;
      rows: [string, string][];
      reach: string;
      photoUrl?: string;
    }
  /** WhatsApp card inside the thread ("message us on WhatsApp"). */
  | { kind: "whatsapp"; id: string }
  /** Booking help: a request for the Event Manager, sent from the card. */
  | {
      kind: "booking-request";
      id: string;
      request: BookingRequestKind;
      /** What they asked, quoted on the card. */
      quote: string;
      state: "open" | "sent";
    }
  /** Booking help: buttons under an answer ("Cancel package(s)", "Yes, money was taken"). */
  | { kind: "booking-actions"; id: string; actions: BookingAction[]; closed: boolean }
  | { kind: "feedback"; id: string; closed: boolean; action?: "customise" }
  /** Figma 8.1: what to do with a shared reference photo. */
  | { kind: "photo-actions"; id: string; closed: boolean }
  | {
      kind: "brief";
      id: string;
      defaults: BriefDefaults;
      state: "open" | "sent" | "dismissed";
    }
  | {
      kind: "system";
      id: string;
      time: string;
      at?: string;
      text: string;
      tone?: "error";
    }
  | {
      kind: "status";
      id: string;
      state: "sent" | "late" | "night" | "call-back";
      /** "by 5:50 PM", "before 6:33 PM", "this evening, 6–9 PM". */
      callBackWhen?: string;
    }
  /** Figma 9.1–9.3: unserved area → closest areas + "Notify me" lead. */
  | {
      kind: "out-of-area";
      id: string;
      area: string;
      areaSource: AreaSource;
      closest: { label: string; city: string }[];
      state: "open" | "saved" | "dismissed";
    }
  /** Guests asking for a call back type a number first. */
  | { kind: "call-back-form"; id: string; state: "open" | "sent" };

/** Where an area came from: typed, the site's location tag, or a fresh fix. */
type AreaSource = "typed" | "location_tag" | "current_location";

/** "Do you serve my area?" — they mean where they are, not a place they named. */
const MY_AREA =
  /\b(my|our) (area|location|city|place|locality|address|pincode|pin code)\b|\bwhere i (live|am|stay)\b|\bnear me\b|\b(serve|cover|deliver)\w* (here|me)\b/i;
const SERVE_QUESTION = /\b(serve|serving|cover|covering|available|deliver|service)/i;

/** The customer's current location: a fresh browser fix, else the location tag. */
async function currentPlace(
  locationCity: string | null,
): Promise<{ text: string; source: AreaSource } | null> {
  let denied = false;
  try {
    const p = await navigator.permissions?.query({ name: "geolocation" });
    denied = p?.state === "denied";
  } catch {
    // No Permissions API (older Safari): just ask for a fix.
  }
  if (!denied) {
    const fix = await detectCurrentLocation();
    if (fix.status === "success") return { text: fix.label, source: "current_location" };
  }
  return locationCity ? { text: locationCity, source: "location_tag" } : null;
}

export type BriefDefaults = {
  initial: Partial<
    Pick<HelpBrief, "occasion" | "guests" | "budget" | "vendorType" | "date">
  >;
  /** An area from the chat: typed, the tag, or one we don't serve yet. */
  initialArea: string;
  /** Reference photo shared earlier in the chat; travels inside the brief. */
  photo?: File;
};

const MAX_FOLLOW_UPS = 2;
/** The requirements card's location-tag Area chip. */
export const LOCATION_TAG = "__location_tag";

/** A guest count → the brief's range chip. */
export const guestBucket = (n: number) =>
  n <= 25
    ? "Up to 25"
    : n <= 50
      ? "25–50"
      : n <= 100
        ? "50–100"
        : n <= 200
          ? "100–200"
          : "200+";
/** A budget → the brief's range chip. */
export const budgetBucket = (n: number) =>
  n <= 25000
    ? "Under ₹25K"
    : n <= 50000
      ? "₹25–50K"
      : n <= 100000
        ? "₹50K–1L"
        : n <= 200000
          ? "₹1–2L"
          : "₹2L+";

/** Package category label → the brief card's vendor-type chip. */
function briefVendorType(label?: string) {
  const l = label?.toLowerCase() ?? "";
  const key = /decor/.test(l)
    ? "Decorator"
    : /cater/.test(l)
      ? "Caterer"
      : /photo|video/.test(l)
        ? "Photographer & videographer"
        : /makeup/.test(l)
          ? "Makeup artist"
          : /\bdj\b|artist/.test(l)
            ? "DJ"
            : /venue/.test(l)
              ? "Venue"
              : undefined;
  return key && (BRIEF_VENDOR_TYPES as readonly string[]).includes(key)
    ? key
    : undefined;
}

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

/** "Is 15 Nov available?" → the next 15 Nov as "2026-11-15", for the brief's date. */
function dateFrom(text: string) {
  const m = text.match(
    /\b(\d{1,2})(?:st|nd|rd|th)?\s*(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\b/i,
  );
  if (!m) return undefined;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(today.getFullYear(), MONTHS.indexOf(m[2].toLowerCase()), Number(m[1]));
  if (d < today) d.setFullYear(d.getFullYear() + 1);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
const QUESTION_TEXT: Record<AskedField, string> = {
  occasion: "Got it. What’s the occasion?",
  guests: "Got it. Roughly how many guests?",
  budget: "Got it. What budget do you have in mind?",
};
const OPTIONS: Record<AskedField, string[]> = {
  occasion: OCCASION_OPTIONS.map((o) => o.label),
  guests: GUEST_OPTIONS.map((o) => o.label),
  budget: BUDGET_OPTIONS.map((o) => o.label),
};

const joinList = (items: string[]) =>
  items.length <= 1
    ? (items[0] ?? "")
    : `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;

const NCR_COVERAGE =
  "Eventory is in Delhi NCR: selected areas of Delhi, Gurugram, Noida, Greater Noida, Ghaziabad and Faridabad.";

const uid = () => crypto.randomUUID();
const timeOf = (d: Date | string) =>
  new Date(d)
    .toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
    .toUpperCase();
const now = () => timeOf(new Date());

const POLL_MS = 15000;
// The open chat, so a reload (or another page) picks it up again.
const CONVERSATION_KEY = "eventory_help_conversation";
const SAVE_DELAY_MS = 800;
const TALK_TO_PERSON =
  /\b(talk|speak|chat)\b.*\b(person|human|someone|somebody|event manager|agent|team)\b|\bcall me\b|\bcall back\b|\bcallback\b/i;

/** "9876543210" → "+91 98765 43210". */
const formatPhone = (phone: string) => {
  const d = phone.replace(/\D/g, "").slice(-10);
  return d.length === 10 ? `+91 ${d.slice(0, 5)} ${d.slice(5)}` : phone;
};

/** The status card's promise for the chosen call time (v6 mockup cbOpts). */
function callPromise(cb: NonNullable<HelpRequestState["callBack"]>) {
  if (!cb.window) return `by ${timeOf(cb.callBy)}`;
  if (cb.window === "In the next hour") return `before ${timeOf(cb.callBy)}`;
  return cb.window[0].toLowerCase() + cb.window.slice(1);
}

/** The one status card for a request, from the backend's view of it. */
function statusOf(r: HelpRequestState): Extract<ThreadItem, { kind: "status" }>["state"] {
  if (r.callBack) return "call-back";
  if (r.offHours) return "night";
  return r.late ? "late" : "sent";
}
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

type Draft = {
  req: ParsedRequest;
  followUps: number;
  /** What they typed, for the out-of-area lead. */
  text?: string;
  /** "Sector 15" — the cities to choose from (Figma 9.4). */
  areaChoices?: { label: string; city: string }[];
  /** An area we don't serve, so the brief can pre-fill it (Figma 9.6). */
  unservedArea?: string;
  /** We asked for their area: the next message is one. */
  awaitingArea?: boolean;
};
type SavedState = { draft: Draft | null };

/** A thread as saved: no typing dots, no photos (they live in this tab only). */
const forSaving = (items: ThreadItem[]) =>
  items
    .filter((i) => i.kind !== "typing")
    .map((i) =>
      i.kind === "me" && i.photoUrl
        ? { ...i, photoUrl: undefined }
        : i.kind === "brief" && i.defaults.photo
          ? { ...i, defaults: { ...i.defaults, photo: undefined } }
          : i.kind === "brief-sent" && i.photoUrl
            ? { ...i, photoUrl: undefined }
            : i,
    );


/** "2026-12-14" → "Mon, 14 Dec". */
export const dateLabel = (iso?: string) => {
  if (!iso) return "";
  const d = new Date(`${iso}T00:00`);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
};

const serviceShown = (req: ParsedRequest) =>
  req.service && req.service.label !== "Not sure yet" ? req.service.label : undefined;

/** v6f4: what the assistant understood, as one read-only line. */
export function understoodLine(req: ParsedRequest) {
  return [
    req.occasion?.label,
    serviceShown(req),
    req.guests?.label,
    req.budget?.label,
    req.area && `${req.area.label}${req.area.fromLocation ? " (your location)" : ""}`,
    dateLabel(req.date),
  ]
    .filter(Boolean)
    .join(" · ");
}

/** "Birthday · 25–50 guests · ₹25–50K · Saket": the brief's attached box and WhatsApp. */
export function requirementsSummary(req: ParsedRequest) {
  return [req.occasion?.label, serviceShown(req), req.guests?.label, req.budget?.label, req.area?.label, dateLabel(req.date)]
    .filter(Boolean)
    .join(" · ");
}

const missingField = (req: ParsedRequest): AskedField | undefined =>
  !req.occasion
    ? "occasion"
    : !req.guests
      ? "guests"
      : !req.budget
        ? "budget"
        : undefined;

type Options = {
  pageContext: HelpPageContext | null;
  /** Signed-in customer's name, for the WhatsApp message. */
  accountName?: string;
  /** City from the site's location tag, used when the customer names no area. */
  locationCity: string | null;
  /** The thread is on screen: polled replies count as read. */
  viewing: boolean;
  /**
   * On a booking page: the event's bookings, its Event Manager and the
   * booking assistant. Questions there are answered from the bookings and
   * requests go to the Event Manager (booking help tickets).
   */
  booking?: {
    refs: string[];
    emName: string | null;
    answer: (text: string) => BookingReply;
    topic: (kind: BookingRequestKind | "arrive" | "included" | "pay-issue") => BookingReply;
  } | null;
};

const MESSAGE_KINDS = new Set(["me", "assistant", "event-manager", "system", "brief-sent"]);

export function useHelpConversation({
  pageContext,
  accountName,
  locationCity,
  viewing,
  booking = null,
}: Options) {
  const [items, setItems] = useState<ThreadItem[]>([]);
  const [busy, setBusy] = useState(false);
  // Once the brief is sent the thread is the Event Manager chat.
  const [request, setRequest] = useState<HelpRequestState | null>(null);
  // The saved chat's id ("Your chats" tab); its ticket stays in it.
  const [conversationId, setConversationId] = useState<string | null>(null);

  /** This chat's id, made on first need (first save, or the brief). */
  const ensureConversationId = () => {
    if (conversationId) return conversationId;
    const id = uid();
    setConversationId(id);
    try {
      localStorage.setItem(CONVERSATION_KEY, id);
    } catch {
      // Storage blocked: saved, but won't reopen after a reload.
    }
    return id;
  };

  // The request being explored, plus how many follow-ups it has used.
  const draft = useRef<Draft | null>(null);
  // The chat's requirements card (one per chat) and whether packages were
  // shown from it yet — a later search says "Updated."
  const reqCard = useRef<{ id: string; state: "draft" | "edit" | "confirmed"; searched: boolean } | null>(null);
  // Ids of thread messages already shown, so polling only adds new ones.
  const seen = useRef(new Set<string>());
  // The latest reference photo; the brief picks it up (Figma 8.3).
  const sharedPhoto = useRef<File | null>(null);
  // What was last saved, so an unchanged thread isn't sent again.
  const savedJson = useRef("");
  // Booking page, "Message {EM}": what they type is the request itself.
  const directEm = useRef(false);

  // Area checks by lower-cased text; the brief's warning reads these.
  const areaCache = useRef(new Map<string, HelpAreaCheck>());
  const [, setAreaVersion] = useState(0);
  const lookArea = async (text: string) => {
    const key = text.trim().toLowerCase();
    if (!key) return null;
    const hit = areaCache.current.get(key);
    if (hit) return hit;
    try {
      const r = await checkHelpArea(text.trim());
      areaCache.current.set(key, r);
      setAreaVersion((v) => v + 1);
      return r;
    } catch {
      return null;
    }
  };
  /** undefined until checked — no warning on a guess. */
  const isAreaServed = useCallback(
    (text: string) => areaCache.current.get(text.trim().toLowerCase())?.serviceable,
    [],
  );

  // Message lines get their posting time, for date chips and "raised".
  const push = useCallback(
    (item: ThreadItem) =>
      setItems((prev) => [
        ...prev,
        MESSAGE_KINDS.has(item.kind) && !("at" in item && item.at) ? ({ ...item, at: new Date().toISOString() } as ThreadItem) : item,
      ]),
    [],
  );
  const replace = (
    pred: (i: ThreadItem) => boolean,
    patch: (i: ThreadItem) => ThreadItem,
  ) => setItems((prev) => prev.map((i) => (pred(i) ? patch(i) : i)));

  const think = async (ms = 600) => {
    const id = uid();
    push({ kind: "typing", id });
    await wait(ms);
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const say = (text: string) => push({ kind: "assistant", id: uid(), time: now(), text });

  /** The requirements card shows what the draft now holds. */
  const syncReqCard = () => {
    const card = reqCard.current;
    const req = draft.current?.req;
    if (!card || !req) return;
    replace(
      (i) => i.id === card.id,
      (i) => (i.kind === "requirements" ? { ...i, req: { ...req } } : i),
    );
  };

  /** Packages for what's confirmed (v6f4 resultsMsgs). */
  const search = async () => {
    const d = draft.current;
    if (!d) return;
    const again = Boolean(reqCard.current?.searched);
    if (reqCard.current) reqCard.current.searched = true;
    const typingId = uid();
    push({ kind: "typing", id: typingId });
    const result = await findPackages(d.req);
    setItems((prev) => prev.filter((i) => i.id !== typingId));

    const lead = !result.cards.length
      ? "I couldn’t find a ready-made package for that. An Event Manager can put options together for you."
      : !result.occasionMatched && d.req.occasion
        ? `I couldn’t find ${d.req.occasion.label.toLowerCase()} packages yet, so here are the closest.`
        : result.exact
          ? `Here ${result.cards.length === 1 ? "is 1 that fits" : `are ${result.cards.length} that fit`}.`
          : result.exactCount > 0
            ? `Here ${result.exactCount === 1 ? "is 1 that fits" : `are ${result.exactCount} that fit`}, plus a few close options.`
            : result.overBudget
              ? "Nothing fits that budget exactly, so here are the closest."
              : "Nothing matches all of that exactly, so here are the closest.";
    const text = `${again ? "Updated. " : ""}${lead}`;
    if (result.cards.length) {
      push({
        kind: "results",
        id: uid(),
        time: now(),
        at: new Date().toISOString(),
        text,
        understoodLine: understoodLine(d.req),
        understood: [],
        cards: result.cards,
        seeAll: result.seeAll,
        budgetMax: d.req.budget?.max,
        closed: false,
      });
    } else {
      say(text);
      push({ kind: "feedback", id: uid(), closed: false });
    }
  };

  /**
   * After each answer: ask for what's missing (at most two follow-ups),
   * then show the requirements card; packages once it's confirmed.
   * `changes` = what this message added, for a card being edited.
   */
  const exploreNext = async (changes?: ParsedRequest) => {
    const d = draft.current;
    if (!d) return;
    const card = reqCard.current;
    const field = missingField(d.req);
    if (!card && field && d.followUps < MAX_FOLLOW_UPS) {
      d.followUps += 1;
      await think();
      const understood = understoodLine(d.req);
      push({
        kind: "question",
        id: uid(),
        time: now(),
        at: new Date().toISOString(),
        text: Object.keys(d.req).length ? QUESTION_TEXT[field] : QUESTION_TEXT[field].replace("Got it.", "Happy to help."),
        understoodLine: understood,
        understood: [],
        field,
        options: OPTIONS[field],
        answered: false,
      });
      return;
    }

    if (!card) {
      await think();
      say("Here’s what I’ve got. Check it, and I’ll find packages that fit.");
      const id = uid();
      reqCard.current = { id, state: "draft", searched: false };
      push({ kind: "requirements", id, state: "draft", req: { ...d.req } });
      return;
    }

    if (card.state === "edit") {
      // Typed while the editor is open: it lands in the editor.
      replace(
        (i) => i.id === card.id,
        (i) => (i.kind === "requirements" ? { ...i, edit: { ...i.edit, ...changes } } : i),
      );
      await think(400);
      say("Added that to your requirements above.");
      return;
    }

    syncReqCard();
    if (card.state !== "confirmed") {
      await think(400);
      say("Added that to your requirements above.");
      return;
    }
    await think(400);
    await search();
  };


  /** After the brief: messages go to the Event Manager team, not the assistant. */
  const messageEventManager = async (text: string) => {
    if (!request) return;
    const id = uid();
    push({ kind: "me", id, time: now(), text });
    try {
      const sent = await sendHelpMessage(request.enquiryId, text, id);
      seen.current.add(sent.messageId);
    } catch {
      push({
        kind: "system",
        id: uid(),
        time: now(),
        text: "Not sent. Check your connection and try again.",
        tone: "error",
      });
    }
  };

  /** Figma 6.1: "Talk to a person" asks for the brief inside the chat. */
  const startHandOff = async (text = "I’d like to talk to an Event Manager") => {
    if (items.some((i) => i.kind === "brief" && i.state === "open")) return;
    setBusy(true);
    push({ kind: "me", id: uid(), time: now(), text });
    try {
      await think();
      push({
        kind: "assistant",
        id: uid(),
        time: now(),
        text: "Sure. Tell them the basics below so they can help straight away. You can ask for a call, too.",
      });
      openBriefWith(dateFrom(text));
    } finally {
      setBusy(false);
    }
  };

  /**
   * Figma 09: the area typed, else the location tag, checked against the
   * served region before searching. `askOnly` answers "do you serve X?"
   * without searching.
   */
  const locate = async (
    text: string,
    parsed: ParsedRequest,
    {
      askOnly = false,
      place,
      changes,
    }: {
      askOnly?: boolean;
      /** Check this place instead of reading one from the text. */
      place?: { text: string; source: AreaSource };
      /** What else this message changed, for a card being edited. */
      changes?: ParsedRequest;
    } = {},
  ) => {
    const d = draft.current;
    if (!d) return;
    const typed = place ? undefined : areaPhrase(text);
    const where = place?.text ?? typed ?? locationCity ?? undefined;
    const source: AreaSource = place?.source ?? (typed ? "typed" : "location_tag");
    if (!where) {
      await exploreNext(changes);
      return;
    }
    const typingId = uid();
    push({ kind: "typing", id: typingId });
    const r = await lookArea(where);
    setItems((prev) => prev.filter((i) => i.id !== typingId));

    // Check unavailable: search as before rather than block the customer.
    if (!r) {
      if (askOnly) {
        push({
          kind: "assistant",
          id: uid(),
          time: now(),
          text: `I couldn’t check ${source === "typed" ? "that area" : "your location"} right now. ${NCR_COVERAGE}`,
        });
        push({ kind: "feedback", id: uid(), closed: false });
        return;
      }
      d.req.area =
        parsed.area ??
        (!typed && locationCity ? { label: locationCity, city: locationCity, fromLocation: true } : undefined);
      await exploreNext({ ...changes, area: d.req.area });
      return;
    }
    if (r.ambiguous.length) {
      d.areaChoices = r.ambiguous;
      const cities = r.ambiguous.map((c) => c.city);
      push({
        kind: "assistant",
        id: uid(),
        time: now(),
        text: `Which ${r.label} do you mean? There’s one in ${joinList(cities)}.`,
      });
      push({
        kind: "question",
        id: uid(),
        understood: [],
        field: "area",
        options: cities,
        answered: false,
      });
      return;
    }
    const whereNote =
      source === "current_location"
        ? `You’re in ${r.label} right now. `
        : source === "location_tag"
          ? `Your location is set to ${r.label}. `
          : "";
    if (!r.serviceable) {
      d.unservedArea = r.label;
      push({
        kind: "assistant",
        id: uid(),
        time: now(),
        text: `${whereNote}We don’t cover ${r.label} yet. ${NCR_COVERAGE}`,
      });
      push({
        kind: "out-of-area",
        id: uid(),
        area: r.label,
        areaSource: source,
        closest: r.closest,
        state: "open",
      });
      return;
    }
    d.req.area = { label: r.label, city: r.city ?? r.label, fromLocation: source !== "typed" };
    if (askOnly) {
      push({
        kind: "assistant",
        id: uid(),
        time: now(),
        text: `${whereNote}Yes, we cover ${source === "typed" ? r.label : "it"}. Tell me the occasion, guest count and budget, and I’ll show packages there.`,
      });
      push({ kind: "feedback", id: uid(), closed: false });
      return;
    }
    await exploreNext({ ...changes, area: d.req.area });
  };

  /** "Notify me" (Figma 9.2): the lead, with what they were planning. */
  const notifyArea = useCallback(async (itemId: string, phone: string) => {
    const item = items.find((i) => i.id === itemId);
    if (item?.kind !== "out-of-area") return;
    const req = draft.current?.req;
    try {
      await joinAreaWaitlist({
        area: item.area,
        areaSource: item.areaSource,
        phone,
        consent: true,
        occasion: req?.occasion?.label,
        guests: req?.guests?.label,
        budget: req?.budget?.label,
        requestText: draft.current?.text,
        pageUrl: window.location.href,
      });
      replace(
        (i) => i.id === itemId,
        (i) => ({ ...i, state: "saved" }) as ThreadItem,
      );
    } catch {
      push({
        kind: "system",
        id: uid(),
        time: now(),
        text: "Couldn’t save that. Check your connection and try again.",
        tone: "error",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  /** A "Closest areas we cover" chip: search there instead. */
  const pickClosestArea = useCallback(
    async (itemId: string, choice: { label: string; city: string }) => {
      if (busy) return;
      setBusy(true);
      replace(
        (i) => i.id === itemId,
        (i) => ({ ...i, state: "dismissed" }) as ThreadItem,
      );
      push({ kind: "me", id: uid(), time: now(), text: choice.label });
      if (!draft.current) draft.current = { req: {}, followUps: 0 };
      draft.current.req.area = { label: choice.label, city: choice.city };
      draft.current.unservedArea = undefined;
      try {
        await exploreNext();
      } finally {
        setBusy(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [busy],
  );

  // ---- Booking help (v6f9 "Help with your booking") ----
  /** An answer from the booking assistant: text, then its buttons, card or Done. */
  const applyBookingReply = (reply: BookingReply, quote: string) => {
    say(reply.text);
    if (reply.actions?.length) push({ kind: "booking-actions", id: uid(), actions: reply.actions, closed: false });
    if (reply.request) push({ kind: "booking-request", id: uid(), request: reply.request, quote, state: "open" });
    else if (reply.feedback) push({ kind: "feedback", id: uid(), closed: false });
  };

  /** Clears the panel for a new chat (the old one stays in Your chats). */
  const resetThread = () => {
    setItems([]);
    setRequest(null);
    draft.current = null;
    reqCard.current = null;
    seen.current = new Set();
    sharedPhoto.current = null;
    savedJson.current = "";
    directEm.current = false;
    setConversationId(null);
    try {
      localStorage.removeItem(CONVERSATION_KEY);
    } catch {
      // Nothing stored.
    }
  };

  /** A row from a booking door ("Ask a vendor something"): a fresh thread with its answer. */
  const startBookingTopic = useCallback(
    async (question: string, kind: BookingRequestKind | "arrive" | "included" | "pay-issue") => {
      if (!booking) return;
      resetThread();
      setBusy(true);
      push({ kind: "me", id: uid(), time: now(), text: question });
      try {
        await think();
        applyBookingReply(booking.topic(kind), question);
      } finally {
        setBusy(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [booking],
  );

  /** "Message {EM}": an empty chat whose first message becomes the request. */
  const startEventManagerChat = useCallback(() => {
    if (!booking) return;
    resetThread();
    directEm.current = true;
    const who = booking.emName ?? "the Event Manager team";
    push({
      kind: "system",
      id: uid(),
      time: now(),
      text: `Message ${who} here. They usually reply within 30 min, 9 AM–9 PM.`,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [booking]);

  /** A new chat id, for a request that starts its own chat. */
  const freshConversation = () => {
    resetThread();
    const id = uid();
    setConversationId(id);
    try {
      localStorage.setItem(CONVERSATION_KEY, id);
    } catch {
      // Storage blocked: saved, but won't reopen after a reload.
    }
    return id;
  };

  /**
   * Sends a booking request: the ticket, its first message, then the status
   * card. From a request card in the chat (cardId), from the composer, or —
   * `fresh` — as a new chat (the change screens).
   */
  const sendBookingRequest = async (
    { topic, text, details = [], report }: { topic: string; text: string; details?: string[]; report?: HelpReport },
    cardId?: string,
    { fresh = false }: { fresh?: boolean } = {},
  ) => {
    if (!booking) return;
    const id = uid();
    const conversation = fresh ? freshConversation() : ensureConversationId();
    const transcript = fresh
      ? []
      : items
          .filter((i): i is Extract<ThreadItem, { kind: "me" | "assistant" }> => i.kind === "me" || i.kind === "assistant")
          .slice(-10)
          .map((i) => `${i.kind === "me" ? "Customer" : "Assistant"}: ${i.text}`);
    const r = await createBookingHelpRequest({
      bookingRefs: booking.refs,
      topic,
      text,
      details,
      clientId: id,
      conversationId: conversation,
      transcript,
      pageUrl: window.location.href,
      report,
    });
    seen.current = new Set(r.messages.filter((m) => m.from === "event_manager").map((m) => m.messageId));
    const who = booking.emName ?? "the Event Manager team";
    setItems((prev) => [
      ...prev.map((i) =>
        i.kind === "booking-request" && (cardId ? i.id === cardId : i.state === "open") ? { ...i, state: "sent" as const } : i,
      ),
      // The card's message is theirs; a direct message is already on screen.
      ...(cardId || fresh ? [{ kind: "me", id, time: now(), at: new Date().toISOString(), text } as ThreadItem] : []),
      {
        kind: "system",
        id: uid(),
        time: timeOf(r.createdAt),
        at: new Date(r.createdAt).toISOString(),
        text: `${report ? "Reported to" : "Sent to"} ${who} · ${r.ticket}`,
      },
      { kind: "status", id: uid(), state: statusOf(r), callBackWhen: r.callBack ? callPromise(r.callBack) : undefined },
    ]);
    setRequest(r);
  };

  /**
   * "Get a call back" from the booking home, with no chat yet: a ticket
   * for it, then the call back on that ticket.
   */
  const bookingCallBack = async (input: { phone: string; window?: string; note?: string }) => {
    if (!booking) throw new Error("Not on a booking page");
    const conversation = freshConversation();
    const id = uid();
    const text = input.note?.trim() || "Please call me back about my booking.";
    const first = await createBookingHelpRequest({
      bookingRefs: booking.refs,
      topic: "Call back request",
      text,
      clientId: id,
      conversationId: conversation,
      pageUrl: window.location.href,
    });
    const r = await requestHelpCallBack(first.enquiryId, input);
    const cb = r.callBack;
    if (!cb) throw new Error("Call back not saved");
    const who = booking.emName ?? "the Event Manager team";
    const at = new Date().toISOString();
    setItems([
      { kind: "me", id, time: now(), at, text },
      { kind: "system", id: uid(), time: now(), at, text: `Sent to ${who} · ${r.ticket}` },
      { kind: "system", id: uid(), time: now(), at, text: `Call back requested · ${cb.ticket}` },
      { kind: "status", id: uid(), state: "call-back", callBackWhen: callPromise(cb) },
    ]);
    setRequest(r);
    return { ticket: cb.ticket, when: callPromise(cb) };
  };

  /** Event-day report: "It's sorted now" — the team closes it after checking. */
  const markSorted = async () => {
    if (!request || request.customerSortedAt) return;
    const r = await markHelpRequestSorted(request.enquiryId);
    setRequest(r);
    const who = booking?.emName ?? "The Event Manager team";
    push({
      kind: "system",
      id: uid(),
      time: now(),
      text: `You said it’s sorted. ${who} will check with the vendor and close it.`,
    });
  };

  /** Request card "Send to {EM}". */
  const sendBookingCard = async (cardId: string, input: { text: string; details?: string[] }) => {
    const card = items.find((i) => i.id === cardId);
    if (card?.kind !== "booking-request") return;
    await sendBookingRequest({ topic: REQUEST_TOPIC[card.request], text: input.text, details: input.details }, cardId);
  };

  /** Buttons under a booking answer. Cancel / Payments are the widget's. */
  const bookingAction = useCallback(
    async (itemId: string, action: BookingAction) => {
      if (!booking || busy) return;
      replace(
        (i) => i.id === itemId,
        (i) => (i.kind === "booking-actions" ? { ...i, closed: true } : i),
      );
      if (action !== "pay-taken" && action !== "pay-not") return;
      setBusy(true);
      const label = action === "pay-taken" ? "Yes, money was taken" : "No, it just failed";
      push({ kind: "me", id: uid(), time: now(), text: label });
      try {
        await think();
        if (action === "pay-taken") applyBookingReply(booking.topic("payment-issue"), "Money was deducted but the payment didn’t go through");
        else {
          say("Nothing was charged, so you can try again. A different method, such as UPI instead of a card, often works. If it fails again, I’ll pass it to your Event Manager.");
          push({ kind: "feedback", id: uid(), closed: false });
        }
      } finally {
        setBusy(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [booking, busy],
  );

  const ask = useCallback(
    async (text: string) => {
      if (!text || busy) return;
      if (request) {
        void messageEventManager(text);
        return;
      }
      // Booking page: "Message {EM}" sends it; otherwise the booking assistant.
      if (booking) {
        if (directEm.current) {
          setBusy(true);
          const id = uid();
          push({ kind: "me", id, time: now(), text });
          try {
            await sendBookingRequest({ topic: REQUEST_TOPIC.message, text });
          } catch {
            push({ kind: "system", id: uid(), time: now(), text: "Not sent. Check your connection and try again.", tone: "error" });
          } finally {
            setBusy(false);
          }
          return;
        }
        setBusy(true);
        push({ kind: "me", id: uid(), time: now(), text });
        try {
          await think();
          applyBookingReply(booking.answer(text), text);
        } finally {
          setBusy(false);
        }
        return;
      }
      if (TALK_TO_PERSON.test(text)) {
        void startHandOff(text);
        return;
      }
      setBusy(true);
      push({ kind: "me", id: uid(), time: now(), text });
      try {
        // A typed reply while a follow-up is open fills that gap first.
        const hasOpenQuestion = items.some(
          (i) => i.kind === "question" && !i.answered,
        );
        const openQuestion = hasOpenQuestion ? draft.current : null;
        const parsed = parseRequest(text);
        const faq = answerQuestion(text, pageContext);

        // "Do you serve my area?" — check where they are now.
        if (!parsed.occasion && SERVE_QUESTION.test(text) && MY_AREA.test(text) && !areaPhrase(text)) {
          draft.current = { req: {}, followUps: 0, text };
          const typingId = uid();
          push({ kind: "typing", id: typingId });
          const here = await currentPlace(locationCity);
          setItems((prev) => prev.filter((i) => i.id !== typingId));
          if (!here) {
            draft.current.awaitingArea = true;
            push({
              kind: "assistant",
              id: uid(),
              time: now(),
              text: "I can’t see your location. Tell me your area or pincode and I’ll check.",
            });
            return;
          }
          await locate(text, parsed, { askOnly: true, place: here });
          return;
        }

        // The area or pincode we asked for.
        if (draft.current?.awaitingArea && !parsed.occasion && !faq) {
          draft.current = { req: {}, followUps: 0, text };
          await locate(text, parsed, {
            askOnly: true,
            place: { text: areaPhrase(text) ?? text, source: "typed" },
          });
          return;
        }

        // "Do you serve Chandigarh?" — check the place they named.
        if (!parsed.occasion && areaPhrase(text) && SERVE_QUESTION.test(text)) {
          draft.current = { req: { ...parsed, area: undefined }, followUps: 0, text };
          await locate(text, parsed, { askOnly: true });
          return;
        }

        if (faq && !parsed.occasion) {
          await think();
          push({ kind: "assistant", id: uid(), time: now(), text: faq.text });
          if (faq.handoff) openBriefWith(dateFrom(text));
          else
            push({
              kind: "feedback",
              id: uid(),
              closed: false,
              action: faq.action,
            });
          return;
        }

        // A typed answer to "Which Sector 15?" names one of the cities.
        const openArea = openQuestion?.areaChoices?.find((c) =>
          new RegExp(`\\b${c.city}\\b`, "i").test(text),
        );
        if (openQuestion && openArea) {
          openQuestion.req = { ...openQuestion.req, ...parsed, area: { label: openArea.label, city: openArea.city } };
          openQuestion.areaChoices = undefined;
          replace(
            (i) => i.kind === "question" && !i.answered,
            (i) => ({ ...i, answered: true }) as ThreadItem,
          );
          await exploreNext({ ...parsed, area: openQuestion.req.area });
          return;
        }

        if (openQuestion && Object.keys(parsed).length) {
          openQuestion.req = { ...openQuestion.req, ...parsed };
          replace(
            (i) => i.kind === "question" && !i.answered,
            (i) => ({ ...i, answered: true }) as ThreadItem,
          );
          await exploreNext(parsed);
          return;
        }

        // The chat has a requirements card: what they add goes on it.
        if (reqCard.current && draft.current && Object.keys(parsed).length) {
          const rest: ParsedRequest = { ...parsed };
          delete rest.area;
          draft.current.req = { ...draft.current.req, ...rest };
          draft.current.text = text;
          if (areaPhrase(text)) await locate(text, parsed, { changes: rest });
          else await exploreNext(rest);
          return;
        }

        if (hasExplorerSignal(parsed, text)) {
          draft.current = { req: { ...parsed, area: undefined }, followUps: 0, text };
          await locate(text, parsed);
          return;
        }

        await think();
        push({
          kind: "assistant",
          id: uid(),
          time: now(),
          text: FALLBACK_ANSWER,
        });
        push({ kind: "feedback", id: uid(), closed: false });
      } finally {
        setBusy(false);
      }
    },
    // exploreNext/think only touch refs and stable setters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [busy, items, request, pageContext, locationCity, booking],
  );

  const answerFollowUp = useCallback(
    async (questionId: string, field: FollowUpField, option: string) => {
      const d = draft.current;
      if (!d || busy) return;
      setBusy(true);
      replace(
        (i) => i.id === questionId,
        (i) => ({ ...i, answered: true }) as ThreadItem,
      );
      push({ kind: "me", id: uid(), time: now(), text: option });
      if (field === "occasion")
        d.req.occasion = OCCASION_OPTIONS.find((o) => o.label === option);
      if (field === "guests") {
        const g = GUEST_OPTIONS.find((o) => o.label === option);
        if (g) d.req.guests = { count: g.count, label: `${g.label} guests` };
      }
      if (field === "budget")
        d.req.budget = BUDGET_OPTIONS.find((o) => o.label === option);
      if (field === "area") {
        // Figma 9.5: the chosen city becomes part of what was understood.
        const choice = d.areaChoices?.find((c) => c.city === option);
        if (choice) d.req.area = { label: choice.label, city: choice.city };
        d.areaChoices = undefined;
      }
      try {
        await exploreNext();
      } finally {
        setBusy(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [busy],
  );

  /** "Done" closes the answer's actions. */
  const close = useCallback((id: string) => {
    replace(
      (i) => i.id === id,
      (i) => ({ ...i, closed: true }) as ThreadItem,
    );
  }, []);

  // ---- Requirements card (v6f4) ----
  const setReqItem = (patch: (i: Extract<ThreadItem, { kind: "requirements" }>) => ThreadItem) => {
    const card = reqCard.current;
    if (!card) return;
    replace(
      (i) => i.id === card.id,
      (i) => (i.kind === "requirements" ? patch(i) : i),
    );
  };

  /** "Looks right, find packages". */
  const confirmRequirements = useCallback(async () => {
    const card = reqCard.current;
    if (!card || busy) return;
    setBusy(true);
    card.state = "confirmed";
    setReqItem((i) => ({ ...i, state: "confirmed" }));
    push({ kind: "me", id: uid(), time: now(), text: "Looks right" });
    try {
      await think(400);
      await search();
    } finally {
      setBusy(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busy]);

  /** "Edit" / "+ Add area": the card turns into chip groups. */
  const editRequirements = useCallback((focus?: RequirementField) => {
    const card = reqCard.current;
    const req = draft.current?.req;
    if (!card || !req) return;
    const prev = card.state === "edit" ? undefined : card.state;
    card.state = "edit";
    setReqItem((i) => ({
      ...i,
      state: "edit",
      edit: i.state === "edit" && i.edit ? i.edit : { ...req },
      prev: prev ?? i.prev,
      focus,
      showErrors: false,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** One chip in the editor; tapping the selected one again clears an optional field. */
  const setRequirement = useCallback((field: RequirementField, value: string) => {
    setReqItem((i) => {
      const e: ParsedRequest = { ...(i.edit ?? i.req) };
      if (field === "occasion") e.occasion = REQUIREMENT_OCCASIONS.find((o) => o.label === value);
      if (field === "guests") {
        const g = GUEST_OPTIONS.find((o) => o.label === value);
        e.guests = g && { count: g.count, label: `${g.label} guests` };
      }
      if (field === "budget") e.budget = BUDGET_OPTIONS.find((o) => o.label === value);
      if (field === "service") {
        const v = SERVICE_OPTIONS.find((o) => o.label === value);
        e.service = e.service?.label === value ? undefined : v;
      }
      if (field === "area") {
        if (value === LOCATION_TAG && locationCity) {
          const tagLabel = areaCache.current.get(locationCity.trim().toLowerCase())?.label ?? locationCity;
          e.area = e.area?.fromLocation ? undefined : { label: tagLabel, city: locationCity, fromLocation: true };
        } else {
          const a = AREA_OPTIONS.find((o) => o.label === value) ?? (e.area?.label === value ? e.area : undefined);
          e.area = e.area?.label === value && !e.area.fromLocation ? undefined : a;
        }
      }
      if (field === "date") e.date = value || undefined;
      return { ...i, edit: e, focus: undefined };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locationCity]);

  /** "Save and find packages" (or "Continue" before a photo's actions). */
  const saveRequirements = useCallback(async () => {
    const card = reqCard.current;
    const d = draft.current;
    const item = items.find((i) => i.id === card?.id);
    if (!card || !d || item?.kind !== "requirements" || busy) return;
    const e = item.edit ?? item.req;
    if (!e.occasion || !e.guests || !e.budget) {
      setReqItem((i) => ({ ...i, showErrors: true }));
      return;
    }
    setBusy(true);
    const wasConfirmed = item.prev === "confirmed";
    const photoStep = Boolean(item.photo);
    d.req = { ...e };
    card.state = "confirmed";
    setReqItem((i) => ({ ...i, state: "confirmed", req: { ...e }, edit: undefined, prev: undefined, photo: false, showErrors: false }));
    try {
      // Edited from the brief: the brief shows the update, nothing else.
      if (items.some((i) => i.kind === "brief" && i.state === "open")) return;
      if (photoStep) {
        push({ kind: "me", id: uid(), time: now(), text: requirementsSummary(e) });
        await think();
        say("Thanks. What would you like to do with your photo?");
        push({ kind: "photo-actions", id: uid(), closed: false });
        return;
      }
      setItems((prev) => prev.map((i) => (i.kind === "feedback" && !i.closed ? { ...i, closed: true } : i)));
      push({ kind: "me", id: uid(), time: now(), text: wasConfirmed ? "Updated my requirements" : "Looks right" });
      await think(400);
      await search();
    } finally {
      setBusy(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, busy]);

  /** "Cancel": back to what the card showed before editing. */
  const cancelRequirementsEdit = useCallback(() => {
    const card = reqCard.current;
    if (!card) return;
    setReqItem((i) => {
      const back = i.prev ?? "draft";
      card.state = back;
      return { ...i, state: back, edit: undefined, prev: undefined, showErrors: false };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  /** Figma 8.1: one upload, then a choice. */
  const photo = useCallback(
    async (file: File) => {
      sharedPhoto.current = file;
      setItems((prev) =>
        prev.map((i) =>
          i.kind === "photo-actions" ? { ...i, closed: true } : i,
        ),
      );
      push({
        kind: "me",
        id: uid(),
        time: now(),
        text: "Reference photo",
        photoUrl: URL.createObjectURL(file),
      });
      // After the brief the thread is the Event Manager chat: the photo
      // can't reach them from here (photos aren't uploaded yet).
      if (request) {
        push({
          kind: "system",
          id: uid(),
          time: now(),
          text: "Photos can’t be sent here yet. Share it on WhatsApp instead.",
          tone: "error",
        });
        return;
      }
      // v6f4: the three must-haves first, so packages fit the event; the
      // photo's actions come once they're saved.
      if (reqCard.current?.state === "confirmed") {
        await think();
        say("Got your photo. What would you like to do with it?");
        push({ kind: "photo-actions", id: uid(), closed: false });
        return;
      }
      if (!draft.current) draft.current = { req: {}, followUps: 0 };
      const d = draft.current;
      if (!d.req.area && locationCity) {
        const tag = await lookArea(locationCity);
        if (tag?.serviceable) d.req.area = { label: tag.label, city: tag.city ?? tag.label, fromLocation: true };
      }
      await think();
      say("Got your photo. Three quick things first, so I only show packages that fit your event.");
      if (reqCard.current) {
        reqCard.current.state = "edit";
        setReqItem((i) => ({ ...i, state: "edit", edit: { ...d.req }, prev: i.state === "edit" ? i.prev : i.state, photo: true }));
      } else {
        const id = uid();
        reqCard.current = { id, state: "edit", searched: false };
        push({ kind: "requirements", id, state: "edit", req: { ...d.req }, edit: { ...d.req }, photo: true });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [request, locationCity],
  );

  /**
   * Figma 8.2 "Find similar packages". Image search is phase 2 (pending
   * sign-off), so for now: coming soon, and an Event Manager can match it.
   */
  const findSimilar = useCallback(
    async (id: string) => {
      close(id);
      push({ kind: "me", id: uid(), time: now(), text: "Find similar packages" });
      await think();
      push({
        kind: "assistant",
        id: uid(),
        time: now(),
        text: "Photo matching is coming soon. For now, an Event Manager can find packages like this for you. Send it with your brief and they’ll reply here.",
      });
      push({ kind: "feedback", id: uid(), closed: false });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );



  /** Brief pre-fill: what the assistant understood, else the package's own data. */
  const briefDefaults = (date?: string): BriefDefaults => {
    const req = draft.current?.req;
    const ctxOccasion = pageContext?.eventCategories
      .map((c) =>
        (BRIEF_OCCASIONS as readonly string[]).find(
          (o) => o.toLowerCase() === c.toLowerCase(),
        ),
      )
      .find(Boolean);
    return {
      initial: {
        occasion: req?.occasion
          ? (BRIEF_OCCASIONS as readonly string[]).includes(req.occasion.label)
            ? req.occasion.label
            : "Other"
          : ctxOccasion,
        guests: req?.guests ? guestBucket(req.guests.count) : undefined,
        budget: req?.budget ? budgetBucket(req.budget.max) : undefined,
        vendorType:
          req?.service && (BRIEF_VENDOR_TYPES as readonly string[]).includes(req.service.label)
            ? req.service.label
            : briefVendorType(pageContext?.vendorType),
        date: date ?? req?.date,
      },
      initialArea: req?.area?.label ?? draft.current?.unservedArea ?? "",
      photo: sharedPhoto.current ?? undefined,
    };
  };

  /** Opens the brief at the end of the thread (Figma 5.4); one at a time. */
  function openBriefWith(date?: string) {
    setItems((prev) => [
      ...prev.map((i): ThreadItem =>
        i.kind === "brief" && i.state === "open"
          ? { ...i, state: "dismissed" }
          : // The hand-off answers them: earlier Done / Chat buttons go.
            (i.kind === "feedback" || i.kind === "results" || i.kind === "photo-actions") && !i.closed
            ? { ...i, closed: true }
            : i.kind === "out-of-area" && i.state === "open"
              ? { ...i, state: "dismissed" }
              : i,
      ),
      {
        kind: "brief",
        id: uid(),
        defaults: briefDefaults(date),
        state: "open",
      },
    ]);
  }
  /** Figma 8.3: straight to the brief, with the photo already attached. */
  const sendPhotoToEventManager = useCallback(
    (id: string) => {
      close(id);
      push({ kind: "me", id: uid(), time: now(), text: "Send to an Event Manager" });
      openBriefWith();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pageContext, locationCity],
  );
  /** "Chat with Event Manager": the Figma 6.1 hand-off. */
  const openBrief = useCallback(
    () => {
      // Booking page: "Ask {EM}" — a request card for what they asked.
      if (booking) {
        if (items.some((i) => i.kind === "booking-request" && i.state === "open")) return;
        setItems((prev) => [
          ...prev.map((i) => (i.kind === "feedback" && !i.closed ? { ...i, closed: true } : i)),
          { kind: "booking-request", id: uid(), request: "message", quote: threadTitle ?? "My question", state: "open" },
        ]);
        return;
      }
      void startHandOff();
    }, // eslint-disable-next-line react-hooks/exhaustive-deps
    [items, pageContext, locationCity, booking],
  );

  const dismissBrief = useCallback(() => {
    setItems((prev) =>
      prev.map((i) =>
        i.kind === "brief" && i.state === "open"
          ? { ...i, state: "dismissed" }
          : i,
      ),
    );
  }, []);

  const hasOpenBrief = items.some(
    (i) => i.kind === "brief" && i.state === "open",
  );

  const sendBrief = async (brief: HelpBrief) => {
    const transcript = items
      .filter(
        (i): i is Extract<ThreadItem, { kind: "me" | "assistant" }> =>
          i.kind === "me" || i.kind === "assistant",
      )
      .slice(-10)
      .map((i) => `${i.kind === "me" ? "Customer" : "Assistant"}: ${i.text}`);
    const res = await createHelpRequest({
      occasion: brief.occasion,
      guests: brief.guests,
      budget: brief.budget,
      vendorType: brief.vendorType || undefined,
      area: brief.area || undefined,
      date: brief.date ? dateLabel(brief.date) : undefined,
      replyMode: brief.replyMode,
      hasPhoto: Boolean(brief.photo),
      callTime: brief.callTime ?? undefined,
      phone: brief.phone ?? undefined,
      pageUrl: window.location.href,
      transcript,
      conversationId: ensureConversationId(),
    });
    const r = res.request;
    const rows: [string, string][] = [
      ["Occasion", brief.occasion],
      ["Service", brief.vendorType || "Not sure yet"],
      ["Guests", `${brief.guests} guests`],
      ["Budget", brief.budget],
      ...(brief.area ? ([["Area", brief.area]] as [string, string][]) : []),
      ...(brief.date ? ([["Date", dateLabel(brief.date)]] as [string, string][]) : []),
    ];
    const reach =
      brief.replyMode === "call-me" && brief.phone ? `Call me on ${formatPhone(brief.phone)}` : "Here in this chat";
    setItems((prev) => [
      ...prev.map((i) =>
        i.kind === "brief" && i.state === "open"
          ? { ...i, state: "sent" as const }
          : i,
      ),
      // v6f4: the sent brief is a card, not a "My brief:" message.
      {
        kind: "brief-sent",
        id: uid(),
        time: timeOf(r.createdAt),
        at: new Date(r.createdAt).toISOString(),
        rows,
        reach,
        photoUrl: brief.photo ? URL.createObjectURL(brief.photo) : undefined,
      },
      {
        kind: "status",
        id: uid(),
        state: statusOf(r),
        callBackWhen: r.callBack ? callPromise(r.callBack) : undefined,
      },
    ]);
    setRequest(r);
  };

  /** Applies the backend's view: new Event Manager replies, late, call back. */
  const sync = useCallback((r: HelpRequestState) => {
    setRequest(r);
    const fresh = r.messages.filter(
      (m) => m.from === "event_manager" && !seen.current.has(m.messageId),
    );
    fresh.forEach((m) => seen.current.add(m.messageId));
    setItems((prev) => {
      // The status card goes once a person has replied (Figma 6.7).
      let next = r.replied
        ? prev.filter((i) => i.kind !== "status")
        : prev.map((i) =>
            // Night cards turn late too, from 9:30 AM (Figma 10.2).
            i.kind === "status" && (i.state === "sent" || i.state === "night") && r.late
              ? { ...i, state: "late" as const }
              : i,
          );
      if (fresh.length)
        next = [
          ...next,
          ...fresh.map(
            (m): ThreadItem => ({
              kind: "event-manager",
              id: m.messageId,
              time: timeOf(m.sentAt),
              text: m.text,
              senderName: m.senderName ?? "Event Manager",
            }),
          ),
        ];
      return next;
    });
  }, []);

  const enquiryId = request?.enquiryId;
  // While the chat is on screen, polls mark its replies read ("New reply"
  // in Your chats goes); opening it marks them read straight away.
  useEffect(() => {
    if (!enquiryId) return;
    let stopped = false;
    const poll = async () => {
      if (document.visibilityState !== "visible") return;
      try {
        const r = await getHelpRequest(enquiryId, { seen: viewing });
        if (!stopped) sync(r);
      } catch {
        // Offline or server down: the next tick tries again.
      }
    };
    if (viewing) void poll();
    const timer = window.setInterval(poll, POLL_MS);
    document.addEventListener("visibilitychange", poll);
    return () => {
      stopped = true;
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", poll);
    };
  }, [enquiryId, sync, viewing]);

  /**
   * The "Request a call back" screen's submit: the status card becomes
   * the call back's promise, with a line for its reference.
   */
  const requestCallBack = async (input: { phone: string; window?: string; note?: string }) => {
    if (!request) throw new Error("No request to call back on");
    const r = await requestHelpCallBack(request.enquiryId, input);
    const cb = r.callBack;
    setRequest(r);
    if (!cb) throw new Error("Call back not saved");
    setItems((prev) => [
      ...prev.filter((i) => i.kind !== "status" && i.kind !== "whatsapp"),
      {
        kind: "system",
        id: uid(),
        time: now(),
        at: new Date().toISOString(),
        text: `Call back requested · ${cb.ticket}`,
      },
      {
        kind: "status",
        id: uid(),
        state: "call-back",
        callBackWhen: callPromise(cb),
      },
    ]);
    return { ticket: cb.ticket, when: callPromise(cb) };
  };


  // ---- WhatsApp (v6f9: the message carries the ticket when there is one) ----
  /** "message us on WhatsApp" inside a thread: the card, at the end. */
  const showWhatsApp = useCallback(() => {
    setItems((prev) => [...prev.filter((i) => i.kind !== "whatsapp"), { kind: "whatsapp", id: uid() }]);
  }, []);

  // Read from the thread (not the refs) so they're safe to use in render.
  const reqItem = items.find((i): i is Extract<ThreadItem, { kind: "requirements" }> => i.kind === "requirements");
  const confirmedRequirements = reqItem?.state === "confirmed" ? reqItem.req : null;
  const lastEventManager = [...items]
    .reverse()
    .find((i): i is Extract<ThreadItem, { kind: "event-manager" }> => i.kind === "event-manager");
  const hasPhoto = items.some((i) => i.kind === "me" && Boolean(i.photoUrl));

  /** The thread's opening question: its title, and the WhatsApp "Request". */
  const threadTitle = items.find((i): i is Extract<ThreadItem, { kind: "me" }> => i.kind === "me" && !i.photoUrl)?.text;

  /** The message WhatsApp opens with: the ticket's details, or the page and question. */
  const whatsAppLines = (): string[] => {
    if (typeof window === "undefined") return [];
    const page = `${window.location.host}${window.location.pathname}`.replace(/\/$/, "");
    const req = confirmedRequirements;
    const pkg = pageContext ? `${pageContext.packageName} by ${pageContext.vendorName}` : null;
    if (request) {
      const raised = new Date(request.createdAt);
      const day = raised.toDateString() === new Date().toDateString() ? "Today" : raised.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
      const status = request.resolved
        ? "Resolved"
        : request.callBack
          ? "Open · call back booked"
          : request.late
            ? "Open · flagged to the team lead"
            : request.offHours
              ? "Open · team offline until 9 AM"
              : "Open";
      return [
        "Hi Eventory, I’m continuing my request on WhatsApp.",
        `Ref: ${request.ticket}`,
        ...(threadTitle ? [`Request: “${threadTitle}”`] : []),
        ...(req ? [`Requirements: ${requirementsSummary(req)}`] : []),
        `Raised: ${day}, ${timeOf(raised)} · Status: ${status}`,
        ...(pkg ? [`Package: ${pkg}`] : []),
        `Page: ${page}`,
        ...(accountName ? [`Name: ${accountName}`] : []),
        "I’ll send any photos here.",
      ];
    }
    // Their own words, not the canned hand-off lines.
    const lastAsk = [...items]
      .reverse()
      .find(
        (i) =>
          i.kind === "me" &&
          !i.photoUrl &&
          !/^(I’d like to talk to an Event Manager|Send to an Event Manager|Find similar packages|Looks right|Updated my requirements)$/.test(i.text),
      );
    return [
      "Hi Eventory, I have a question about planning an event.",
      ...(pkg ? [`Looking at: ${pkg}`] : []),
      `Page: ${page}`,
      ...(accountName ? [`Name: ${accountName}`] : []),
      `My question: ${lastAsk?.kind === "me" ? lastAsk.text : "I’d like help choosing packages for my event."}`,
      ...(req ? [`My requirements: ${requirementsSummary(req)}`] : []),
      ...(hasPhoto ? ["I’ll attach my reference photo here."] : []),
    ];
  };

  /**
   * "Open WhatsApp" on a ticket: noted on it once and the team told, with
   * a line in the thread. Without a ticket nothing is logged — the
   * WhatsApp team raises one when they know what's needed.
   */
  const openWhatsApp = async () => {
    if (!request || request.whatsappAt) return;
    try {
      const r = await continueHelpOnWhatsApp(request.enquiryId);
      setRequest(r);
      setItems((prev) => [
        ...prev.filter((i) => i.kind !== "whatsapp"),
        {
          kind: "system",
          id: uid(),
          time: now(),
          at: new Date().toISOString(),
          text: `You continued on WhatsApp · ${r.ticket}. The Event Manager team has been notified and can see this chat.`,
        },
      ]);
    } catch {
      // WhatsApp still opened; the team just isn't told from here.
    }
  };

  // ---- Saved chats ("Your chats" tab) ----

  /** Resumes a saved chat: its thread, where the assistant was, and its request. */
  const applyConversation = useCallback(
    async (id: string, c: HelpConversation<ThreadItem, SavedState>) => {
      seen.current = new Set(
        c.items.filter((i) => i.kind === "event-manager").map((i) => i.id),
      );
      draft.current = c.state?.draft ?? null;
      const card = c.items.find((i): i is Extract<ThreadItem, { kind: "requirements" }> => i.kind === "requirements");
      reqCard.current = card
        ? { id: card.id, state: card.state, searched: c.items.some((i) => i.kind === "results") }
        : null;
      sharedPhoto.current = null;
      savedJson.current = "";
      setItems(c.items);
      setRequest(null);
      setConversationId(id);
      try {
        localStorage.setItem(CONVERSATION_KEY, id);
      } catch {
        // Storage blocked: this chat just won't reopen after a reload.
      }
      if (c.enquiryId) {
        try {
          sync(await getHelpRequest(c.enquiryId));
        } catch {
          // The request can't be read (signed out since?): the thread still shows.
        }
      }
    },
    [sync],
  );
  const openConversation = useCallback(
    async (id: string) =>
      applyConversation(id, await getHelpConversation<ThreadItem, SavedState>(id)),
    [applyConversation],
  );

  /** "New chat": an empty thread; the old one stays in the list. */
  const startNewConversation = useCallback(() => {
    setItems([]);
    setRequest(null);
    draft.current = null;
    reqCard.current = null;
    directEm.current = false;
    seen.current = new Set();
    sharedPhoto.current = null;
    savedJson.current = "";
    setConversationId(null);
    try {
      localStorage.removeItem(CONVERSATION_KEY);
    } catch {
      // Nothing stored.
    }
  }, []);

  // A reload or a new page resumes the open chat.
  useEffect(() => {
    let id: string | null = null;
    try {
      id = localStorage.getItem(CONVERSATION_KEY);
    } catch {
      return;
    }
    if (!id) return;
    const saved = id;
    getHelpConversation<ThreadItem, SavedState>(saved).then(
      (c) => applyConversation(saved, c),
      (e) => {
      // Gone, or not this person's: start fresh. Offline: keep it for next time.
        if (e instanceof ApiError && e.status === 404) {
          try {
            localStorage.removeItem(CONVERSATION_KEY);
          } catch {
            // Nothing stored.
          }
        }
      },
    );
    // Once, on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Saves the thread once it settles (not mid-reply), from the first message on.
  useEffect(() => {
    if (busy || !items.some((i) => i.kind === "me")) return;
    // A ticket was just raised: save straight away, so the chat is in
    // Your chats even if they close the page right after sending.
    const delay = request && !savedJson.current.includes(request.enquiryId) ? 0 : SAVE_DELAY_MS;
    const timer = window.setTimeout(() => {
      const body = {
        items: forSaving(items),
        state: { draft: draft.current },
        enquiryId: request?.enquiryId,
        ticket: request?.ticket,
      };
      const json = JSON.stringify(body);
      if (json === savedJson.current) return;
      let id = conversationId;
      if (!id) {
        id = uid();
        setConversationId(id);
        try {
          localStorage.setItem(CONVERSATION_KEY, id);
        } catch {
          // Storage blocked: saved, but won't reopen after a reload.
        }
      }
      savedJson.current = json;
      saveHelpConversation(id, body).catch(() => {
        // Try again on the next change.
        savedJson.current = "";
      });
    }, delay);
    return () => window.clearTimeout(timer);
  }, [items, busy, request, conversationId]);

  return {
    items,
    busy,
    ask,
    answerFollowUp,
    photo,
    findSimilar,
    sendPhotoToEventManager,
    close,
    openBrief,
    dismissBrief,
    hasOpenBrief,
    sendBrief,
    isAreaServed,
    /** Brief's area field: check it so the warning note can show (Figma 9.6). */
    checkArea: lookArea,
    notifyArea,
    pickClosestArea,
    /** The out-of-area form is open: the composer hides (Figma 9.1). */
    hasOpenAreaForm: items.some((i) => i.kind === "out-of-area" && i.state === "open"),
    /** Brief sent: the thread is the Event Manager chat. */
    withEventManager: Boolean(request),
    /** The sent request's ref, for the WhatsApp message (Figma 11.1). */
    ticket: request?.ticket,
    /** The sent request (ticket header, WhatsApp, call back). */
    request,
    /** The thread's opening question, for the ticket header. */
    threadTitle,
    /** Who replied last on the team's side, for the header. */
    eventManagerName: lastEventManager?.senderName,
    requestCallBack,
    showWhatsApp,
    whatsAppLines,
    openWhatsApp,
    /** Confirmed requirements, attached to the brief instead of its chips. */
    confirmedRequirements,
    startBookingTopic,
    startEventManagerChat,
    sendBookingCard,
    sendBookingRequest,
    bookingCallBack,
    bookingAction,
    markSorted,
    hasOpenBookingCard: items.some((i) => i.kind === "booking-request" && i.state === "open"),
    confirmRequirements,
    editRequirements,
    setRequirement,
    saveRequirements,
    cancelRequirementsEdit,
    conversationId,
    openConversation,
    startNewConversation,
  };
}
