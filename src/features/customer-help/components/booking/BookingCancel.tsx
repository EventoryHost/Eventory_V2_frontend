"use client";

import Link from "next/link";
import { useState } from "react";
import { formatPrice } from "@/features/customer-package-detail/utils/formatPrice";
import type { RawBookingRefund } from "@/lib/customerBookingApi";
import { emFull, emLabel } from "../../assistant/bookingAnswers";
import type { BookingHelpPackage } from "../../hooks/useBookingHelpData";
import HelpButton from "../HelpButton";
import { Banner, PackagePick, Pill, SmallHead, Statement } from "./ui";

// v6f9 "Cancel package(s)": choose (step 1 of 2) → review what comes back
// (step 2) → done, with the refund's progress and a way to replace the
// vendor. Charges follow each package's own cancellation template:
// Flexible / Standard / Strict, or the vendor's own policy, where the team
// confirms the refund. Nothing is cancelled until they confirm.
export type CancelStep = "pick" | "review" | "done";

const REASONS = [
  "Event date changed",
  "Event called off or postponed",
  "Found another vendor",
  "Budget changed",
  "Not happy with the vendor’s proposal",
  "Other",
];

const KIND: Record<string, string> = {
  Decorator: "decorators",
  Caterer: "caterers",
  PAV: "photographers",
  DJArtist: "DJs",
  MakeupArtist: "makeup artists",
  VenueProvider: "venues",
};
const kinds = (pkgs: BookingHelpPackage[]) =>
  [...new Set(pkgs.map((p) => KIND[p.vendorType ?? ""] ?? "vendors"))].join(" and ");

const when = (iso: string | null) => {
  if (!iso) return "";
  const d = new Date(iso);
  return `${d.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}, ${d
    .toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true })
    .toUpperCase()}`;
};

const POLICY_TEXT: Record<string, string> = {
  flexible: "Flexible: full refund until 7 days before the event, 50% after.",
  standard: "Standard: full refund until 30 days before the event, none within 14 days. In between, the team confirms the refund.",
  strict: "Strict: the booking amount is non-refundable.",
  custom: "The vendor’s own policy: the team confirms the refund from it.",
};

/** What one package costs to cancel now. */
function moneyLine(p: BookingHelpPackage) {
  const t = p.terms;
  if (!p.paid) return "Nothing paid yet, so no charge";
  if (!t || t.teamDecides) return `${formatPrice(p.paid)} paid · the team confirms the refund`;
  if (t.policy === "strict") return `${formatPrice(p.paid)} paid · non-refundable`;
  if (!t.charges) return `${formatPrice(p.paid)} paid · no charge`;
  return `${formatPrice(p.paid)} paid · ${formatPrice(t.charges)} charges`;
}

function totals(pkgs: BookingHelpPackage[]) {
  const paid = pkgs.reduce((t, p) => t + p.paid, 0);
  const team = pkgs.some((p) => p.paid > 0 && (!p.terms || p.terms.teamDecides));
  const back = pkgs.reduce((t, p) => t + (p.paid > 0 ? (p.terms?.refund ?? 0) : 0), 0);
  return { paid, team, back, charges: paid - back };
}

type Props = {
  step: CancelStep;
  packages: BookingHelpPackage[];
  selected: string[];
  onToggle: (reference: string) => void;
  onToggleAll: () => void;
  reason: string | null;
  otherReason: string;
  onReason: (reason: string | null) => void;
  onOtherReason: (text: string) => void;
  onReview: () => void;
  onEditPick: () => void;
  onKeep: () => void;
  onConfirm: () => Promise<void>;
  /** Done: the cancelled packages, with their refund records. */
  done: { refs: string[]; refunds: Record<string, RawBookingRefund | null> } | null;
  emName: string | null;
  eventDateLabel: string;
  onReplacement: (text: string) => void;
  onHome: () => void;
};

export default function BookingCancel(props: Props) {
  const { step, packages, selected, emName } = props;
  const active = packages.filter((p) => !p.cancelled);
  const chosen = active.filter((p) => selected.includes(p.reference));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRules, setShowRules] = useState(false);

  // Free cancellation / online cut-off banner, for what's chosen (or everything).
  const scope = chosen.length ? chosen : active;
  const free = scope.every((p) => p.terms?.freeNow);
  const freeUntil = scope.map((p) => p.terms?.freeUntil).filter((d): d is string => Boolean(d)).sort()[0] ?? null;
  const cancelUntil = scope.map((p) => p.terms?.selfCancelUntil).filter((d): d is string => Boolean(d)).sort()[0] ?? null;
  const banner = free && freeUntil ? (
    <Banner tone="info" icon="/images/customer/help/shield-info.svg">
      Free cancellation until {when(freeUntil)}. After that, charges follow each package’s cancellation policy. You can cancel
      online until {when(cancelUntil)}.
    </Banner>
  ) : (
    <Banner tone="warn" icon="/images/customer/help/clock-warn.svg">
      Charges now follow each package’s cancellation policy. You can cancel online until {when(cancelUntil)}.
    </Banner>
  );

  if (step === "pick") {
    const all = active.length > 0 && active.every((p) => selected.includes(p.reference));
    return (
      <div className="flex w-full flex-col gap-4 px-4 pb-6 pt-4 font-figtree">
        {banner}
        <div className="flex items-center justify-between gap-2">
          <SmallHead>Choose package(s) to cancel</SmallHead>
          {active.length > 1 && (
            <button type="button" onClick={props.onToggleAll} className="text-[12px] text-[#030303] underline underline-offset-2">
              {all ? "Clear all" : "Select all"}
            </button>
          )}
        </div>
        <div className="flex flex-col gap-2">
          {packages.map((p) => (
            <PackagePick
              key={p.reference}
              name={p.name}
              sub={[p.vendorName, p.variantLabel].filter(Boolean).join(" · ")}
              image={p.image}
              selected={selected.includes(p.reference)}
              disabled={p.cancelled || !p.cancellable}
              onClick={() => props.onToggle(p.reference)}
              extra={
                <span className="mt-1.5 flex flex-wrap gap-1.5">
                  {p.cancelled ? (
                    <Pill tone="neutral">Cancelled</Pill>
                  ) : !p.cancellable ? (
                    <Pill tone="neutral">Online cancellation closed</Pill>
                  ) : (
                    <Pill tone="neutral">{p.paid ? `Slot locked · ${formatPrice(p.paid)} paid` : "Slot not locked · nothing paid"}</Pill>
                  )}
                </span>
              }
            />
          ))}
        </div>
        <p className="-mt-1.5 text-[12px] leading-[18px] text-[#71717b]" aria-live="polite">
          {chosen.length ? `Cancelling ${chosen.length} of ${active.length} package${active.length > 1 ? "s" : ""}` : "Nothing selected yet"}
        </p>
        <div className="flex flex-col gap-2">
          <p className="text-[14px] leading-[20px] text-[#3f3f47]">
            Why are you cancelling? <span className="text-[12px] text-[#71717b]">Optional</span>
          </p>
          {REASONS.map((r) => {
            const on = props.reason === r;
            return (
              <button
                key={r}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => props.onReason(on ? null : r)}
                className={`flex min-h-14 w-full items-center gap-3 rounded-[12px] bg-white text-left ${
                  on ? "border-2 border-[#030303] p-[13px]" : "border border-[#e4e4e7] p-3.5"
                }`}
              >
                <span className={`flex size-5 shrink-0 items-center justify-center rounded-full border-[1.5px] ${on ? "border-[#030303]" : "border-[#9f9fa9]"}`}>
                  {on && <span className="size-2.5 rounded-full bg-[#030303]" />}
                </span>
                <span className="text-[14px] leading-[20px] text-[#030303]">{r}</span>
              </button>
            );
          })}
          {props.reason === "Other" && (
            <textarea
              value={props.otherReason}
              maxLength={200}
              onChange={(e) => props.onOtherReason(e.target.value)}
              placeholder="Tell us in a line (optional)"
              aria-label="Tell us more"
              className="min-h-[72px] w-full resize-y rounded-[8px] border border-[#e4e4e7] px-3.5 py-3 text-[14px] leading-[20px] text-[#030303] outline-none placeholder:text-[#9f9fa9] focus:border-[#030303]"
            />
          )}
        </div>
        <HelpButton size="md" className="w-full disabled:opacity-45" disabled={!chosen.length} onClick={props.onReview}>
          {chosen.length ? "Review cancellation" : "Choose at least one package"}
        </HelpButton>
        <p className="-mt-2 text-center text-[12px] leading-[18px] text-[#71717b]">Nothing is cancelled until you confirm on the next screen.</p>
      </div>
    );
  }

  if (step === "review") {
    const m = totals(chosen);
    const left = active.filter((p) => !selected.includes(p.reference));
    const [lead, amount, sub] =
      m.paid === 0
        ? ["To cancel, you pay", formatPrice(0), "You haven’t paid for this yet, so there’s nothing to charge or refund."]
        : m.team
          ? ["You get back", "To be confirmed", "The team confirms the refund under the vendor’s cancellation policy, usually within a day."]
          : m.back === 0
            ? ["You get back", formatPrice(0), "The charges use up what you paid. You won’t owe anything more."]
            : ["You get back", formatPrice(m.back), "To the account you paid from"];
    const why = props.reason === "Other" && props.otherReason.trim() ? props.otherReason.trim() : props.reason;
    const many = chosen.length > 1;
    return (
      <div className="flex w-full flex-col gap-4 px-4 pb-6 pt-4 font-figtree">
        <div className="flex flex-col gap-0.5">
          <span className="text-[14px] leading-[20px] text-[#71717b]">{lead}</span>
          <span className="text-[32px] font-semibold leading-[40px] tracking-[-0.5px] text-[#030303] tabular-nums">{amount}</span>
          <span className="text-[14px] leading-[20px] text-[#71717b]">{sub}</span>
        </div>
        {m.paid > 0 && (
          <div className="rounded-[16px] border border-[#e4e4e7] px-4 py-2">
            <Statement
              rows={[
                [`Paid for ${many ? "these packages" : "this package"}`, formatPrice(m.paid)],
                ["Cancellation charges", m.team ? "To be confirmed" : m.charges ? `− ${formatPrice(m.charges)}` : formatPrice(0)],
              ]}
              total={["You get back", m.team ? "To be confirmed" : formatPrice(m.back)]}
            />
          </div>
        )}
        <SmallHead>What’s being cancelled</SmallHead>
        <div className="flex flex-col divide-y divide-[#e4e4e7] rounded-[16px] border border-[#e4e4e7] px-4">
          {chosen.map((p) => (
            <p key={p.reference} className="py-2.5 text-[14px] leading-[20px] text-[#030303]">
              {p.name}
              <span className="block text-[12px] leading-[18px] text-[#71717b]">
                {p.vendorName} · {moneyLine(p)}
              </span>
            </p>
          ))}
        </div>
        {left.length > 0 && (
          <p className="-mt-1.5 text-[12px] leading-[18px] text-[#71717b]">{left.map((p) => p.name).join(", ")} stays booked as it is.</p>
        )}
        <div className="flex items-center justify-between gap-2 text-[14px] leading-[20px] text-[#71717b]">
          <span>{why ? `Your reason: ${why}` : "No reason given"}</span>
          <button type="button" onClick={props.onEditPick} className="text-[12px] text-[#030303] underline underline-offset-2">
            {why ? "Change" : "Add one"}
          </button>
        </div>
        <button type="button" onClick={() => setShowRules((v) => !v)} className="self-start text-[12px] text-[#030303] underline underline-offset-2">
          How charges are worked out
        </button>
        {showRules && (
          <div className="flex flex-col gap-1 rounded-[12px] bg-[#fafafa] px-3 py-2.5 text-[12px] leading-[18px] text-[#3f3f47]">
            {chosen.map((p) => (
              <p key={p.reference}>
                <b className="font-semibold">{p.vendorName ?? p.name}</b> — {POLICY_TEXT[p.terms?.policy ?? "custom"]}
              </p>
            ))}
          </div>
        )}
        {error && (
          <p role="alert" className="text-[12px] leading-[18px] text-[#c81e0d]">
            {error}
          </p>
        )}
        <div className="flex flex-col gap-2">
          <HelpButton
            variant="secondary"
            size="md"
            className="w-full disabled:opacity-45"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              setError(null);
              try {
                await props.onConfirm();
              } catch (e) {
                setError(e instanceof Error ? e.message : "We couldn’t cancel that. Try again, or ask your Event Manager.");
                setBusy(false);
              }
            }}
          >
            {busy ? "Cancelling…" : `Cancel ${many ? "these packages" : "this package"}`}
          </HelpButton>
          <HelpButton variant="secondary" size="md" className="w-full" onClick={props.onKeep}>
            Keep my booking
          </HelpButton>
        </div>
        <p className="-mt-2 text-center text-[12px] leading-[18px] text-[#71717b]">You can’t undo this once you confirm.</p>
      </div>
    );
  }

  // Done.
  const done = props.done;
  const gone = packages.filter((p) => done?.refs.includes(p.reference));
  const left = packages.filter((p) => !p.cancelled && !done?.refs.includes(p.reference));
  const refunds = gone.map((p) => done?.refunds[p.reference] ?? p.booking.refund ?? null);
  const paid = refunds.reduce((t, r) => t + (r?.paid ?? 0), 0);
  const team = refunds.some((r) => r?.status === "team_review");
  const back = refunds.reduce((t, r) => t + (r?.amount ?? 0), 0);
  const stage = refunds.some((r) => r?.status === "completed") ? 3 : refunds.some((r) => r?.status === "started") ? 2 : 1;
  const names = gone.map((p) => p.name);
  const replaceKinds = kinds(gone);
  return (
    <div className="flex w-full flex-col gap-4 px-4 pb-6 pt-4 font-figtree">
      <div className="flex flex-col gap-1.5 rounded-[16px] border border-[#e4e4e7] p-4">
        <span className="flex items-center gap-2 font-semibold text-[#030303]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/customer/help/tick-dark.svg" alt="" width={20} height={20} className="block" />
          {names.join(" and ")} {names.length > 1 ? "are" : "is"} cancelled
        </span>
        <span className="text-[14px] leading-[20px] text-[#71717b]">
          {emFull(emName)} has been told, and the vendor{gone.length > 1 ? "s see" : " sees"} it on their booking.
          {left.length ? ` ${left.map((p) => p.name).join(", ")} stays booked as it is.` : ""}
        </span>
      </div>

      <div className="flex flex-col gap-3 rounded-[16px] border border-[#e4e4e7] p-4">
        {paid === 0 ? (
          <p className="text-[14px] leading-[20px] text-[#030303]">
            <b className="font-semibold">Nothing to pay or refund</b>
            <span className="block text-[#71717b]">You hadn’t paid for {gone.length > 1 ? "these packages" : "this package"} yet.</span>
          </p>
        ) : team ? (
          <p className="text-[14px] leading-[20px] text-[#030303]">
            <b className="font-semibold">Refund to be confirmed</b>
            <span className="block text-[#71717b]">
              The team confirms how much comes back under the vendor’s cancellation policy, usually within a day. You’ll see it here.
            </span>
          </p>
        ) : back === 0 ? (
          <p className="text-[14px] leading-[20px] text-[#030303]">
            <b className="font-semibold">Nothing to refund</b>
            <span className="block text-[#71717b]">The charges used up the {formatPrice(paid)} you paid. You don’t owe anything more.</span>
          </p>
        ) : (
          <>
            <p className="text-[14px] leading-[20px] text-[#030303]">
              <b className="font-semibold">Refund of {formatPrice(back)}</b>
              <span className="block text-[#71717b]">Going back to the account you paid from</span>
            </p>
            <RefundTrack stage={stage} />
            <p className="text-[12px] leading-[18px] text-[#71717b]">We’ll update this here as it moves.</p>
          </>
        )}
      </div>

      <div className="flex flex-col gap-2 rounded-[16px] border border-[#e4e4e7] p-4">
        <p className="text-[14px] leading-[20px] text-[#030303]">
          <b className="font-semibold">Need someone else for {props.eventDateLabel}?</b>
          <span className="block text-[#71717b]">
            {emLabel(emName)} can suggest {replaceKinds} who are free on your date, or you can browse yourself.
            {back ? " Your refund isn’t affected." : ""}
          </span>
        </p>
        <HelpButton
          variant="secondary"
          className="self-start"
          onClick={() => props.onReplacement(`Please suggest ${replaceKinds} who are free on ${props.eventDateLabel}.`)}
        >
          Show me options
        </HelpButton>
        <p className="text-[12px] leading-[18px] text-[#71717b]">
          or{" "}
          <Link href="/packages/browse" className="text-[#030303] underline underline-offset-2">
            browse packages yourself
          </Link>
        </p>
      </div>
      <HelpButton variant="tertiary" size="md" className="w-full" onClick={props.onHome}>
        Back to help
      </HelpButton>
    </div>
  );
}

/** Cancelled → Refund started → In your account. */
function RefundTrack({ stage }: { stage: 1 | 2 | 3 }) {
  const steps = [
    { label: "Cancelled", sub: "Today", state: "done" },
    { label: "Refund started", sub: stage >= 2 ? "Done" : "In progress", state: stage >= 2 ? "done" : "now" },
    { label: "In your account", sub: stage === 3 ? "Done" : "", state: stage === 3 ? "fin" : stage === 2 ? "now" : "" },
  ];
  const fill = stage === 1 ? "33.4%" : stage === 2 ? "66.8%" : "66.8%";
  return (
    <div className="relative grid grid-cols-3 pt-1">
      <span className="absolute left-[16.6%] right-[16.6%] top-[13px] h-0.5 bg-[#e4e4e7]" />
      <span className="absolute left-[16.6%] top-[13px] h-0.5 bg-[#030303] transition-[width] duration-500" style={{ width: fill }} />
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
  );
}
