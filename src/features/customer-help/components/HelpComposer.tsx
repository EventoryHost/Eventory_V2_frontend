"use client";

import HelpInputBox from "./HelpInputBox";

// Figma "Help / Composer" (node 2369:10146). Bottom bar inside a thread;
// the parent hides it while a form (brief, notify) is open. Same 280-char
// limit as the ask box, the counter showing above from 240.
const LIMIT = 280;
const COUNTER_FROM = 240;

type HelpComposerProps = {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onPhoto?: (file: File) => void;
};

export default function HelpComposer(props: HelpComposerProps) {
  return (
    <div className="relative flex w-full items-center border-t border-[#e4e4e7] bg-white px-4 py-3">
      {props.value.length >= COUNTER_FROM && (
        <p
          className={`absolute right-[30px] top-[-18px] font-figtree text-[11px] font-normal leading-[16px] tabular-nums ${
            props.value.length >= LIMIT ? "text-[#c81e0d]" : "text-[#71717b]"
          }`}
        >
          {props.value.length}/{LIMIT}
        </p>
      )}
      <HelpInputBox {...props} maxLength={LIMIT} placeholder="Write a message" />
    </div>
  );
}
