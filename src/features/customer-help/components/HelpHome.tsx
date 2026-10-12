"use client";

import { useState } from "react";
import { formatPrice } from "@/features/customer-package-detail/utils/formatPrice";
import type { HelpPageContext } from "../helpContext";
import HelpAskBox from "./HelpAskBox";
import HelpPersonRow from "./HelpPersonRow";
import HelpSuggestionChip from "./HelpSuggestionChip";

// Figma "03 — Home" (node 2369:11049): 3.1 landing · 3.2 package page ·
// 3.3 after 9 PM. Suggestions sit right above the question box; the person
// route says it's offline after hours instead of promising 30 minutes.
type HelpHomeProps = {
  pageContext: HelpPageContext | null;
  isAfterHours: boolean;
  onAsk: (text: string) => void;
  onPhoto: (file: File) => void;
  onWhatsApp: () => void;
};

// Package titles carry a tagline after an em dash ("Marigold Stage &
// Mandap — Haldi Special"); the context chip shows only the name.
const shortName = (title: string) => title.split(/\s+[—–-]\s+/)[0];

function copyFor(ctx: HelpPageContext | null) {
  if (ctx?.kind === "package") {
    return {
      chip: shortName(ctx.packageName),
      title: "Questions about this package?",
      body: "The assistant answers from this package’s details. If the vendor has to confirm something, an Event Manager asks them for you.",
      suggestions: [
        "What’s included?",
        ctx.tokenAmount > 0
          ? `How does the ${formatPrice(ctx.tokenAmount)} token work?`
          : "How does the token work?",
        "Can I change the flower colours?",
        "Is this available on my date?",
      ],
      placeholder: "Ask about this package",
    };
  }
  return {
    chip: "Planning help",
    title: "What are you celebrating?",
    body: "Tell us the occasion, guest count and budget. We’ll suggest packages, or an Event Manager can put a shortlist together.",
    suggestions: [
      "Birthday decor under ₹25,000",
      "How does booking work?",
      "Put a shortlist together for me",
      "Do you serve my area?",
    ],
    placeholder: "Describe your event, or add a photo",
  };
}

export default function HelpHome({
  pageContext,
  isAfterHours,
  onAsk,
  onPhoto,
  onWhatsApp,
}: HelpHomeProps) {
  const [question, setQuestion] = useState("");
  const copy = copyFor(pageContext);

  return (
    <div className="flex w-full flex-col gap-5 px-4 pb-6 pt-4">
      <section className="flex w-full flex-col items-start gap-3 rounded-[16px] bg-[#fafafa] px-4 py-5 font-figtree">
        <span className="max-w-full truncate rounded-full border border-[#e4e4e7] bg-white px-2.5 py-1 text-[12px] font-normal leading-[18px] text-[#3f3f47]">
          {copy.chip}
        </span>
        <h3 className="text-[20px] font-medium leading-[28px] text-[#030303]">{copy.title}</h3>
        <p className="text-[14px] font-normal leading-[20px] text-[#71717b]">{copy.body}</p>
        <div className="flex w-full flex-col gap-1.5">
          <p className="text-[11px] font-normal uppercase leading-[16px] text-[#71717b]">Try asking</p>
          <div className="flex w-full flex-wrap gap-x-1.5 gap-y-2">
            {copy.suggestions.map((s) => (
              <HelpSuggestionChip key={s} label={s} onClick={() => onAsk(s)} />
            ))}
          </div>
        </div>
        <HelpAskBox
          value={question}
          onChange={setQuestion}
          placeholder={copy.placeholder}
          onSend={() => {
            onAsk(question.trim());
            setQuestion("");
          }}
          onPhoto={onPhoto}
        />
      </section>

      <section className="flex w-full flex-col gap-2 font-figtree">
        <div className="flex items-center gap-2">
          <span className="h-4 w-[3px] shrink-0 rounded-full bg-[#f0596f]" />
          <h4 className="text-[14px] font-normal leading-[20px] text-[#030303]">Talk to a person</h4>
        </div>
        {isAfterHours && (
          <p className="text-[12px] font-normal leading-[18px] text-[#71717b]">
            Our Event Managers are offline now. They’re back at 9 AM and reply to messages first.
          </p>
        )}
        <HelpPersonRow channel="whatsapp" isNight={isAfterHours} onClick={onWhatsApp} />
      </section>
    </div>
  );
}
