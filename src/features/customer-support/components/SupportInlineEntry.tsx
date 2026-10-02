"use client";

import { ChevronRight, Headphones } from "lucide-react";
import { TICKET_TYPES } from "../data/ticketTypes";
import { useSupport } from "../hooks/useSupport";
import type { SupportContext, TicketType } from "../types";
import { whatsappLinkForContext } from "../utils/whatsapp";
import { TYPE_ICON } from "./icons";
import { WhatsAppIcon } from "./ui";

/**
 * Page-specific support entry. Opens the Help panel already on the right
 * ticket type, with the page's registered context attached.
 *
 *  - "card":   bordered card with a title, line of copy, and optional WhatsApp button (PDP, booking pages)
 *  - "link":   inline text link ("Contact EMS Support" in cart/checkout)
 *  - "button": pill button (payment failed, header actions)
 */
export default function SupportInlineEntry({
  type,
  category,
  topic,
  variant = "card",
  title,
  description,
  whatsapp,
  className = "",
  testId,
}: {
  type: TicketType;
  category?: string;
  topic?: string;
  variant?: "card" | "link" | "button";
  title?: string;
  description?: string;
  /** Adds a direct WhatsApp button; the string is the message opener. */
  whatsapp?: string;
  className?: string;
  testId?: string;
}) {
  const { openSupport, context } = useSupport();
  const def = TICKET_TYPES[type];
  const Icon = TYPE_ICON[type];
  const label = title ?? def.label;
  const open = () => openSupport({ type, category, topic });

  if (variant === "link") {
    return (
      <button
        type="button"
        onClick={open}
        data-testid={testId}
        className={`flex items-center justify-center gap-2 font-figtree text-[14px] font-semibold text-brand-primary transition-colors hover:text-brand-primary/80 ${className}`}
      >
        <Headphones className="h-[18px] w-[18px]" /> {label}
      </button>
    );
  }

  if (variant === "button") {
    return (
      <button
        type="button"
        onClick={open}
        data-testid={testId}
        className={`flex items-center justify-center gap-2 rounded-full border border-[#E4E4E7] bg-white px-4 py-2 font-figtree text-[14px] font-semibold text-[#09090B] transition-colors hover:border-[#D4D4D8] ${className}`}
      >
        <Headphones className="h-4 w-4" /> {label}
      </button>
    );
  }

  return (
    <div className={`rounded-2xl border border-[#E4E4E7] bg-white p-4 ${className}`} data-testid={testId}>
      <button type="button" onClick={open} className="flex w-full items-center gap-3 text-left">
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
            type === "event_day_issue" ? "bg-[#C81E0D] text-white" : "bg-[#FDEEF0] text-[#F0596F]"
          }`}
        >
          <Icon className="h-5 w-5" strokeWidth={1.8} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-figtree text-[15px] font-bold text-[#09090B]">{label}</span>
          <span className="block font-figtree text-[12.5px] leading-[17px] text-[#71717B]">{description ?? def.description}</span>
        </span>
        <ChevronRight className="h-4 w-4 shrink-0 text-[#9F9FA9]" />
      </button>
      {whatsapp && (
        <a
          href={whatsappLinkForContext(context as SupportContext, whatsapp)}
          target="_blank"
          rel="noopener noreferrer"
          data-testid={testId ? `${testId}-whatsapp` : undefined}
          className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-full bg-[#00AB82] font-figtree text-[14px] font-semibold text-white transition-opacity hover:opacity-90"
        >
          <WhatsAppIcon className="h-[18px] w-[18px]" />
          Chat on WhatsApp
        </a>
      )}
    </div>
  );
}
