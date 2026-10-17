"use client";

import HelpInputBox from "./HelpInputBox";

// Figma "Help / Ask box" (node 2369:10062). Grows up to 240px, 280-char
// limit; counter appears below from 240 chars and turns error colour at 280.
const LIMIT = 280;
const COUNTER_FROM = 240;

type HelpAskBoxProps = {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onPhoto?: (file: File) => void;
  placeholder?: string;
};

export default function HelpAskBox({
  value,
  onChange,
  onSend,
  onPhoto,
  placeholder = "Describe your event, or add a photo",
}: HelpAskBoxProps) {
  return (
    <div className="flex w-full flex-col gap-1">
      <HelpInputBox
        value={value}
        onChange={onChange}
        onSend={onSend}
        onPhoto={onPhoto}
        maxLength={LIMIT}
        placeholder={placeholder}
      />
      {value.length >= COUNTER_FROM && (
        <p
          className={`px-3 text-right font-figtree text-[11px] font-normal leading-[16px] ${
            value.length >= LIMIT ? "text-[#c81e0d]" : "text-[#71717b]"
          }`}
        >
          {value.length}/{LIMIT}
        </p>
      )}
    </div>
  );
}
