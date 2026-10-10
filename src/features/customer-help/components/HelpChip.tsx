import type { ReactNode } from "react";

// Figma "Chips" (filled). Selected = inverse #030303, un-selected = #f4f4f5.
// 1px stroke sits inside the 32px Figma box, hence py-[5px].
type HelpChipProps = {
  label: string;
  selected: boolean;
  onClick: () => void;
  leftIcon?: ReactNode;
};

export default function HelpChip({
  label,
  selected,
  onClick,
  leftIcon,
}: HelpChipProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`flex min-h-8 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full border py-[5px] font-figtree text-[14px] font-normal leading-[20px] ${
        leftIcon ? "pl-3 pr-4" : "px-4"
      } ${
        selected
          ? "border-[#09090b] bg-[#030303] text-[#fafafa]"
          : "border-[#f4f4f5] bg-[#f4f4f5] text-[#18181b]"
      }`}
    >
      {leftIcon}
      {label}
    </button>
  );
}
