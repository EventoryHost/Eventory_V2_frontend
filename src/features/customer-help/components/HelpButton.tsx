import type { ButtonHTMLAttributes, ReactNode } from "react";

// Figma "Button" instances used across the Help components. Figma draws the
// 1px stroke inside the box, so vertical padding is 1px less than the
// token value to keep the same rendered height (sm 36px, md 44px).
const VARIANT = {
  primary: "border-transparent bg-[#f0596f] text-white",
  secondary: "border-[#030303] bg-transparent text-[#030303]",
  tertiary: "border-transparent bg-transparent text-[#030303]",
} as const;

const SIZE = {
  sm: "gap-2 px-5 py-[7px] text-[14px] leading-[20px]",
  md: "gap-2 px-6 py-[9px] text-[16px] leading-[24px]",
} as const;

type HelpButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof VARIANT;
  size?: keyof typeof SIZE;
  medium?: boolean;
  leftIcon?: ReactNode;
};

export default function HelpButton({
  variant = "primary",
  size = "sm",
  medium = false,
  leftIcon,
  className = "",
  type = "button",
  children,
  ...rest
}: HelpButtonProps) {
  return (
    <button
      type={type}
      className={`flex items-center justify-center whitespace-nowrap rounded-full border font-figtree ${
        medium ? "font-medium" : "font-normal"
      } ${VARIANT[variant]} ${SIZE[size]} ${leftIcon ? "pr-6" : ""} ${className}`}
      {...rest}
    >
      {leftIcon}
      {children}
    </button>
  );
}
