"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  checkHelpArea,
  createHelpRequest,
  getHelpRequest,
  joinAreaWaitlist,
  requestHelpCallBack,
  sendHelpMessage,
  type HelpAreaCheck,
  type HelpRequestState,
} from "@/lib/customerHelpApi";
import type { HelpPageContext } from "../helpContext";
import {
  OCCASIONS as BRIEF_OCCASIONS,
  VENDOR_TYPES as BRIEF_VENDOR_TYPES,
  type HelpBrief,
} from "../components/HelpBriefCard";
import { answerQuestion, FALLBACK_ANSWER } from "./answers";
import { findPackages, type HelpPackageResult } from "./findPackages";
import {
  BUDGET_OPTIONS,
  GUEST_OPTIONS,
  OCCASION_OPTIONS,
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
type AskedField = Exclude<FollowUpField, "area">;

export type ThreadItem =
  | { kind: "me"; id: string; time: string; text: string; photoUrl?: string }
  | { kind: "assistant"; id: string; time: string; text: string }
  | {
      kind: "event-manager";
      id: string;
      time: string;
      text: string;
      senderName: string;
    }
  | { kind: "typing"; id: string }
  | {
      kind: "question";
      id: string;
      understood: string[];
      field: FollowUpField;
      options: string[];
      answered: boolean;
    }
  | {
      kind: "results";
      id: string;
      understood: string[];
      cards: HelpPackageResult[];
      seeAll?: { count: number; href: string };
      closed: boolean;
    }
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
      areaSource: "typed" | "location_tag";
      closest: { label: string; city: string }[];
      state: "open" | "saved" | "dismissed";
    }
  /** Guests asking for a call back type a number first. */
  | { kind: "call-back-form"; id: string; state: "open" | "sent" };

export type BriefDefaults = {
  initial: Partial<
    Pick<HelpBrief, "occasion" | "guests" | "budget" | "vendorType" | "date">
  >;
  locationArea: string;
  /** Reference photo shared earlier in the chat; travels inside the brief. */
  photo?: File;
  /** locationArea is the location tag's, not something they typed. */
  areaFromLocation: boolean;
};

const MAX_FOLLOW_UPS = 2;

const guestBucket = (n: number) =>
  n <= 25
    ? "Up to 25"
    : n <= 50
      ? "25–50"
      : n <= 100
        ? "50–100"
        : n <= 200
          ? "100–200"
          : "200+";
const budgetBucket = (n: number) =>
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

/** "Is 15 Nov available?" → "15 Nov", for the brief's date field. */
function dateFrom(text: string) {
  const m = text.match(
    /\b(\d{1,2})(?:st|nd|rd|th)?\s*(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\b/i,
  );
  return m
    ? `${Number(m[1])} ${m[2][0].toUpperCase()}${m[2].slice(1).toLowerCase()}`
    : undefined;
}
const QUESTION_TEXT: Record<AskedField, string> = {
  occasion: "Got it. What’s the occasion?",
  guests: "Got it. Roughly how many guests?",
  budget: "Got it. Roughly what’s your budget?",
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
  "Eventory is in Delhi NCR: most of Delhi, Gurugram, Noida, Greater Noida, Ghaziabad and Faridabad.";

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
const TALK_TO_PERSON =
  /\b(talk|speak|chat)\b.*\b(person|human|someone|somebody|event manager|agent|team)\b|\bcall me\b|\bcall back\b|\bcallback\b/i;

/** "9876543210" → "+91 98765 43210". */
const formatPhone = (phone: string) => {
  const d = phone.replace(/\D/g, "").slice(-10);
  return d.length === 10 ? `+91 ${d.slice(0, 5)} ${d.slice(5)}` : phone;
};

/**
 * "My brief: Birthday · 25–50 guests · ₹25–50K · Saket · 14 Dec" (Figma
 * 6.4); a call back ends "· Call me on +91 98765 43210" (Figma 7.4) so the
 * Event Manager knows which number to dial.
 */
const briefSummary = (b: HelpBrief) =>
  `My brief: ${[
    b.occasion,
    `${b.guests} guests`,
    b.budget,
    b.area,
    b.date,
    b.replyMode === "call-me" && b.phone && `Call me on ${formatPhone(b.phone)}`,
  ]
    .filter(Boolean)
    .join(" · ")}`;

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

function understoodTags(req: ParsedRequest) {
  return [
    req.occasion?.label,
    req.guests?.label,
    req.budget?.label,
    req.area &&
      `${req.area.label}${req.area.fromLocation ? " (your location)" : ""}`,
  ].filter((t): t is string => Boolean(t));
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
  /** Signed-in customer's number, so a call back needs no form. */
  accountPhone?: string;
  /** City from the site's location tag, used when the customer names no area. */
  locationCity: string | null;
};

export function useHelpConversation({
  pageContext,
  accountPhone,
  locationCity,
}: Options) {
  const [items, setItems] = useState<ThreadItem[]>([]);
  const [busy, setBusy] = useState(false);
  // Once the brief is sent the thread is the Event Manager chat.
  const [request, setRequest] = useState<HelpRequestState | null>(null);
  // The request being explored, plus how many follow-ups it has used.
  const draft = useRef<{
    req: ParsedRequest;
    followUps: number;
    /** What they typed, for the out-of-area lead. */
    text?: string;
    /** "Sector 15" — the cities to choose from (Figma 9.4). */
    areaChoices?: { label: string; city: string }[];
    /** An area we don't serve, so the brief can pre-fill it (Figma 9.6). */
    unservedArea?: string;
  } | null>(null);

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

  const push = useCallback(
    (item: ThreadItem) => setItems((prev) => [...prev, item]),
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

  const exploreNext = async () => {
    const d = draft.current;
    if (!d) return;
    const field = missingField(d.req);
    if (field && d.followUps < MAX_FOLLOW_UPS) {
      d.followUps += 1;
      await think();
      push({
        kind: "assistant",
        id: uid(),
        time: now(),
        text: QUESTION_TEXT[field],
      });
      push({
        kind: "question",
        id: uid(),
        understood: understoodTags(d.req),
        field,
        options: OPTIONS[field],
        answered: false,
      });
      return;
    }

    await think(400);
    const typingId = uid();
    push({ kind: "typing", id: typingId });
    const result = await findPackages(d.req);
    setItems((prev) => prev.filter((i) => i.id !== typingId));

    const text = !result.cards.length
      ? "I couldn’t find packages for that yet. An Event Manager can put something together for you."
      : !result.occasionMatched && d.req.occasion
        ? `I couldn’t find ${d.req.occasion.label.toLowerCase()} packages yet, so here are the closest.`
        : result.exact
          ? `Here ${result.cards.length === 1 ? "is 1 that fits" : `are ${result.cards.length} that fit`}.`
          : result.exactCount > 0
            ? `Here ${result.exactCount === 1 ? "is 1 that fits" : `are ${result.exactCount} that fit`}, plus a few close options.`
            : result.overBudget
              ? "Nothing fits that budget exactly, so here are the closest."
              : "Nothing matches all of that exactly, so here are the closest.";
    push({ kind: "assistant", id: uid(), time: now(), text });
    if (result.cards.length) {
      push({
        kind: "results",
        id: uid(),
        understood: understoodTags(d.req),
        cards: result.cards,
        seeAll: result.seeAll,
        closed: false,
      });
    } else {
      push({ kind: "feedback", id: uid(), closed: false });
    }
  };

  // Ids of thread messages already shown, so polling only adds new ones.
  const seen = useRef(new Set<string>());

  /** After the brief: messages go to the Event Manager team, not the assistant. */
  const messageEventManager = async (text: string) => {
    if (!request) return;
    push({ kind: "me", id: uid(), time: now(), text });
    try {
      const sent = await sendHelpMessage(request.enquiryId, text);
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
    { askOnly = false }: { askOnly?: boolean } = {},
  ) => {
    const d = draft.current;
    if (!d) return;
    const typed = areaPhrase(text);
    const where = typed ?? locationCity ?? undefined;
    if (!where) {
      await exploreNext();
      return;
    }
    const typingId = uid();
    push({ kind: "typing", id: typingId });
    const r = await lookArea(where);
    setItems((prev) => prev.filter((i) => i.id !== typingId));

    // Check unavailable: search as before rather than block the customer.
    if (!r) {
      d.req.area =
        parsed.area ??
        (!typed && locationCity ? { label: locationCity, city: locationCity, fromLocation: true } : undefined);
      await exploreNext();
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
    if (!r.serviceable) {
      d.unservedArea = r.label;
      const fromTag = !typed;
      push({
        kind: "assistant",
        id: uid(),
        time: now(),
        text: `${fromTag ? `Your location is set to ${r.label}. ` : ""}We don’t cover ${r.label} yet. ${NCR_COVERAGE}`,
      });
      push({
        kind: "out-of-area",
        id: uid(),
        area: r.label,
        areaSource: fromTag ? "location_tag" : "typed",
        closest: r.closest,
        state: "open",
      });
      return;
    }
    d.req.area = { label: r.label, city: r.city ?? r.label, fromLocation: !typed };
    if (askOnly) {
      push({
        kind: "assistant",
        id: uid(),
        time: now(),
        text: `Yes, we cover ${r.label}. Tell me the occasion, guest count and budget, and I’ll show packages there.`,
      });
      push({ kind: "feedback", id: uid(), closed: false });
      return;
    }
    await exploreNext();
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

  const ask = useCallback(
    async (text: string) => {
      if (!text || busy) return;
      if (request) {
        void messageEventManager(text);
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

        // "Do you serve Chandigarh?" — check the place they named.
        if (!parsed.occasion && areaPhrase(text) && /\b(serve|cover|available|deliver)/i.test(text)) {
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
          await exploreNext();
          return;
        }

        if (openQuestion && Object.keys(parsed).length) {
          openQuestion.req = { ...openQuestion.req, ...parsed };
          replace(
            (i) => i.kind === "question" && !i.answered,
            (i) => ({ ...i, answered: true }) as ThreadItem,
          );
          await exploreNext();
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
    [busy, items, request, pageContext, locationCity],
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

  // The latest reference photo; the brief picks it up (Figma 8.3).
  const sharedPhoto = useRef<File | null>(null);

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
      await think();
      push({
        kind: "assistant",
        id: uid(),
        time: now(),
        text: "Got your photo. What would you like to do with it?",
      });
      push({ kind: "photo-actions", id: uid(), closed: false });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [request],
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
        vendorType: briefVendorType(pageContext?.vendorType),
        date,
      },
      locationArea:
        req?.area?.label ??
        draft.current?.unservedArea ??
        (locationCity
          ? (areaCache.current.get(locationCity.trim().toLowerCase())?.label ?? locationCity)
          : ""),
      photo: sharedPhoto.current ?? undefined,
      areaFromLocation: req?.area
        ? Boolean(req.area.fromLocation)
        : !draft.current?.unservedArea && Boolean(locationCity),
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
    () => void startHandOff(), // eslint-disable-next-line react-hooks/exhaustive-deps
    [items, pageContext, locationCity],
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
      vendorType: brief.vendorType,
      area: brief.area || undefined,
      date: brief.date || undefined,
      replyMode: brief.replyMode,
      hasPhoto: Boolean(brief.photo),
      callTime: brief.callTime ?? undefined,
      phone: brief.phone ?? undefined,
      pageUrl: window.location.href,
      transcript,
    });
    const r = res.request;
    setItems((prev) => [
      ...prev.map((i) =>
        i.kind === "brief" && i.state === "open"
          ? { ...i, state: "sent" as const }
          : i,
      ),
      { kind: "me", id: uid(), time: timeOf(r.createdAt), text: briefSummary(brief) },
      {
        kind: "system",
        id: uid(),
        time: timeOf(r.createdAt),
        // "Call me" briefs are a call back request (Figma 7.4).
        text: r.callBack
          ? `Call back requested · ${r.callBack.ticket}`
          : `Sent to the Event Manager team · ${r.ticket}`,
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
  useEffect(() => {
    if (!enquiryId) return;
    let stopped = false;
    const poll = async () => {
      if (document.visibilityState !== "visible") return;
      try {
        const r = await getHelpRequest(enquiryId);
        if (!stopped) sync(r);
      } catch {
        // Offline or server down: the next tick tries again.
      }
    };
    const timer = window.setInterval(poll, POLL_MS);
    document.addEventListener("visibilitychange", poll);
    return () => {
      stopped = true;
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", poll);
    };
  }, [enquiryId, sync]);

  /** Figma 6.6: the card swaps to one confirmation with the promised time. */
  const confirmCallBack = async (phone: string) => {
    if (!request) return;
    const r = await requestHelpCallBack(request.enquiryId, phone);
    const cb = r.callBack;
    setRequest(r);
    if (!cb) return;
    setItems((prev) => [
      ...prev
        .filter((i) => i.kind !== "status")
        .map((i) =>
          i.kind === "call-back-form" ? { ...i, state: "sent" as const } : i,
        ),
      {
        kind: "system",
        id: uid(),
        time: now(),
        text: `Call back requested · ${cb.ticket}`,
      },
      {
        kind: "status",
        id: uid(),
        state: "call-back",
        callBackWhen: callPromise(cb),
      },
    ]);
  };

  /** Status card "Get a call back": straight away with an account number. */
  const callBack = useCallback(() => {
    if (!request || request.callBack) return;
    if (accountPhone) {
      void confirmCallBack(accountPhone);
      return;
    }
    if (items.some((i) => i.kind === "call-back-form" && i.state === "open"))
      return;
    push({
      kind: "assistant",
      id: uid(),
      time: now(),
      text: "Sure. Which number should the Event Manager call?",
    });
    push({ kind: "call-back-form", id: uid(), state: "open" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request, accountPhone, items]);

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
    callBack,
    confirmCallBack,
  };
}
