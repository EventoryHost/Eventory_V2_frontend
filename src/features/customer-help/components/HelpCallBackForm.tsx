"use client";

import { useState } from "react";
import HelpButton from "./HelpButton";
import HelpCheckbox from "./HelpCheckbox";
import HelpTextField from "./HelpTextField";

// "Get a call back" for guests, who have no account number: one phone
// field + consent, built from the brief card's Call me fields (Figma
// "Help / Brief card" · Call me). Signed-in customers skip this.
type HelpCallBackFormProps = {
  onSubmit: (phone: string) => Promise<void>;
};

export default function HelpCallBackForm({ onSubmit }: HelpCallBackFormProps) {
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const phoneError =
    phone.replace(/\D/g, "").length !== 10 ? "Enter a 10-digit mobile number." : undefined;

  const submit = async () => {
    if (phoneError || !consent) {
      setShowErrors(true);
      return;
    }
    if (sending) return;
    setSending(true);
    setError(null);
    try {
      await onSubmit(phone);
    } catch {
      setError("We couldn’t request that. Check your connection and try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex w-full flex-col items-start gap-3 rounded-[16px] border border-[#e4e4e7] bg-white p-4 font-figtree">
      <div className="flex w-full flex-col gap-1.5">
        <p className="text-[12px] font-medium leading-[18px] text-[#3f3f47]">Phone number</p>
        <HelpTextField
          className="w-full"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="98765 43210"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          helper="Any number we can call. It doesn’t need WhatsApp."
          error={showErrors ? phoneError : undefined}
          leftIcon={
            <span className="relative block size-5 shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/customer/help/input-phone-guest.svg"
                alt=""
                width={21.5008}
                height={20.7502}
                className="absolute left-[-0.75px] top-0 block max-w-none"
              />
            </span>
          }
        />
      </div>
      <HelpCheckbox checked={consent} onChange={setConsent}>
        I agree that Eventory can call me about this request. Only for this request, never for offers.
      </HelpCheckbox>
      {showErrors && !consent && (
        <p className="text-[11px] font-normal leading-[16px] text-[#c81e0d]">Tick the box so we can call you.</p>
      )}
      <HelpButton onClick={submit}>Request call back</HelpButton>
      {error && (
        <p role="alert" className="text-[12px] font-normal leading-[18px] text-[#c81e0d]">
          {error}
        </p>
      )}
    </div>
  );
}
