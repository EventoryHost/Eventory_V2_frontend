/**
 * "We love to hear that. What made it exceptional?" (node 2023:8983) — the
 * chips under an event question once it's rated highly. With no onToggle it
 * shows only the picked chips, read-only, for an already-saved review.
 */
export default function HighlightChips({
  options,
  selected,
  onToggle,
}: {
  options: readonly string[];
  selected: string[];
  onToggle?: (option: string) => void;
}) {
  const readOnly = !onToggle;
  // Saved chips show exactly what was stored, even a label since dropped from the list.
  const shown = readOnly ? selected : options;
  if (readOnly && shown.length === 0) return null;

  return (
    <div className="flex flex-col gap-4">
      <p className="text-[16px] font-medium leading-6 text-[#3F3F47]">
        We love to hear that. What made it exceptional?
      </p>
      <div className="flex flex-wrap items-center gap-3">
        {shown.map((option) => {
          const isSelected = selected.includes(option);
          const className = `flex min-h-8 items-center justify-center whitespace-nowrap rounded-xl border px-5 py-[7px] text-[14px] font-medium leading-5 transition-colors ${
            isSelected
              ? "border-brand-primary bg-brand-primary text-[#FAFAFA]"
              : "border-[#FDEEF0] bg-[#F4F4F5] text-[#3F3F47]"
          }`;

          return readOnly ? (
            <span key={option} className={className}>
              {option}
            </span>
          ) : (
            <button
              key={option}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onToggle(option)}
              className={`${className} ${isSelected ? "hover:bg-[#E14E64]" : "hover:bg-[#EBEBEC]"}`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}
