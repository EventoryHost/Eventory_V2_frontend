"use client";

import type { BookingHelpPackage } from "../../hooks/useBookingHelpData";
import HelpButton from "../HelpButton";
import { Pill } from "./ui";

// v6f9 "Customisation status": every package at once, each with its own
// tracker — request sent → vendor's proposal → confirmed. The booking stays
// confirmed either way; customisation runs alongside it.
type Props = {
  packages: BookingHelpPackage[];
  awaitingReview: string[];
  onReview: (reference: string) => void;
};

const day = (iso?: string | null) => (iso ? new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "");

export default function BookingCustomisation({ packages, awaitingReview, onReview }: Props) {
  const active = packages.filter((p) => !p.cancelled);
  return (
    <div className="flex w-full flex-col gap-4 px-4 pb-6 pt-4 font-figtree">
      <p className="text-[14px] leading-[20px] text-[#71717b]">
        Your booking stays confirmed either way. Customisation requests run alongside it.
      </p>
      {active.map((p) => {
        const reqs = p.booking.customizeRequests ?? [];
        const sentAt = reqs.map((r) => r.requestedAt).filter((d): d is string => Boolean(d)).sort()[0] ?? p.booking.createdAt;
        const pending = reqs.some((r) => !r.status || r.status === "Pending");
        const answeredAt = reqs.map((r) => r.respondedAt).filter((d): d is string => Boolean(d)).sort().pop();
        const waiting = awaitingReview.includes(p.reference);
        const accepted = p.booking.proposalResponse?.status === "Accepted" && !pending && !waiting;
        const steps: { label: string; sub: string; state: "done" | "now" | "fin" | "" }[] = !reqs.length
          ? []
          : [
              { label: "Request sent", sub: day(sentAt), state: "done" },
              {
                label: waiting ? "Revised proposal" : "Vendor proposal",
                sub: pending ? "With the vendor" : waiting ? "Waiting for you" : day(answeredAt),
                state: pending || waiting ? "now" : "done",
              },
              { label: "Confirmed", sub: accepted ? day(p.booking.proposalResponse?.respondedAt) : "", state: accepted ? "fin" : "" },
            ];
        const fill = !steps.length ? "0" : accepted ? "66.8%" : pending || waiting ? "33.4%" : "66.8%";
        return (
          <div key={p.reference} className="flex flex-col gap-3 rounded-[16px] border border-[#e4e4e7] p-4">
            <p className="text-[14px] leading-[20px] text-[#030303]">
              <b className="font-semibold">{p.vendorName ?? p.name}</b>
              <span className="block text-[#71717b]">{p.name}</span>
            </p>
            {!steps.length ? (
              <p className="text-[12px] leading-[18px] text-[#71717b]">No changes requested. It’s as on the package.</p>
            ) : (
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
            )}
            {waiting ? (
              <HelpButton className="self-start" onClick={() => onReview(p.reference)}>
                Review on your booking page
              </HelpButton>
            ) : accepted ? (
              <span className="self-start">
                <Pill tone="confirmed">Customisation confirmed</Pill>
              </span>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
