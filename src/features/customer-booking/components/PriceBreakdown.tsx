export type PriceBreakdownProps = {
  rows: { label: string; value: string }[];
  grandTotalLabel: string;
  grandTotalValue: string;
};

export default function PriceBreakdown({
  rows,
  grandTotalLabel,
  grandTotalValue,
}: PriceBreakdownProps) {
  return (
    <div className="flex w-full max-w-[376px] flex-col gap-2 pt-2">
      {rows.map((row) => (
        <div
          key={row.label}
          className="flex h-6 w-full max-w-[376px] items-center justify-between"
        >
          <span className="font-figtree text-[15px] font-normal leading-[24px] text-[#444748]">
            {row.label}
          </span>
          <span className="font-figtree text-[15px] font-medium leading-[24px] text-[#444748]">
            {row.value}
          </span>
        </div>
      ))}

      <div className="flex w-full max-w-[376px] items-center justify-between border-t border-[#E5E5E5] pt-2 pr-0">
        <span className="font-figtree text-[15px] font-bold leading-[24px] text-[#131414]">
          {grandTotalLabel}
        </span>
        <span className="font-figtree text-[20px] font-bold leading-[1.3] text-[#131414]">
          {grandTotalValue}
        </span>
      </div>
    </div>
  );
}
