"use client";

import { useRef } from "react";

export default function OtpInputGroup({
  value,
  onChange,
  hasError,
}: {
  value: string;
  onChange: (value: string) => void;
  hasError: boolean;
}) {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  function updateDigit(index: number, raw: string) {
    const digits = raw.replace(/\D/g, "");

    if (digits.length > 1) {
      const next = digits.slice(0, 6);
      onChange(next);
      inputRefs.current[Math.min(next.length, 5)]?.focus();
      return;
    }

    const otpChars = value.padEnd(6, " ").split("");
    otpChars[index] = digits;
    const next = otpChars.join("").replace(/\s/g, "");
    onChange(next);
    if (digits && index < 5) inputRefs.current[index + 1]?.focus();
  }

  function handlePaste(event: React.ClipboardEvent<HTMLInputElement>) {
    event.preventDefault();
    const digits = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!digits) return;
    onChange(digits);
    inputRefs.current[Math.min(digits.length, 5)]?.focus();
  }

  function handleKeyDown(index: number, event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace" && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  return (
    <div className="grid grid-cols-6 gap-2">
      {Array.from({ length: 6 }).map((_, index) => (
        <input
          key={index}
          ref={(element) => {
            inputRefs.current[index] = element;
          }}
          autoFocus={index === 0}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          value={value[index] || ""}
          onChange={(event) => updateDigit(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onPaste={handlePaste}
          className={`h-11 w-full rounded-lg border bg-white text-center font-figtree text-[16px] font-semibold text-brand-950 outline-none transition-colors ${
            hasError
              ? "border-error-700"
              : "border-black/15 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
          }`}
        />
      ))}
    </div>
  );
}
