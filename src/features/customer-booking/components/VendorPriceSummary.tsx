export type VendorPriceSummaryProps = {
  rows: { label: string; value: string }[];
  subtotalLabel: string;
  subtotalValue: string;
};

export default function VendorPriceSummary({
  rows,
  subtotalLabel,
  subtotalValue,
}: VendorPriceSummaryProps) {
  return (
    <div className="w-full max-w-[822px] border-t border-[#E5E7EB]">
      <div className="flex flex-col gap-[10px] py-3 pr-4 pl-4">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex w-full max-w-[790px] items-center justify-between"
          >
            <span className="font-figtree text-[15px] font-normal text-[#374151]">
              {row.label}
            </span>
            <span className="font-figtree text-[15px] font-medium text-[#374151]">
              {row.value}
            </span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between rounded-[8px] border-t border-[#E5E7EB] bg-[#FFFBF5] pt-[13px] pr-4 pb-[13px] pl-4">
        <span className="font-figtree text-[15px] font-normal text-[#344054]">
          {subtotalLabel}
        </span>
        <span className="font-figtree text-[15px] font-semibold text-[#344054]">
          {subtotalValue}
        </span>
      </div>
    </div>
  );
}
