import type { ButtonHTMLAttributes } from "react";

// 32px round icon button with a 16px icon — tertiary (#f4f4f5) for back,
// close and camera; brand-filled for send.
type HelpIconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon: string;
  label: string;
  tone?: "tertiary" | "brand";
};

export default function HelpIconButton({
  icon,
  label,
  tone = "tertiary",
  className = "",
  type = "button",
  ...rest
}: HelpIconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      className={`flex size-8 shrink-0 items-center justify-center rounded-full disabled:cursor-not-allowed ${
        tone === "brand" ? "bg-[#f0596f]" : "bg-[#f4f4f5]"
      } ${className}`}
      {...rest}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={icon} alt="" width={16} height={16} className="block" />
    </button>
  );
}
