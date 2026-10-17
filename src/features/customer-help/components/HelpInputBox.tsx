"use client";

import { useLayoutEffect, useRef, type FormEvent } from "react";
import HelpIconButton from "./HelpIconButton";

// Shared rounded box behind "Help / Ask box" and "Help / Composer":
// camera · auto-growing text · send. Border turns #030303 once there's
// text (Ask box "Typing" / "Long").
const MAX_TEXT_HEIGHT = 240;

type HelpInputBoxProps = {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onPhoto?: (file: File) => void;
  placeholder: string;
  maxLength?: number;
};

export default function HelpInputBox({
  value,
  onChange,
  onSend,
  onPhoto,
  placeholder,
  maxLength,
}: HelpInputBoxProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const hasText = value.trim().length > 0;

  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, MAX_TEXT_HEIGHT)}px`;
  }, [value]);

  const submit = (e?: FormEvent) => {
    e?.preventDefault();
    if (hasText) onSend();
  };

  return (
    <form
      onSubmit={submit}
      className={`flex w-full items-center gap-1 rounded-[24px] border bg-white p-1.5 ${
        hasText ? "border-[#030303]" : "border-[#e4e4e7]"
      }`}
    >
      <HelpIconButton
        icon="/images/customer/help/camera.svg"
        label="Add a photo"
        onClick={() => fileRef.current?.click()}
      />
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onPhoto?.(file);
          e.target.value = "";
        }}
      />
      <div className="flex min-w-0 flex-1 px-0.5 py-2">
        <textarea
          ref={textareaRef}
          rows={1}
          value={value}
          maxLength={maxLength}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          className="block w-full resize-none bg-transparent font-figtree text-[14px] font-normal leading-[20px] text-[#030303] outline-none placeholder:text-[#9f9fa9]"
        />
      </div>
      <HelpIconButton
        type="submit"
        tone="brand"
        icon="/images/customer/help/arrow-up.svg"
        label="Send"
        disabled={!hasText}
      />
    </form>
  );
}
