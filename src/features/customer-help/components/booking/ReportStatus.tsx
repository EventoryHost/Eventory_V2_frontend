"use client";

import type { HelpRequestState } from "@/lib/customerHelpApi";
import { EVENTORY_TEL } from "../../assistant/eventDay";
import HelpButton from "../HelpButton";
import { Banner, Pill } from "./ui";

// v6f9 event-day report status (GRV): reported → Event Manager alerted →
// resolved, the 30-minute promise, and — once that passes with no reply —
// ways to reach someone now. After a reply, "It's sorted now"; the team
// closes it once they've checked with the vendor.
type Props = {
  request: HelpRequestState;
  /** The booking's Event Manager, or "the Event Manager team". */
  em: string;
  /** Whoever replied, for the reply step. */
  repliedBy?: string;
  onSorted: () => void;
  onCallBack: () => void;
  onWhatsApp: () => void;
};

const clock = (iso: string | number) =>
  new Date(iso).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true }).toUpperCase();

export default function ReportStatus({ request, em, repliedBy, onSorted, onCallBack, onWhatsApp }: Props) {
  const r = request.report;
  const replied = request.replied;
  const resolved = request.resolved;
  const sorted = Boolean(request.customerSortedAt);
  const by = clock(new Date(request.createdAt).getTime() + 30 * 60000);
  const firstReply = request.messages.find((m) => m.from === "event_manager");
  const steps = [
    { label: "Reported", sub: clock(request.createdAt), state: "done" },
    {
      label: `${em.split(" ")[0]} alerted`,
      sub: replied ? `Replied ${firstReply ? clock(firstReply.sentAt) : ""}` : request.late ? "No reply yet" : "Waiting for reply",
      state: replied ? "done" : "now",
    },
    { label: "Resolved", sub: resolved ? "Closed" : sorted ? "You confirmed" : "", state: resolved ? "fin" : replied ? "now" : "" },
  ];
  const fill = replied ? "66.8%" : "33.4%";

  return (
    <div className="flex flex-col gap-3 font-figtree">
      <div className="flex flex-col gap-3 rounded-[16px] border border-[#e4e4e7] p-4">
        <div className="flex items-start justify-between gap-2">
          <span className="text-[14px] leading-[20px] text-[#030303]">
            <b className="font-semibold">{r?.label ?? "Your report"}</b>
            <span className="block text-[#71717b]">
              {request.ticket} · reported {clock(request.createdAt)}
              {r?.urgent ? " · duty manager alerted" : ""}
            </span>
          </span>
          <Pill tone={resolved ? "confirmed" : "pending"}>{resolved ? "Resolved" : "Open"}</Pill>
        </div>
        <div className="relative grid grid-cols-3 pt-1">
          <span className="absolute left-[16.6%] right-[16.6%] top-[13px] h-0.5 bg-[#e4e4e7]" />
          <span className="absolute left-[16.6%] top-[13px] h-0.5 bg-[#030303]" style={{ width: fill }} />
          {steps.map((s) => (
            <div key={s.label} className="relative flex flex-col items-center gap-1.5 px-1 text-center text-[12px] leading-[18px] text-[#030303]">
              <span
                className={`z-[1] flex size-5 items-center justify-center rounded-full border-2 ${
                  s.state === "done"
                    ? "border-[#030303] bg-[#030303]"
                    : s.state === "fin"
                      ? "border-[#008236] bg-[#008236]"
                      : s.state === "now"
                        ? "border-[#bb4d00] bg-white shadow-[0_0_0_4px_#fffbeb]"
                        : "border-[#e4e4e7] bg-white"
                }`}
              >
                {(s.state === "done" || s.state === "fin") && (
                  <svg viewBox="0 0 24 24" className="size-3" aria-hidden>
                    <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              {s.label}
              <span className="text-[#71717b]">{s.sub}</span>
            </div>
          ))}
        </div>
      </div>

      {r?.issue === "safety" && !resolved && (
        <Banner tone="warn" icon="/images/customer/help/info-warning.svg">
          <b className="font-semibold">If anyone is hurt or in danger, call 112.</b>
        </Banner>
      )}

      {!replied && !request.late && !resolved && (
        <div role="status" className="flex items-start gap-2.5 rounded-[12px] border border-[#e4e4e7] bg-[#fafafa] px-3.5 py-3 text-[14px] leading-[20px] text-[#3f3f47]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/customer/help/clock-circle.svg" alt="" width={18} height={18} className="mt-0.5 block" />
          <span>
            <b className="font-semibold text-[#030303]">Your report is open.</b>{" "}
            {r?.issue === "behav"
              ? `${em} will call you. They usually call within 30 minutes, so by about ${by}.`
              : `${em} has it and usually replies within 30 minutes, so by about ${by}. Their reply will show here.`}
          </span>
        </div>
      )}

      {!replied && request.late && !resolved && (
        <div role="status" className="flex flex-col gap-2.5 rounded-[12px] border border-[#fee685] bg-[#fffbeb] p-3.5">
          <b className="font-semibold text-[#030303]">{em} hasn’t replied yet</b>
          <span className="text-[14px] leading-[20px] text-[#3f3f47]">
            Your report is still open and saved here. Call us now, ask us to call you, or WhatsApp the Eventory team.
          </span>
          {request.callBack && (
            <span className="text-[12px] leading-[18px] text-[#3f3f47]">Call back requested · {request.callBack.ticket}</span>
          )}
          <div className="flex flex-wrap gap-2">
            <a href={EVENTORY_TEL} className="flex items-center rounded-full bg-[#f0596f] px-5 py-[7px] text-[14px] leading-[20px] text-white">
              Call {em.split(" ")[0]}
            </a>
            {!request.callBack && (
              <HelpButton variant="secondary" onClick={onCallBack}>
                Get a call back
              </HelpButton>
            )}
            <HelpButton variant="tertiary" onClick={onWhatsApp}>
              WhatsApp us
            </HelpButton>
          </div>
        </div>
      )}

      {replied && !resolved && !sorted && (
        <HelpButton variant="secondary" className="self-start" onClick={onSorted}>
          It’s sorted now
        </HelpButton>
      )}
      {sorted && !resolved && (
        <p className="text-center text-[12px] leading-[18px] text-[#71717b]">
          {repliedBy ?? em} closes this once they’ve checked with the vendor.
        </p>
      )}
    </div>
  );
}
