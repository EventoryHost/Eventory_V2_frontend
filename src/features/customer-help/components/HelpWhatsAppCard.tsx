"use client";

import { useState } from "react";
import { WHATSAPP_NUMBER } from "@/lib/whatsapp";
import HelpButton from "./HelpButton";

// Figma "Help / WhatsApp card" (node 2369:10206). The message is pre-filled
// with the question, page and ticket ID when one exists.
// Same number as every other WhatsApp button on the site (src/lib/whatsapp.ts),
// shown in the familiar "+91 98180 30600" grouping.
export const EVENTORY_WHATSAPP_NUMBER = `+${WHATSAPP_NUMBER.slice(0, 2)} ${WHATSAPP_NUMBER.slice(2, 7)} ${WHATSAPP_NUMBER.slice(7)}`;

export function buildWhatsAppHref(
  messageLines: string[],
  phoneNumber = EVENTORY_WHATSAPP_NUMBER,
) {
  return `https://wa.me/${phoneNumber.replace(/\D/g, "")}?text=${encodeURIComponent(
    messageLines.join("\n"),
  )}`;
}

type HelpWhatsAppCardProps = {
  /** Pre-filled message lines, e.g. greeting, "Page: …", "My question: …". */
  messageLines: string[];
  phoneNumber?: string;
};

export default function HelpWhatsAppCard({
  messageLines,
  phoneNumber = EVENTORY_WHATSAPP_NUMBER,
}: HelpWhatsAppCardProps) {
  const [copied, setCopied] = useState(false);
  const waHref = buildWhatsAppHref(messageLines, phoneNumber);

  const copyNumber = async () => {
    try {
      await navigator.clipboard.writeText(phoneNumber);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be blocked (insecure origin / permissions) — the
      // number is visible above, so there's nothing else to do.
    }
  };

  return (
    <div className="flex w-full flex-col overflow-hidden rounded-[16px] border border-[#e4e4e7] bg-white">
      <div className="flex w-full items-center gap-3 bg-[#fafafa] px-4 py-3.5">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#f0fdf4]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/customer/help/whatsapp.png"
            alt=""
            width={20}
            height={20}
            className="block size-5 object-cover"
          />
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5 font-figtree">
          <p className="text-[14px] font-medium leading-[20px] text-[#030303]">
            WhatsApp the Eventory team
          </p>
          <p className="text-[12px] font-normal leading-[18px] text-[#71717b]">
            The team replies 9 AM–9 PM.
          </p>
        </div>
      </div>

      <div className="flex w-full flex-col gap-3 px-4 pb-4 pt-3.5 font-figtree">
        <p className="text-[20px] font-semibold leading-[28px] text-[#030303]">
          {phoneNumber}
        </p>
        <p className="text-[12px] font-normal leading-[18px] text-[#3f3f47]">
          We’ll start the message for you
        </p>
        <div className="w-full rounded-[12px] bg-[#fafafa] px-3 py-2.5 text-[12px] font-normal leading-[18px] text-[#3f3f47]">
          {messageLines.map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
        <div className="flex w-full flex-col gap-1 rounded-[12px] bg-[#fafafa] px-3 py-2.5 text-[12px] font-normal leading-[18px]">
          <p className="text-[#3f3f47]">What happens next</p>
          <p className="text-[#71717b]">
            Our team replies on WhatsApp. Once they know what you need, they
            raise a request and pass it to an Event Manager with everything
            you’ve shared. It then shows up in Your chats.
          </p>
        </div>
        <div className="flex w-full flex-wrap gap-2">
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center whitespace-nowrap rounded-full border border-transparent bg-[#f0596f] px-5 py-[7px] text-[14px] font-normal leading-[20px] text-white"
          >
            Open WhatsApp
          </a>
          <HelpButton variant="secondary" onClick={copyNumber}>
            {copied ? "Copied" : "Copy number"}
          </HelpButton>
        </div>
        <p className="text-[11px] font-normal leading-[16px] text-[#71717b]">
          Bookings and payments still happen here on Eventory.
        </p>
      </div>
    </div>
  );
}
