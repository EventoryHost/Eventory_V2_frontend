"use client";

import { useState } from "react";
import HelpButton from "./HelpButton";
import HelpCheckbox from "./HelpCheckbox";
import HelpPhoneIcon from "./HelpPhoneIcon";
import HelpTextField from "./HelpTextField";

// v6f9 "Request a call back" (its own screen, from the status card): the
// number (account's, or typed), when to call, what it's about, consent for
// guests, then a confirmation with the reference.
type Props = {
  accountPhone?: string;
  signedIn: boolean;
  isAfterHours: boolean;
  /** Pre-fills "What's it about?" — the chat's question. */
  defaultNote?: string;
  onSubmit: (input: { phone: string; window?: string; note?: string }) => Promise<{ ticket: string; when: string }>;
  /** "Back to chat". */
  onDone: () => void;
};

const LABEL = "font-figtree text-[14px] font-normal leading-[20px] text-[#3f3f47]";

/** The options and the promise each one makes (v6 mockup cbOpts). */
function options(isAfterHours: boolean) {
  const at = (mins: number) =>
    new Date(Date.now() + mins * 60000)
      .toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true })
      .toUpperCase();
  return isAfterHours
    ? [
        { label: "Tomorrow, 9–10 AM", sub: "" },
        { label: "Tomorrow, 12–2 PM", sub: "" },
        { label: "Tomorrow, 6–9 PM", sub: "" },
      ]
    : [
        { label: "As soon as possible", sub: `Usually within 30 minutes · by ${at(30)}` },
        { label: "In the next hour", sub: `Before ${at(60)}` },
        { label: "This evening, 6–9 PM", sub: "" },
      ];
}

const formatPhone = (digits: string) => `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;

export default function HelpCallBackScreen({ accountPhone, signedIn, isAfterHours, defaultNote = "", onSubmit, onDone }: Props) {
  const opts = options(isAfterHours);
  const [when, setWhen] = useState(opts[0].label);
  const [useAccount, setUseAccount] = useState(Boolean(accountPhone));
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState(defaultNote);
  const [consent, setConsent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ ticket: string; when: string; phone: string } | null>(null);

  const digits = phone.replace(/\D/g, "").slice(-10);
  const phoneOk = /^[6-9]\d{9}$/.test(digits);
  const ready = (useAccount || phoneOk) && (signedIn || consent) && !sending;

  const submit = async () => {
    if (!ready) return;
    setSending(true);
    setError(null);
    const number = useAccount && accountPhone ? accountPhone : digits;
    try {
      const r = await onSubmit({
        phone: number,
        window: when === "As soon as possible" ? undefined : when,
        note: note.trim() || undefined,
      });
      setDone({ ...r, phone: useAccount && accountPhone ? accountPhone : formatPhone(digits) });
    } catch {
      setError("We couldn’t book that. Check your connection and try again.");
    } finally {
      setSending(false);
    }
  };

  if (done) {
    const whenText = done.when.charAt(0).toUpperCase() + done.when.slice(1);
    return (
      <div className="flex w-full flex-col items-stretch gap-5 px-4 pb-6 pt-6 font-figtree">
        <span className="flex size-14 items-center justify-center self-center rounded-full bg-[#f0fdf4]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/customer/help/check-circle-success.svg" alt="" width={28} height={28} className="block" />
        </span>
        <h3 className="text-center text-[20px] font-semibold leading-[28px] text-[#030303]">Call back requested</h3>
        <div className="flex flex-col rounded-[12px] border border-[#e4e4e7] bg-white">
          <div className="flex items-start gap-2.5 px-3 py-2.5">
            <HelpPhoneIcon tone="account" />
            <p className="text-[14px] leading-[20px] text-[#030303]">
              We’ll call {done.phone}
              <span className="block text-[12px] leading-[18px] text-[#71717b]">{whenText}</span>
            </p>
          </div>
          <div className="flex items-start gap-2.5 border-t border-[#e4e4e7] px-3 py-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/customer/help/doc.svg" alt="" width={20} height={20} className="block" />
            <p className="text-[14px] leading-[20px] text-[#030303]">
              Reference <span className="tabular-nums">{done.ticket}</span>
              <span className="block text-[12px] leading-[18px] text-[#71717b]">Saved in Your chats</span>
            </p>
          </div>
        </div>
        <p className="text-center text-[12px] leading-[18px] text-[#71717b]">
          If we miss you, we’ll try once more and leave you a WhatsApp message.
        </p>
        <HelpButton size="md" className="w-full" onClick={onDone}>
          Back to chat
        </HelpButton>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-5 px-4 pb-6 pt-4 font-figtree">
      <p className="text-[14px] leading-[20px] text-[#71717b]">
        An Event Manager calls you and has this chat in front of them.
      </p>

      <div className="flex flex-col gap-2">
        <p className={LABEL}>Your number</p>
        {useAccount && accountPhone ? (
          <>
            <div className="flex items-center gap-2.5 rounded-[12px] border border-[#e4e4e7] px-3 py-2.5">
              <HelpPhoneIcon tone="account" />
              <p className="flex-1 text-[14px] leading-[20px] text-[#030303] tabular-nums">
                {accountPhone}
                <span className="block text-[12px] leading-[18px] text-[#71717b]">From your account</span>
              </p>
              <button
                type="button"
                onClick={() => setUseAccount(false)}
                className="text-[14px] leading-[20px] text-[#030303] underline underline-offset-2"
              >
                Use a different number
              </button>
            </div>
            <p className="text-[12px] leading-[18px] text-[#71717b]">We use this number only to call you about this request.</p>
          </>
        ) : (
          <HelpTextField
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            maxLength={11}
            placeholder="98765 43210"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/[^\d ]/g, ""))}
            error={phone.replace(/\D/g, "").length >= 10 && !phoneOk ? "Enter a 10-digit mobile number." : undefined}
            leftIcon={<span className="text-[14px] text-[#3f3f47]">+91</span>}
            aria-label="Your number"
          />
        )}
      </div>

      <div className="flex flex-col gap-2">
        <p className={LABEL}>When should we call?</p>
        <div className="flex flex-col gap-2" role="radiogroup">
          {opts.map((o) => {
            const on = when === o.label;
            return (
              <button
                key={o.label}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => setWhen(o.label)}
                className={`flex min-h-14 w-full items-center gap-3 rounded-[12px] bg-white text-left ${
                  on ? "border-2 border-[#030303] p-[13px]" : "border border-[#e4e4e7] p-3.5"
                }`}
              >
                <span
                  className={`flex size-5 shrink-0 items-center justify-center rounded-full border-[1.5px] ${
                    on ? "border-[#030303]" : "border-[#9f9fa9]"
                  }`}
                >
                  {on && <span className="size-2.5 rounded-full bg-[#030303]" />}
                </span>
                <span className="flex-1 text-[14px] leading-[20px] text-[#030303]">
                  {o.label}
                  {o.sub && <span className="block text-[12px] leading-[18px] text-[#71717b]">{o.sub}</span>}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="help-cb-note" className={LABEL}>
          What’s it about? (optional)
        </label>
        <textarea
          id="help-cb-note"
          value={note}
          maxLength={500}
          onChange={(e) => setNote(e.target.value)}
          placeholder="For example, haldi for 80 guests on 12 March"
          className="min-h-[72px] w-full resize-y rounded-[8px] border border-[#e4e4e7] px-3.5 py-3 text-[14px] leading-[20px] text-[#030303] outline-none placeholder:text-[#9f9fa9] focus:border-[#030303]"
        />
      </div>

      {!signedIn && (
        <>
          <div className="flex flex-col gap-1 rounded-[12px] bg-[#fafafa] px-3 py-2.5 text-[12px] leading-[18px] text-[#71717b]">
            <p className="font-semibold text-[#3f3f47]">How we use this number</p>
            <p>Only to call you and send updates about this request. Not for offers. Reply STOP on WhatsApp at any time to withdraw consent.</p>
          </div>
          <HelpCheckbox checked={consent} onChange={setConsent}>
            I agree that Eventory can call me and message me on WhatsApp about this request.
          </HelpCheckbox>
        </>
      )}

      {error && (
        <p role="alert" className="text-[12px] leading-[18px] text-[#c81e0d]">
          {error}
        </p>
      )}
      <HelpButton size="md" className="w-full disabled:opacity-45" disabled={!ready} onClick={() => void submit()}>
        {sending ? "Requesting…" : "Request call back"}
      </HelpButton>
    </div>
  );
}
