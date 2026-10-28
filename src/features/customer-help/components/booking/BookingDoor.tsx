"use client";

import { formatPrice } from "@/features/customer-package-detail/utils/formatPrice";
import { dayText, emFirst, emLabel, type BookingRequestKind } from "../../assistant/bookingAnswers";
import type { HelpBookingContext } from "../../helpContext";
import type { BookingHelpData, BookingHelpPackage } from "../../hooks/useBookingHelpData";
import HelpButton from "../HelpButton";
import type { BookingDoorKey } from "./BookingHome";
import { Accordion, Banner, PackagePick, Pill, Row, RowList, SmallHead, Statement } from "./ui";

// v6f9 booking doors. "My booking" and "A vendor or package question"
// start by choosing the package(s) (step 1 of 2), then list what can be
// done for them. "Payments and invoices" is one list of answers.
export type BookingChangeKind = "guests" | "resched" | "venue";

type Props = {
  door: BookingDoorKey;
  step: "pick" | "options";
  ctx: HelpBookingContext;
  data: BookingHelpData;
  selected: string[];
  onToggle: (reference: string) => void;
  onContinue: () => void;
  onChangePick: () => void;
  /** "Customise package contents": the booking page's proposal editor. */
  onCustomise: (reference: string) => void;
  onChange: (kind: BookingChangeKind) => void;
  onCustomisationStatus: () => void;
  onCancel: () => void;
  /** A row that opens a thread with the assistant's answer. */
  onTopic: (question: string, kind: BookingRequestKind | "arrive" | "included" | "pay-issue") => void;
  onPayments: () => void;
  onDownloadInvoice: (pkg: BookingHelpPackage) => void;
};

const LABEL: Record<"mybooking" | "vendor" | "other", string> = {
  mybooking: "Choose package(s) to change",
  vendor: "Choose package(s) to ask about",
  other: "",
};

const tier = (p: BookingHelpPackage) => [p.vendorName, p.variantLabel, p.statusLabel].filter(Boolean).join(" · ");
const when = (iso: string) => {
  const d = new Date(iso);
  return `${d.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}, ${d
    .toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true })
    .toUpperCase()}`;
};

/** Free changes, from the chosen packages' cancellation templates. */
export function changeWindow(pkgs: BookingHelpPackage[]) {
  const ends = pkgs.map((p) => (p.terms?.freeNow ? p.terms.freeUntil : null));
  const free = ends.length > 0 && ends.every(Boolean);
  const until = free ? (ends as string[]).sort()[0] : null;
  return { free, until };
}

export default function BookingDoor(props: Props) {
  const { door, step, ctx, data, selected } = props;
  const active = data.packages.filter((p) => !p.cancelled);
  const chosen = active.filter((p) => selected.includes(p.reference));
  const em = emLabel(data.emName);

  if (door === "pay") return <PaymentsDoor {...props} />;
  // Event day "Other help": payments, then last-minute changes.
  if (door === "other")
    return (
      <>
        <PaymentsDoor {...props} />
        <div className="-mt-2 flex w-full flex-col gap-3 px-4 pb-6 font-figtree">
          <SmallHead>Last-minute changes</SmallHead>
          <RowList>
            <Row
              framed={false}
              onClick={() => props.onTopic("Add an add-on", "lmc-addon")}
              title="Add an add-on"
              sub="The vendor confirms if crew and stock allow"
              pill={<Pill tone="pending">Vendor approval</Pill>}
            />
            <Row
              framed={false}
              onClick={() => props.onTopic("Decorate another area", "lmc-area")}
              title="Decorate another area"
              sub="For example the entrance or a second room"
              pill={<Pill tone="pending">Vendor approval</Pill>}
            />
            <Row framed={false} onClick={() => props.onTopic("Something else", "message")} title="Something else" sub={`Ask ${em}`} />
          </RowList>
          <p className="text-[12px] leading-[18px] text-[#71717b]">Removing items is locked on the event day.</p>
        </div>
      </>
    );

  if (step === "pick") {
    const all = chosen.length === active.length && active.length > 1;
    return (
      <div className="flex w-full flex-col gap-4 px-4 pb-6 pt-4 font-figtree">
        <SmallHead>{LABEL[door]}</SmallHead>
        <div className="flex flex-col gap-2">
          {active.map((p) => (
            <PackagePick
              key={p.reference}
              name={p.name}
              sub={tier(p)}
              image={p.image}
              selected={selected.includes(p.reference)}
              onClick={() => props.onToggle(p.reference)}
            />
          ))}
        </div>
        <HelpButton size="md" className="w-full disabled:opacity-45" disabled={!chosen.length} onClick={props.onContinue}>
          {!chosen.length ? "Choose at least one package" : all ? "Continue with both packages" : `Continue with ${chosen[0].name}`}
        </HelpButton>
        {door === "mybooking" && (
          <>
            <Row
              onClick={props.onCustomisationStatus}
              title="Customisation status"
              sub={`See every package at once${ctx.proposalsAwaitingReview.length ? ` · ${ctx.proposalsAwaitingReview.length} waiting for you` : ""}`}
              pill={ctx.proposalsAwaitingReview.length ? <Pill tone="pending">{ctx.proposalsAwaitingReview.length} to review</Pill> : undefined}
            />
            {active.some((p) => p.cancellable) && (
              <>
                <SmallHead>Cancel</SmallHead>
                <Row onClick={props.onCancel} title="Cancel package(s)" sub="See what you’d get back before anything is cancelled" />
                <p className="-mt-2 text-[12px] leading-[18px] text-[#71717b]">
                  Need a different date instead?{" "}
                  <button type="button" onClick={() => props.onChange("resched")} className="text-[#030303] underline underline-offset-2">
                    Reschedule
                  </button>{" "}
                  or{" "}
                  <button
                    type="button"
                    onClick={() => props.onTopic(`Talk to ${em}`, "message")}
                    className="text-[#030303] underline underline-offset-2"
                  >
                    talk to {em}
                  </button>
                  .
                </p>
              </>
            )}
          </>
        )}
      </div>
    );
  }

  const chips = (
    <div className="flex flex-wrap items-center gap-1.5">
      {chosen.map((p) => (
        <span key={p.reference} className="max-w-full truncate rounded-full border border-[#e4e4e7] bg-white px-2.5 py-1 text-[12px] leading-[18px] text-[#3f3f47]">
          {p.name}
        </span>
      ))}
      <button type="button" onClick={props.onChangePick} className="text-[12px] text-[#030303] underline underline-offset-2">
        Change
      </button>
    </div>
  );

  if (door === "vendor") {
    const names = chosen.map((p) => p.vendorName ?? p.name).join(", ");
    return (
      <div className="flex w-full flex-col gap-4 px-4 pb-6 pt-4 font-figtree">
        {chips}
        <RowList>
          <Row framed={false} onClick={() => props.onTopic("When will my vendors arrive?", "arrive")} title="When will my vendors arrive?" sub="Setup and arrival times" />
          <Row framed={false} onClick={() => props.onTopic("What’s included in my packages?", "included")} title="What’s included in my packages?" sub="Items, setup, crew" />
          <Row framed={false} onClick={() => props.onTopic(`Ask ${names} something`, "vendor")} title="Ask a vendor something" sub={`${em} asks them for you`} />
          <Row framed={false} onClick={() => props.onTopic("Something else", "message")} title="Something else" sub={`Ask ${em}`} />
        </RowList>
        <p className="text-[12px] leading-[18px] text-[#71717b]">
          You can’t message vendors directly before the event. {em} asks them for you and replies here.
        </p>
      </div>
    );
  }

  // My booking → options for the chosen package(s).
  const { free, until } = changeWindow(chosen);
  const confirmers = chosen.length > 1 ? "Both vendors need to confirm" : `${chosen[0]?.vendorName ?? "The vendor"} needs to confirm`;
  const approval = free ? undefined : <Pill tone="pending">Vendor approval</Pill>;
  return (
    <div className="flex w-full flex-col gap-4 px-4 pb-6 pt-4 font-figtree">
      {chips}
      {free && until ? (
        <Banner tone="info" icon="/images/customer/help/shield-info.svg">
          Free changes until {when(until)}. After that, the vendor has to approve any change.
        </Banner>
      ) : (
        <Banner tone="warn" icon="/images/customer/help/clock-warn.svg">
          The free-change window is over for {chosen.length > 1 ? "these packages" : "this package"}. The vendor has to approve
          any change, and it may cost more.
        </Banner>
      )}
      <RowList>
        <Row framed={false} onClick={() => props.onCustomise(chosen[0].reference)} title="Customise package contents" sub="Items and add-ons, in the proposal editor" pill={approval} />
        <Row framed={false} onClick={() => props.onChange("guests")} title="Change guest count" sub={ctx.guestsLabel ? `Currently ${ctx.guestsLabel}` : "Tell us the new count"} pill={approval} />
        <Row framed={false} onClick={() => props.onChange("resched")} title="Reschedule" sub={confirmers} pill={approval} />
        <Row framed={false} onClick={() => props.onChange("venue")} title="Change venue" sub={confirmers} pill={approval} />
      </RowList>
      <p className="text-[12px] leading-[18px] text-[#71717b]">
        Items and add-ons change in your proposal. Guest count, date and venue changes go to {em}, who confirms them with the
        vendor{chosen.length > 1 ? "s" : ""}.
      </p>
    </div>
  );
}

function PaymentsDoor({ data, onTopic, onPayments, onDownloadInvoice }: Props) {
  const active = data.packages.filter((p) => !p.cancelled);
  const em = emLabel(data.emName);
  const first = emFirst(data.emName) ?? "the Event Manager team";
  return (
    <div className="flex w-full flex-col gap-4 px-4 pb-6 pt-4 font-figtree">
      <div className="flex flex-col divide-y divide-[#e4e4e7] overflow-hidden rounded-[16px] border border-[#e4e4e7]">
        <Accordion
          title="What I still owe"
          sub={data.remaining > 0 ? `${formatPrice(data.remaining)}${data.nextDueDate ? ` due by ${dayText(data.nextDueDate)}` : ""}` : "Paid in full"}
          icon="/images/customer/help/wallet.svg"
        >
          <Statement
            rows={active.map((p) => [p.vendorName ?? p.name, formatPrice(p.remaining)] as [string, string])}
            total={["Still to pay", formatPrice(data.remaining)]}
          />
          {data.remaining > 0 && (
            <>
              <p className="mt-2 text-[12px] leading-[18px] text-[#71717b]">
                {data.nextDueDate ? `The next payment is due by ${dayText(data.nextDueDate)}. ` : ""}Pay from your booking page.
              </p>
              <HelpButton className="mt-2 self-start" onClick={onPayments}>
                Pay on booking page
              </HelpButton>
            </>
          )}
        </Accordion>
        <Accordion title="Someone else is paying" sub="Get a payment link to share" icon="/images/customer/help/users-group.svg">
          <p className="text-[13px] leading-[20px] text-[#71717b]">
            {em} can send you a payment link to share with whoever’s paying. Their payment shows on your booking.
          </p>
          <HelpButton variant="secondary" className="mt-2 self-start" onClick={() => onTopic("Someone else is paying", "payment-link")}>
            Ask {first} for a link
          </HelpButton>
        </Accordion>
        <Accordion title="Ways to pay" sub="UPI, cards, net banking" icon="/images/customer/help/wallet.svg">
          {[
            ["UPI", "Any UPI app · instant"],
            ["Debit and credit cards", "Visa, Mastercard, RuPay"],
            ["Net banking", "All major banks"],
          ].map(([t, s], i) => (
            <div key={t} className={`py-2.5 text-[14px] leading-[20px] text-[#030303] ${i ? "border-t border-[#e4e4e7]" : ""}`}>
              {t}
              <span className="block text-[12px] leading-[18px] text-[#71717b]">{s}</span>
            </div>
          ))}
          <p className="mt-1 text-[12px] leading-[18px] text-[#71717b]">
            Always pay through Eventory. Eventory holds your money until setup is complete, so never pay a vendor directly.
          </p>
        </Accordion>
        <Accordion
          title="Invoices and receipts"
          sub={`${active.filter((p) => p.paid > 0).length} available`}
          icon="/images/customer/help/doc.svg"
        >
          {active.map((p, i) => (
            <div key={p.reference} className={`flex items-center gap-2.5 py-2.5 ${i ? "border-t border-[#e4e4e7]" : ""}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/customer/help/doc.svg" alt="" width={20} height={20} className="block" />
              <span className="min-w-0 flex-1 text-[14px] leading-[20px] text-[#030303]">
                Invoice · {p.vendorName ?? p.name}
                <span className="block text-[12px] leading-[18px] text-[#71717b]">
                  {p.paid > 0 ? `${formatPrice(p.paid)} paid · ${p.reference}` : "Available once you’ve paid for it"}
                </span>
              </span>
              {p.paid > 0 && (
                <button
                  type="button"
                  aria-label={`Download invoice for ${p.vendorName ?? p.name}`}
                  onClick={() => onDownloadInvoice(p)}
                  className="flex size-8 items-center justify-center rounded-full bg-[#f4f4f5]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/images/customer/help/download.svg" alt="" width={16} height={16} className="block" />
                </button>
              )}
            </div>
          ))}
        </Accordion>
        <Accordion title="Trouble making a payment" sub="A payment failed or didn’t show up" icon="/images/customer/help/info.svg">
          <p className="text-[13px] leading-[20px] text-[#71717b]">
            If a payment doesn’t go through, your booking is still saved. Any amount deducted is refunded automatically. Choose a
            method and try again.
          </p>
          <HelpButton variant="secondary" className="mt-2 self-start" onClick={() => onTopic("Money was deducted but not refunded", "pay-issue")}>
            Money deducted and not refunded?
          </HelpButton>
        </Accordion>
        <Row framed={false} onClick={() => onTopic("Update invoice details", "invoice")} title="Update invoice details" sub="Add GSTIN or change the billing name" />
      </div>
    </div>
  );
}
