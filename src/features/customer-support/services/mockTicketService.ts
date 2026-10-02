import { SUPPORT_ESCALATION_MS } from "../config";
import { TICKET_TYPES, categoryOf } from "../data/ticketTypes";
import type { CreateTicketInput, Ticket, TicketAttachment, TicketMessage } from "../types";
import type { TicketService } from "./ticketService";

/**
 * localStorage-backed stand-in for the EMS ticket API, for the prototype.
 *
 * Simulates the real lifecycle: a new ticket waits for an EM; if nobody is
 * assigned within SUPPORT_ESCALATION_MS (5 min, shortened for demos) it
 * flips to "escalated" and the UI offers a call. simulateAssign() is the
 * dev-only "an EM picked it up" hook.
 */

const STORAGE_KEY = "eventory_support_tickets";
const LATENCY_MS = 350;
/** Keep data: URLs small so a handful of photos can't blow the 5 MB localStorage quota. */
const MAX_INLINE_ATTACHMENT_BYTES = 400 * 1024;

const DEMO_EM = { name: "Anita Desai", role: "Event Manager", initials: "AD" };

function wait<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), LATENCY_MS));
}

function uid(prefix = "") {
  return `${prefix}${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-3)}`;
}

function readAll(): Ticket[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Ticket[]) : [];
  } catch {
    return [];
  }
}

function writeAll(tickets: Ticket[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
  } catch {
    // Quota exceeded — drop inline attachment payloads and retry once.
    const slim = tickets.map((t) => ({
      ...t,
      attachments: t.attachments.map((a) => ({ ...a, url: undefined })),
    }));
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(slim));
    } catch {
      // Give up silently: the prototype keeps working in memory for this page.
    }
  }
}

/** Applies the clock: an unassigned ticket past its window becomes escalated. */
function withClock(ticket: Ticket, now = Date.now()): Ticket {
  if (ticket.status === "waiting_for_em" && now >= Date.parse(ticket.escalateAt)) {
    return {
      ...ticket,
      status: "escalated",
      updatedAt: ticket.escalateAt,
      messages: [
        ...ticket.messages,
        {
          id: uid("m_"),
          author: "system",
          text: "No Event Manager was free in time. You can call us directly — this line is prioritised.",
          createdAt: ticket.escalateAt,
        },
      ],
    };
  }
  return ticket;
}

function readTicked(): Ticket[] {
  const all = readAll();
  let changed = false;
  const next = all.map((t) => {
    const ticked = withClock(t);
    if (ticked !== t) changed = true;
    return ticked;
  });
  if (changed) writeAll(next);
  return next;
}

function fileKind(file: File): TicketAttachment["kind"] {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("video/")) return "video";
  return "file";
}

function readAsDataUrl(file: File): Promise<string | undefined> {
  if (file.size > MAX_INLINE_ATTACHMENT_BYTES || typeof FileReader === "undefined") return Promise.resolve(undefined);
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : undefined);
    reader.onerror = () => resolve(undefined);
    reader.readAsDataURL(file);
  });
}

async function toAttachment(file: File): Promise<TicketAttachment> {
  return { id: uid("a_"), name: file.name, kind: fileKind(file), size: file.size, url: await readAsDataUrl(file) };
}

function subjectFor(input: CreateTicketInput) {
  const def = TICKET_TYPES[input.type];
  const category = categoryOf(input.type, input.category);
  return input.topic || (def.categories.length > 1 ? category.label : def.label);
}

export function createMockTicketService(): TicketService {
  const listeners = new Map<string, Set<(ticket: Ticket) => void>>();
  let timer: ReturnType<typeof setInterval> | null = null;
  const lastSeen = new Map<string, string>();

  function emit(ticket: Ticket) {
    lastSeen.set(ticket.id, `${ticket.status}|${ticket.updatedAt}|${ticket.messages.length}`);
    listeners.get(ticket.id)?.forEach((fn) => fn(ticket));
    listeners.get("*")?.forEach((fn) => fn(ticket));
  }

  function tick() {
    for (const ticket of readTicked()) {
      const sig = `${ticket.status}|${ticket.updatedAt}|${ticket.messages.length}`;
      if (lastSeen.get(ticket.id) !== sig) emit(ticket);
    }
  }

  function ensureTimer() {
    if (timer || typeof window === "undefined") return;
    timer = setInterval(tick, 1000);
    // Another tab (or the account page) changed a ticket.
    window.addEventListener("storage", (event) => {
      if (event.key === STORAGE_KEY) tick();
    });
  }

  function update(id: string, change: (t: Ticket) => Ticket): Ticket {
    const all = readTicked();
    const index = all.findIndex((t) => t.id === id);
    if (index === -1) throw new Error("Ticket not found");
    const next = change(all[index]);
    all[index] = next;
    writeAll(all);
    emit(next);
    return next;
  }

  return {
    async createTicket(input) {
      const def = TICKET_TYPES[input.type];
      const category = categoryOf(input.type, input.category);
      const attachments = await Promise.all((input.attachments ?? []).map(toAttachment));
      const now = new Date();
      const all = readTicked();
      // Unique across types: next number after the highest one already issued.
      const highest = all.reduce((max, t) => Math.max(max, Number(t.id.split("-")[1]) || 0), 2000);
      const number = highest + 1 + Math.floor(Math.random() * 5);
      const ticket: Ticket = {
        id: `${def.idPrefix}-${number}`,
        type: input.type,
        category: category.id,
        topic: input.topic,
        subject: subjectFor(input),
        description: input.description.trim(),
        priority: category.priority ?? def.priority,
        status: "waiting_for_em",
        fields: input.fields ?? {},
        rating: input.rating,
        context: input.context,
        attachments,
        messages: [
          {
            id: uid("m_"),
            author: "system",
            text: `Ticket raised · routed to ${def.routedTo}`,
            createdAt: now.toISOString(),
          },
        ],
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        escalateAt: new Date(now.getTime() + SUPPORT_ESCALATION_MS).toISOString(),
      };
      writeAll([ticket, ...all]);
      ensureTimer();
      emit(ticket);
      return wait(ticket);
    },

    async listMyTickets() {
      ensureTimer();
      return wait(readTicked().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)));
    },

    async getTicket(id) {
      ensureTimer();
      return wait(readTicked().find((t) => t.id === id) ?? null);
    },

    async postMessage(id, text, files) {
      const attachments = await Promise.all((files ?? []).map(toAttachment));
      const message: TicketMessage = {
        id: uid("m_"),
        author: "customer",
        text: text.trim(),
        attachments: attachments.length ? attachments : undefined,
        createdAt: new Date().toISOString(),
      };
      const next = update(id, (t) => ({
        ...t,
        messages: [...t.messages, message],
        updatedAt: message.createdAt,
      }));
      return wait(next);
    },

    async addAttachment(id, file) {
      const attachment = await toAttachment(file);
      update(id, (t) => ({ ...t, attachments: [...t.attachments, attachment], updatedAt: new Date().toISOString() }));
      return wait(attachment);
    },

    async keepWaiting(id) {
      const now = new Date();
      const next = update(id, (t) => ({
        ...t,
        status: "waiting_for_em",
        updatedAt: now.toISOString(),
        escalateAt: new Date(now.getTime() + SUPPORT_ESCALATION_MS).toISOString(),
        messages: [
          ...t.messages,
          { id: uid("m_"), author: "system", text: "Still looking for a free Event Manager…", createdAt: now.toISOString() },
        ],
      }));
      return wait(next);
    },

    subscribe(id, onChange) {
      ensureTimer();
      if (!listeners.has(id)) listeners.set(id, new Set());
      listeners.get(id)!.add(onChange);
      return () => {
        listeners.get(id)?.delete(onChange);
      };
    },

    async simulateAssign(id) {
      const now = new Date();
      const later = new Date(now.getTime() + 1000);
      const next = update(id, (t) => ({
        ...t,
        status: "assigned",
        assignee: DEMO_EM,
        updatedAt: later.toISOString(),
        messages: [
          ...t.messages,
          {
            id: uid("m_"),
            author: "system",
            text: `${DEMO_EM.name} was assigned to your ticket`,
            createdAt: now.toISOString(),
          },
          {
            id: uid("m_"),
            author: "em",
            authorName: DEMO_EM.name,
            text:
              t.type === "event_day_issue"
                ? "Hi! I've got your report and I'm reaching out to the vendor right now. I'll update you within a few minutes."
                : "Hi! I'm Anita, your Event Manager. I've read your message and the details you shared — give me a couple of minutes.",
            createdAt: later.toISOString(),
          },
        ],
      }));
      return wait(next);
    },
  };
}
