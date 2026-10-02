"use client";

import { useRef, useState } from "react";
import { Camera, Check, ChevronRight, Loader2, MessageCircle, Phone, TriangleAlert } from "lucide-react";
import { SUPPORT_CALL_LABEL, SUPPORT_CALL_NUMBER, SUPPORT_DEV_TOOLS, SUPPORT_ESCALATION_MS } from "../config";
import { TICKET_TYPES, categoryOf } from "../data/ticketTypes";
import { useNow, useTicket } from "../hooks/useSupport";
import { ticketService } from "../services/ticketService";
import type { Ticket, TicketAttachment, TicketMessage } from "../types";
import { formatClock, formatContextDate, formatCountdown } from "../utils/format";
import { whatsappLinkForTicket } from "../utils/whatsapp";
import { StatusPill, WhatsAppIcon } from "./ui";

function AttachmentThumbs({ attachments }: { attachments: TicketAttachment[] }) {
  if (attachments.length === 0) return null;
  return (
    <div className="mt-2.5 flex flex-wrap gap-2">
      {attachments.map((a) =>
        a.url && a.kind === "image" ? (
          // eslint-disable-next-line @next/next/no-img-element -- inline data: URL from the mock store
          <img key={a.id} src={a.url} alt={a.name} className="h-14 w-14 rounded-lg border border-[#E4E4E7] object-cover" />
        ) : (
          <span
            key={a.id}
            className="flex h-14 w-14 flex-col items-center justify-center rounded-lg border border-[#E4E4E7] bg-[#F4F4F5] text-[#71717B]"
            title={a.name}
          >
            <Camera className="h-4 w-4" />
            <span className="mt-0.5 text-[9px] font-bold uppercase">{a.kind}</span>
          </span>
        )
      )}
    </div>
  );
}

const windowLabel =
  SUPPORT_ESCALATION_MS >= 60000
    ? `${Math.round(SUPPORT_ESCALATION_MS / 60000)} minute${Math.round(SUPPORT_ESCALATION_MS / 60000) === 1 ? "" : "s"}`
    : `${Math.round(SUPPORT_ESCALATION_MS / 1000)} seconds`;

function StatusCard({ ticket, now }: { ticket: Ticket; now: number }) {
  const [busy, setBusy] = useState(false);

  if (ticket.status === "waiting_for_em") {
    const remaining = Date.parse(ticket.escalateAt) - now;
    const progress = Math.min(1, Math.max(0, 1 - remaining / SUPPORT_ESCALATION_MS));
    return (
      <div className="flex flex-col items-center gap-1.5 rounded-2xl border border-[#E4E4E7] bg-white px-4 py-5 text-center" data-testid="support-status-waiting">
        <span className="relative mb-1 h-14 w-14">
          <svg viewBox="0 0 36 36" className="h-14 w-14 -rotate-90">
            <circle cx="18" cy="18" r="15" fill="none" stroke="#F4F4F5" strokeWidth="3.5" />
            <circle
              cx="18"
              cy="18"
              r="15"
              fill="none"
              stroke="#F0596F"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeDasharray={`${progress * 94.25} 94.25`}
            />
          </svg>
        </span>
        <p className="font-figtree text-[16px] font-bold text-[#09090B]">Assigning your Event Manager</p>
        <p className="max-w-[320px] font-figtree text-[13px] leading-[18px] text-[#71717B]">
          This usually takes under {windowLabel}. If nobody picks it up by then, you&apos;ll get a number to call.
          You can close this — we&apos;ll keep it here.
        </p>
        <p className="mt-1 font-figtree text-[30px] font-extrabold tabular-nums text-[#09090B]" data-testid="support-countdown">
          {formatCountdown(remaining)}
        </p>
        <p className="font-figtree text-[12px] text-[#9F9FA9]">time remaining</p>
        {SUPPORT_DEV_TOOLS && ticketService.simulateAssign && (
          <button
            type="button"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              await ticketService.simulateAssign!(ticket.id);
              setBusy(false);
            }}
            className="mt-2 font-figtree text-[11.5px] text-[#71717B] underline"
          >
            Dev: simulate EM assign
          </button>
        )}
      </div>
    );
  }

  if (ticket.status === "escalated") {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-[#FFCAC5] bg-[#FFF2F1] px-4 py-5 text-center" data-testid="support-status-escalated">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#C81E0D]">
          <TriangleAlert className="h-6 w-6" />
        </span>
        <p className="font-figtree text-[16px] font-bold text-[#09090B]">We couldn&apos;t reach an EM in time</p>
        <p className="max-w-[320px] font-figtree text-[13px] leading-[18px] text-[#3F3F47]">
          Your ticket is filed and safe. Call us directly — this line is prioritised for open tickets.
        </p>
        <a
          href={`tel:${SUPPORT_CALL_NUMBER}`}
          data-testid="support-call"
          className="mt-1 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#C81E0D] font-figtree text-[15px] font-bold text-white"
        >
          <Phone className="h-4 w-4" />
          Call {SUPPORT_CALL_LABEL}
        </a>
        <button
          type="button"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            await ticketService.keepWaiting(ticket.id);
            setBusy(false);
          }}
          className="font-figtree text-[13px] font-semibold text-[#3F3F47] underline-offset-2 hover:underline"
        >
          Keep waiting instead
        </button>
        {SUPPORT_DEV_TOOLS && ticketService.simulateAssign && (
          <button
            type="button"
            onClick={() => ticketService.simulateAssign!(ticket.id)}
            className="font-figtree text-[11.5px] text-[#71717B] underline"
          >
            Dev: simulate EM assign
          </button>
        )}
      </div>
    );
  }

  if (ticket.assignee) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-[#E4E4E7] bg-white p-3.5" data-testid="support-status-assigned">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FDEEF0] font-figtree text-[13px] font-bold text-[#F0596F]">
          {ticket.assignee.initials}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-figtree text-[14.5px] font-bold text-[#09090B]">{ticket.assignee.name}</span>
          <span className="block font-figtree text-[12.5px] text-[#71717B]">{ticket.assignee.role} · handling your ticket</span>
        </span>
        <span className="rounded-full bg-[#F0FDF4] px-2.5 py-0.5 font-figtree text-[11.5px] font-bold text-[#008236]">On it</span>
      </div>
    );
  }

  return null;
}

function Message({ message }: { message: TicketMessage }) {
  if (message.author === "system") {
    return (
      <div className="flex justify-center">
        <span className="flex items-center gap-1.5 rounded-full border border-[#E4E4E7] bg-white px-3 py-1 text-center font-figtree text-[11.5px] text-[#71717B]">
          <Check className="h-3 w-3 shrink-0" />
          {message.text} · {formatClock(message.createdAt)}
        </span>
      </div>
    );
  }
  const mine = message.author === "customer";
  return (
    <div className={`flex gap-2 ${mine ? "flex-row-reverse" : ""}`}>
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-figtree text-[10.5px] font-bold ${
          mine ? "bg-[#F4F4F5] text-[#3F3F47]" : "bg-[#FDEEF0] text-[#F0596F]"
        }`}
      >
        {mine ? "You" : (message.authorName ?? "EM").split(" ").map((p) => p[0]).join("").slice(0, 2)}
      </span>
      <div className={`flex max-w-[78%] flex-col ${mine ? "items-end" : "items-start"}`}>
        {!mine && <span className="mb-1 font-figtree text-[11.5px] font-bold text-[#3F3F47]">{message.authorName}</span>}
        <div
          className={`rounded-2xl px-3.5 py-2.5 font-figtree text-[14px] leading-5 ${
            mine ? "rounded-tr-md bg-[#04222D] text-white" : "rounded-tl-md bg-[#F4F4F5] text-[#09090B]"
          }`}
        >
          {message.text}
          {message.attachments && <AttachmentThumbs attachments={message.attachments} />}
        </div>
        <span className="mt-1 font-figtree text-[11px] text-[#9F9FA9]">{formatClock(message.createdAt)}</span>
      </div>
    </div>
  );
}

export default function SupportTicketView({ ticketId }: { ticketId: string }) {
  const ticket = useTicket(ticketId);
  const now = useNow(ticket?.status === "waiting_for_em");
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  if (!ticket) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-[#F0596F]" />
      </div>
    );
  }

  const def = TICKET_TYPES[ticket.type];
  const category = categoryOf(ticket.type, ticket.category);
  const summaryFields = Object.entries(ticket.fields).filter(([, v]) => v);

  async function send(files?: File[]) {
    if (!ticket || (!draft.trim() && !files?.length)) return;
    setSending(true);
    await ticketService.postMessage(ticket.id, draft || "Attachment", files);
    setDraft("");
    setSending(false);
  }

  return (
    <div className="flex min-h-full flex-col">
      {/* Ticket strip */}
      <div className="-mx-5 -mt-5 mb-4 flex items-center justify-between gap-3 border-b border-[#E4E4E7] bg-[#FAFAFA] px-5 py-3 md:-mx-6 md:px-6">
        <div className="min-w-0">
          <p className="truncate font-figtree text-[13px] text-[#3F3F47]">
            {ticket.context.bookingId ? (
              <>
                <b className="text-[#09090B]">{ticket.context.bookingId}</b>
                {ticket.context.eventTitle ? ` · ${ticket.context.eventTitle}` : ""}
              </>
            ) : (
              <b className="text-[#09090B]">{def.label}</b>
            )}
          </p>
          <p className="font-figtree text-[11.5px] text-[#9F9FA9]" data-testid="support-ticket-id">
            {ticket.id} · {ticket.priority === "urgent" ? "Urgent" : ticket.priority === "high" ? "High priority" : "Normal priority"}
          </p>
        </div>
        <StatusPill status={ticket.status} />
      </div>

      <div className="flex flex-col gap-3.5">
        <StatusCard ticket={ticket} now={now} />

        <a
          href={whatsappLinkForTicket(ticket)}
          target="_blank"
          rel="noopener noreferrer"
          data-testid="support-whatsapp"
          className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#00AB82] font-figtree text-[15px] font-bold text-white transition-opacity hover:opacity-90"
        >
          <WhatsAppIcon className="h-5 w-5" />
          Continue on WhatsApp
        </a>
        <p className="-mt-1.5 text-center font-figtree text-[11.5px] text-[#9F9FA9]">
          Opens WhatsApp with your ticket ID and details already filled in
        </p>

        {/* Your report */}
        <div className="overflow-hidden rounded-2xl border border-[#E4E4E7] bg-white">
          <p className="flex items-center gap-1.5 border-b border-[#E4E4E7] bg-[#FAFAFA] px-3.5 py-2 font-figtree text-[11px] font-bold tracking-[0.08em] text-[#71717B] uppercase">
            {def.group === "grievance" ? <TriangleAlert className="h-3.5 w-3.5" /> : <MessageCircle className="h-3.5 w-3.5" />} Your{" "}
            {def.group === "grievance" ? "report" : "request"}
          </p>
          <div className="px-3.5 py-3">
            <p className="font-figtree text-[15px] font-bold text-[#09090B]">{ticket.subject}</p>
            <p className="font-figtree text-[12px] text-[#71717B]">
              {def.label}
              {def.categories.length > 1 ? ` › ${category.label}` : ""}
            </p>
            {ticket.description && <p className="mt-2 font-figtree text-[13.5px] leading-5 text-[#3F3F47]">{ticket.description}</p>}
            {summaryFields.length > 0 && (
              <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1">
                {summaryFields.map(([key, value]) => (
                  <div key={key} className="min-w-0">
                    <dt className="font-figtree text-[10.5px] font-bold tracking-wide text-[#9F9FA9] uppercase">
                      {(def.fields?.find((f) => f.id === key)?.label ?? key).replace(/^./, (c) => c.toUpperCase())}
                    </dt>
                    <dd className="truncate font-figtree text-[12.5px] text-[#3F3F47]">
                      {key === "eventDate" ? formatContextDate(value) : value}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
            <AttachmentThumbs attachments={ticket.attachments} />
            <p className="mt-2 font-figtree text-[11.5px] text-[#9F9FA9]">Raised {formatClock(ticket.createdAt)}</p>
          </div>
        </div>

        {/* Thread */}
        <div className="flex flex-col gap-3 py-1" data-testid="support-thread">
          {ticket.messages.map((message) => (
            <Message key={message.id} message={message} />
          ))}
        </div>
      </div>

      {/* Composer */}
      <div className="sticky bottom-0 -mx-5 mt-auto flex items-center gap-2 border-t border-[#E4E4E7] bg-white px-5 pt-3 pb-[max(12px,env(safe-area-inset-bottom))] md:-mx-6 md:px-6">
        <button
          type="button"
          aria-label="Attach photo or video"
          onClick={() => fileRef.current?.click()}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F4F4F5] text-[#3F3F47]"
        >
          <Camera className="h-4 w-4" />
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*,video/*"
          className="hidden"
          onChange={(e) => {
            const files = Array.from(e.target.files ?? []);
            e.target.value = "";
            if (files.length) void send(files);
          }}
        />
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") void send();
          }}
          placeholder="Write a message…"
          className="h-10 min-w-0 flex-1 rounded-full border border-[#E4E4E7] px-4 font-figtree text-[14px] outline-none focus:border-[#F0596F]"
        />
        <button
          type="button"
          aria-label="Send"
          disabled={sending || !draft.trim()}
          onClick={() => void send()}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F0596F] text-white disabled:opacity-50"
        >
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ChevronRight className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}
