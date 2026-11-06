"use client";

import { useState } from "react";
import type { BookingRequestKind } from "../../assistant/bookingAnswers";
import { emFirst } from "../../assistant/bookingAnswers";
import HelpButton from "../HelpButton";
import HelpChip from "../HelpChip";
import HelpTextField from "../HelpTextField";

// v6f9 booking hand-off card: "Send this to {EM}, your Event Manager". The
// Event Manager sees the booking and the chat, so the customer only adds
// what's new — their message (and, for an invoice, the GST details).
type Props = {
  request: BookingRequestKind;
  quote: string;
  emName: string | null;
  eventLine: string;
  packages: string[];
  /** Event-day changes: which package's vendor it goes to. */
  packageChoices?: { reference: string; name: string }[];
  onSend: (input: { text: string; details?: string[]; packageRef?: string }) => Promise<void>;
};

const PLACEHOLDER: Record<BookingRequestKind, string> = {
  message: "What do you need?",
  vendor: "What would you like to ask?",
  "payment-issue": "Which payment, and how much was taken? (optional)",
  "payment-link": "Who’s paying, and how much? (optional)",
  invoice: "Anything else for the invoice? (optional)",
  "lmc-addon": "Which add-on, and how many?",
  "lmc-area": "Which area, and what should it look like?",
};
const OPTIONAL: BookingRequestKind[] = ["payment-issue", "payment-link", "invoice"];
const GSTIN = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][0-9A-Z]Z[0-9A-Z]$/i;

const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

export default function BookingRequestCard({ request, quote, emName, eventLine, packages, packageChoices, onSend }: Props) {
  const [text, setText] = useState("");
  const isLmc = request === "lmc-addon" || request === "lmc-area";
  const [pkgRef, setPkgRef] = useState(packageChoices?.length === 1 ? packageChoices[0].reference : "");
  const [business, setBusiness] = useState("");
  const [gstin, setGstin] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const first = emFirst(emName);
  const who = first ? `${first}, your Event Manager` : "the Event Manager team";
  const isInvoice = request === "invoice";
  const ready =
    !sending &&
    (OPTIONAL.includes(request) || text.trim().length > 0) &&
    (!isInvoice || (business.trim().length > 0 && GSTIN.test(gstin.trim()))) &&
    (!isLmc || Boolean(pkgRef));

  const send = async () => {
    if (!ready) return;
    setSending(true);
    setError(null);
    const details = isInvoice ? [`Business name: ${business.trim()}`, `GSTIN: ${gstin.trim().toUpperCase()}`] : [];
    try {
      await onSend({ text: text.trim() || quote, details, packageRef: isLmc ? pkgRef : undefined });
    } catch {
      setError("We couldn’t send that. Check your connection and try again.");
      setSending(false);
    }
  };

  return (
    <div className="flex w-full flex-col overflow-hidden rounded-[16px] border border-[#e4e4e7] bg-white font-figtree">
      <div className="flex items-start gap-3 border-b border-[#e4e4e7] bg-[#fafafa] px-4 py-3.5">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#04222d] text-[14px] font-semibold text-[#fafafa]">
          {emName ? (
            initials(emName)
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src="/images/customer/help/user-rounded.svg" alt="" width={18} height={18} className="block" />
          )}
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <p className="text-[14px] font-semibold leading-[20px] text-[#030303]">Send this to {who}</p>
          <p className="text-[12px] leading-[18px] text-[#71717b]">
            They see your booking and this chat, so you won’t need to repeat yourself.
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-3 p-4">
        <div className="rounded-[12px] bg-[#fafafa] px-3 py-2.5 text-[14px] leading-[20px] text-[#3f3f47]">“{quote}”</div>
        <div className="flex flex-wrap gap-1.5">
          {[eventLine, ...packages].map((c) => (
            <span
              key={c}
              className="max-w-full truncate rounded-full border border-[#e4e4e7] bg-white px-2.5 py-1 text-[12px] leading-[18px] text-[#3f3f47]"
            >
              {c}
            </span>
          ))}
          <span className="rounded-full border border-[#e4e4e7] bg-white px-2.5 py-1 text-[12px] leading-[18px] text-[#3f3f47]">
            Chat so far
          </span>
        </div>
        {isLmc && packageChoices && packageChoices.length > 1 && (
          <div className="flex flex-col gap-1.5">
            <p className="text-[14px] leading-[20px] text-[#3f3f47]">Which package?</p>
            <div className="flex flex-wrap gap-1.5">
              {packageChoices.map((p) => (
                <HelpChip key={p.reference} label={p.name} selected={pkgRef === p.reference} onClick={() => setPkgRef(p.reference)} />
              ))}
            </div>
          </div>
        )}
        {isInvoice && (
          <>
            <HelpTextField
              placeholder="Business name, as on your GST certificate"
              value={business}
              onChange={(e) => setBusiness(e.target.value)}
              leftIcon={null}
              aria-label="Business name"
            />
            <HelpTextField
              placeholder="15-character GSTIN"
              value={gstin}
              maxLength={15}
              onChange={(e) => setGstin(e.target.value.toUpperCase())}
              error={gstin.length === 15 && !GSTIN.test(gstin) ? "That doesn’t look like a GSTIN." : undefined}
              leftIcon={null}
              aria-label="GSTIN"
            />
          </>
        )}
        <textarea
          value={text}
          maxLength={1000}
          onChange={(e) => setText(e.target.value)}
          placeholder={PLACEHOLDER[request]}
          aria-label="Your message"
          className="min-h-[72px] w-full resize-y rounded-[8px] border border-[#e4e4e7] px-3.5 py-3 text-[14px] leading-[20px] text-[#030303] outline-none placeholder:text-[#9f9fa9] focus:border-[#030303]"
        />
        {error && (
          <p role="alert" className="text-[12px] leading-[18px] text-[#c81e0d]">
            {error}
          </p>
        )}
        <HelpButton size="md" className="w-full disabled:opacity-45" disabled={!ready} onClick={() => void send()}>
          {sending ? "Sending…" : `Send to ${first ?? "the Event Manager team"}`}
        </HelpButton>
      </div>
    </div>
  );
}
