import type { InputHTMLAttributes, ReactNode } from "react";

// Figma "Input Feild" → Text field + Helper Text. 44px tall (1px stroke
// inside the box, hence py-[11px]); error swaps the border and helper to
// #c81e0d.
type HelpTextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  leftIcon: ReactNode;
  helper?: string;
  error?: string;
};

export default function HelpTextField({
  leftIcon,
  helper,
  error,
  className = "",
  ...rest
}: HelpTextFieldProps) {
  const message = error ?? helper;
  return (
    <div className={`flex min-w-0 flex-col gap-1 ${className}`}>
      <label
        className={`flex items-center gap-4 rounded-[8px] border bg-white px-3.5 py-[11px] ${
          // The error border stays while typing the fix.
          error ? "border-[#c81e0d]" : "border-[#e4e4e7] focus-within:border-[#030303]"
        }`}
      >
        {leftIcon}
        <input
          className="min-w-0 flex-1 bg-transparent font-figtree text-[14px] font-normal leading-[20px] text-[#030303] outline-none placeholder:text-[#9f9fa9]"
          aria-invalid={error ? true : undefined}
          {...rest}
        />
      </label>
      {message && (
        <p
          className={`font-figtree text-[11px] font-normal leading-[16px] ${
            error ? "text-[#c81e0d]" : "text-[#71717b]"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
