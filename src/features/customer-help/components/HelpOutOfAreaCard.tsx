"use client";

import { useState } from "react";
import HelpButton from "./HelpButton";
import HelpCheckbox from "./HelpCheckbox";
import HelpTextField from "./HelpTextField";

// Figma "Help / Out-of-area card" (node 2369:10988). Shown when the
// customer's area isn't in the served-locality list; captures one WhatsApp
// message for when Eventory arrives. Guests type a number + consent;
// signed-in users reuse their account number.
type HelpOutOfAreaCardProps = {
  area: string;
  /** Signed-in user's account number; omit for guests. */
  accountPhone?: string;
  saved: boolean;
  onNotify: (phone: string) => void;
  onChatWithEventManager: () => void;
};

export default function HelpOutOfAreaCard({
  area,
  accountPhone,
  saved,
  onNotify,
  onChatWithEventManager,
}: HelpOutOfAreaCardProps) {
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const isGuest = !accountPhone;
  const phoneError =
    isGuest && phone.replace(/\D/g, "").length < 10
      ? "Enter a 10-digit mobile number."
      : undefined;
  const consentError = isGuest && !consent;

  const notify = () => {
    if (phoneError || consentError) {
      setShowErrors(true);
      return;
    }
    onNotify(accountPhone ?? phone);
  };

  if (saved) {
    return (
      <div className="flex w-full items-center gap-2 rounded-[16px] bg-[#f0fdf4] px-4 py-1.5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/customer/help/check-circle-saved.svg"
          alt=""
          width={16}
          height={16}
          className="block shrink-0"
        />
        <p className="flex-1 font-figtree text-[12px] font-normal leading-[18px] text-[#008236]">
          Saved. We’ll message you once when Eventory reaches {area}.
        </p>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col items-start gap-3 rounded-[16px] border border-[#e4e4e7] bg-white px-4 py-3.5 font-figtree">
      <p className="text-[14px] font-semibold leading-[20px] text-[#030303]">
        Notify me when Eventory begins serving {area}.
      </p>
      <p className="text-[12px] font-normal leading-[18px] text-[#71717b]">
        We’ll send one WhatsApp message when we start serving {area}. Nothing
        else.
      </p>

      {isGuest ? (
        <>
          <HelpTextField
            className="w-full"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="+91 98765 43210"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            error={showErrors ? phoneError : undefined}
            leftIcon={
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src="/images/customer/help/phone-input-icon.svg"
                alt=""
                width={20}
                height={20}
                className="block shrink-0"
              />
            }
          />
          <HelpCheckbox checked={consent} onChange={setConsent}>
            I agree that Eventory can message me on WhatsApp about this.
          </HelpCheckbox>
          {showErrors && consentError && (
            <p className="text-[11px] font-normal leading-[16px] text-[#c81e0d]">
              Tick the box so we can message you.
            </p>
          )}
        </>
      ) : (
        <p className="text-[12px] font-normal leading-[18px] text-[#71717b]">
          We’ll use {accountPhone} from your account.
        </p>
      )}

      <div className="flex w-full flex-wrap gap-2">
        <HelpButton
          variant="secondary"
          medium
          onClick={notify}
        >
          Notify me
        </HelpButton>
        <HelpButton variant="tertiary" medium onClick={onChatWithEventManager}>
          Chat with Event Manager
        </HelpButton>
      </div>
      <p className="text-[11px] font-normal leading-[16px] text-[#71717b]">
        Some vendors travel. An Event Manager can check for you.
      </p>
    </div>
  );
}
