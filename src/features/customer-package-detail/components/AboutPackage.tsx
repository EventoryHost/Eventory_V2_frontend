"use client";

import { useState } from "react";
import SectionHeading from "./SectionHeading";

const TRUNCATE_LENGTH = 220;

export default function AboutPackage({ text }: { text: string }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const canTruncate = text.length > TRUNCATE_LENGTH;
  const displayText = isExpanded || !canTruncate ? text : `${text.slice(0, TRUNCATE_LENGTH).trimEnd()}...`;

  return (
    <section id="about" className="border-t border-black/5 pt-8">
      <SectionHeading>About this package</SectionHeading>
      <p className="font-figtree text-[14px] leading-relaxed text-neutral-secondary">
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
