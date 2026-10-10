// Figma "Chips" outline / un-selected — the "Try asking" suggestions on
// the Help home. 1px stroke sits inside the 32px Figma box, hence py-[5px].
type HelpSuggestionChipProps = {
  label: string;
  onClick: () => void;
};

export default function HelpSuggestionChip({ label, onClick }: HelpSuggestionChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-8 shrink-0 items-center justify-center whitespace-nowrap rounded-full border border-[#71717b] bg-transparent px-4 py-[5px] font-figtree text-[14px] font-normal leading-[20px] text-[#71717b] transition-colors hover:border-[#030303] hover:text-[#030303]"
    >
      {label}
    </button>
  );
}
