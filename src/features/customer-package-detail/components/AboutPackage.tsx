"use client";

import { useMemo, useState } from "react";
import SectionHeading from "./SectionHeading";
import { parseAboutText } from "../utils/parseAboutText";

const TRUNCATE_LENGTH = 220;
const MAX_VISIBLE_BULLETS = 5;

export default function AboutPackage({ text }: { text: string[] }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const parsed = useMemo(() => parseAboutText(text), [text]);

  if (parsed.kind === "bullets") {
    const canTruncate = parsed.items.length > MAX_VISIBLE_BULLETS;
    const visibleItems = isExpanded || !canTruncate ? parsed.items : parsed.items.slice(0, MAX_VISIBLE_BULLETS);

    return (
      <section id="about" className="border-t border-black/5 pt-8">
        <SectionHeading>About this package</SectionHeading>
        {parsed.intro && (
          <p className="mb-3 font-figtree text-[14px] leading-relaxed text-neutral-secondary">{parsed.intro}</p>
        )}
        <ul className="list-disc space-y-1.5 pl-5 font-figtree text-[14px] leading-relaxed text-neutral-secondary">
          {visibleItems.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
        {canTruncate && (
          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            className="mt-2 font-figtree text-[14px] font-semibold text-brand-950 underline"
          >
            {isExpanded ? "Read less" : "Read more"}
          </button>
        )}
      </section>
    );
  }

  const canTruncate = parsed.text.length > TRUNCATE_LENGTH;
  const displayText = isExpanded || !canTruncate ? parsed.text : `${parsed.text.slice(0, TRUNCATE_LENGTH).trimEnd()}...`;

  return (
    <section id="about" className="border-t border-black/5 pt-8">
      <SectionHeading>About this package</SectionHeading>
      {/* whitespace-pre-line keeps the vendor's own paragraph breaks (blank
          lines) and single line breaks instead of collapsing everything onto
          one line — real structure, not reformatted. */}
      <p className="font-figtree text-[14px] leading-relaxed whitespace-pre-line text-neutral-secondary">
        {displayText}{" "}
        {canTruncate && (
          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            className="font-semibold text-brand-950 underline"
          >
            {isExpanded ? "Read less" : "Read more"}
          </button>
        )}
      </p>
    </section>
  );
}
