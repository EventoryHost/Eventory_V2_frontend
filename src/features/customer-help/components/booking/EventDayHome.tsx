"use client";

import { useState } from "react";
import type { HelpConversationSummary } from "@/lib/customerHelpApi";
import { emFull, emLabel } from "../../assistant/bookingAnswers";
import { EVENTORY_PHONE, vendorStatus } from "../../assistant/eventDay";
import type { HelpBookingContext } from "../../helpContext";
import type { BookingHelpData } from "../../hooks/useBookingHelpData";
import HelpButton from "../HelpButton";
import { HelpTicketCard } from "../HelpChats";
import { Chevron, SectionHead } from "./ui";

// v6f9 "Help for today" — the booking page on the event day: reporting a
// problem comes first, then talking to the Event Manager and the vendors'
// on-ground contacts. Opening a vendor's number tells the Event Manager.
type Props = {
  ctx: HelpBookingContext;
  data: BookingHelpData | null;
  /** This event's open problem reports (GRV tickets). */
  openReports: HelpConversationSummary[];
  onReport: () => void;
  onOpenReport: (conversationId: string) => void;
  onMessageEventManager: () => void;
  /** They opened a vendor's number: the Event Manager is told. */
  onVendorContact: (reference: string) => Promise<void>;
  onOtherHelp: () => void;
};

const now = () => new Date().toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true }).toUpperCase();

function Reveal({ number, children }: { number: string; children?: React.ReactNode }) {
  const [copied, setCopied] = useState(false);
  const tel = `tel:${number.replace(/\s/g, "")}`;
  return (
    <div className="flex flex-col gap-2.5 rounded-[12px] bg-[#fafafa] p-3">
      <span className="text-[20px] font-semibold leading-[28px] tracking-[0.3px] text-[#030303] tabular-nums">{number}</span>
      <div className="flex flex-wrap gap-2">
        <a href={tel} className="flex items-center rounded-full bg-[#f0596f] px-5 py-[7px] text-[14px] leading-[20px] text-white">
          Call
        </a>
        <HelpButton
          variant="secondary"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(number);
              setCopied(true);
            } catch {
              // Clipboard blocked: the number is on screen.
            }
          }}
        >
          {copied ? "Copied" : "Copy"}
        </HelpButton>
        {children}
      </div>
    </div>
  );
}

export default function EventDayHome({ ctx, data, openReports, onReport, onOpenReport, onMessageEventManager, onVendorContact, onOtherHelp }: Props) {
  const [emOpen, setEmOpen] = useState(false);
  const [vendorsOpen, setVendorsOpen] = useState(false);
  const [revealed, setRevealed] = useState<Record<string, string>>({});
  const em = emLabel(data?.emName ?? null);
  const active = (data?.packages ?? []).filter((p) => !p.cancelled);

  return (
    <div className="flex w-full flex-col gap-5 px-4 pb-6 pt-4 font-figtree">
      <section className="flex flex-col gap-3 rounded-[16px] bg-[#fafafa] px-4 py-5">
        <span className="self-start rounded-full border border-[#e4e4e7] bg-white px-2.5 py-1 text-[12px] leading-[18px] text-[#3f3f47]">
          Today · {ctx.eventTitle}
          {ctx.startTime ? ` · ${ctx.startTime}` : ""}
        </span>
        <h3 className="text-[20px] font-semibold leading-[28px] text-[#030303]">Your event is today</h3>
        <p className="text-[14px] leading-[20px] text-[#71717b]">
          {data?.emName ? `${data.emName} is` : "The Event Manager team is"} on duty for your event, from setup until the end.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <SectionHead>Report a problem</SectionHead>
        {openReports.map((c) => (
          <HelpTicketCard key={c.conversationId} chat={c} onOpen={() => onOpenReport(c.conversationId)} />
        ))}
        <button
          type="button"
          onClick={onReport}
          className="flex w-full items-center gap-3.5 rounded-[16px] border border-[#e4e4e7] bg-white p-4 text-left shadow-[0_8px_16px_rgba(3,3,3,0.05),0_1px_4px_rgba(3,3,3,0.05)]"
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#fdeef0]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/customer/help/chat-round-line.svg" alt="" width={20} height={20} className="block" />
          </span>
          <span className="flex flex-1 flex-col">
            <b className="text-[16px] font-semibold leading-[24px] text-[#030303]">
              {openReports.length ? "Is something else not right?" : "Is something not right at your event?"}
            </b>
            <span className="text-[14px] leading-[20px] text-[#71717b]">
              Pick the package and tell us what’s happening. {em} usually replies within 30 minutes.
            </span>
          </span>
          <Chevron />
        </button>
      </section>

      <section className="flex flex-col gap-2">
        <SectionHead>Just want to talk?</SectionHead>
        <div className="overflow-hidden rounded-[12px] border border-[#e4e4e7]">
          <button
            type="button"
            aria-expanded={emOpen}
            onClick={() => setEmOpen((v) => !v)}
            className="flex w-full items-center gap-4 bg-white p-3 text-left"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#04222d]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/customer/help/user-rounded.svg" alt="" width={18} height={18} className="block" />
            </span>
            <span className="flex flex-1 flex-col text-[14px] leading-[20px] text-[#030303]">
              Call or message {em}
              <span className="text-[12px] leading-[18px] text-[#71717b]">
                {data?.emName ? "Your Event Manager · on duty today" : "On duty today"}
              </span>
            </span>
            <span className={`transition-transform ${emOpen ? "rotate-90" : ""}`}>
              <Chevron />
            </span>
          </button>
          {emOpen && (
            <div className="px-3 pb-3">
              <Reveal number={EVENTORY_PHONE}>
                <HelpButton variant="tertiary" onClick={onMessageEventManager}>
                  Message
                </HelpButton>
              </Reveal>
            </div>
          )}
        </div>

        <div className="overflow-hidden rounded-[12px] border border-[#e4e4e7]">
          <button
            type="button"
            aria-expanded={vendorsOpen}
            onClick={() => setVendorsOpen((v) => !v)}
            className="flex w-full items-center gap-4 bg-white p-3 text-left"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#fdeef0]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/customer/help/users-group.svg" alt="" width={20} height={20} className="block" />
            </span>
            <span className="flex min-w-0 flex-1 flex-col text-[14px] leading-[20px] text-[#030303]">
              Vendor contacts for today
              <span className="truncate text-[12px] leading-[18px] text-[#71717b]">
                {active.map((p) => p.vendorName ?? p.name).join(", ") || "Loading…"}
              </span>
            </span>
            <span className={`transition-transform ${vendorsOpen ? "rotate-90" : ""}`}>
              <Chevron />
            </span>
          </button>
          {vendorsOpen && (
            <div className="flex flex-col px-3 pb-3">
              {active.map((p, i) => {
                const st = vendorStatus(p, ctx);
                const staff = p.booking.groundStaff;
                const at = revealed[p.reference];
                return (
                  <div key={p.reference} className={`flex flex-col gap-2 py-2.5 ${i ? "border-t border-[#e4e4e7]" : ""}`}>
                    <div className="flex items-center gap-2.5">
                      <span className="flex min-w-0 flex-1 flex-col text-[14px] leading-[20px] text-[#030303]">
                        {p.vendorName ?? p.name}
                        <span className="text-[12px] leading-[18px] text-[#71717b]">
                          {staff ? `${staff.name}, on-ground contact` : "No on-ground contact shared yet"}
                        </span>
                        <span className="flex items-center gap-2 text-[12px] leading-[18px] text-[#71717b]">
                          <span className={`size-2 shrink-0 rounded-full ${st.arrived ? "bg-[#008236]" : "bg-[#9f9fa9]"}`} />
                          {st.text}
                        </span>
                      </span>
                      {staff && !at && (
                        <HelpButton
                          variant="secondary"
                          onClick={async () => {
                            setRevealed((r) => ({ ...r, [p.reference]: now() }));
                            await onVendorContact(p.reference).catch(() => undefined);
                          }}
                        >
                          Call
                        </HelpButton>
                      )}
                    </div>
                    {staff && at && (
                      <Reveal number={staff.phone}>
                        <p className="mt-1 w-full text-[12px] leading-[18px] text-[#3f3f47]">
                          {emFull(data?.emName ?? null)} was told at {at} that you’re in touch with {p.vendorName ?? "the vendor"}, so they can
                          step in.
                        </p>
                      </Reveal>
                    )}
                    {!staff && (
                      <p className="text-[12px] leading-[18px] text-[#71717b]">{em} can reach them for you.</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <button type="button" onClick={onOtherHelp} className="self-start text-[14px] leading-[20px] text-[#71717b] underline underline-offset-[3px]">
        Other help: payments and last-minute changes
      </button>
    </div>
  );
}
