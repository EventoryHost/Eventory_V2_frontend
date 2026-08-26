export type PriceBreakdownItem = {
  id: string;
  title: string;
  subtitle?: string;
  price: string;
};

export type PriceBreakdownAddon = {
  id: string;
  name: string;
  quantity: number;
  price: string;
};

export type PriceBreakdownContentProps = {
  items: PriceBreakdownItem[];
  addons: PriceBreakdownAddon[];
  subtotal: string;
  gstPercent: number;
  gstAmount: string;
  total: string;
};

export default function PriceBreakdownContent({
  items,
  addons,
  subtotal,
  gstPercent,
  gstAmount,
  total,
}: PriceBreakdownContentProps) {
  return (
    <div className="flex w-full max-w-[586px] flex-col gap-5">
      <div className="flex flex-col gap-4">
        {items.map((item) => (
          <div key={item.id} className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-0.5">
              <span className="font-figtree text-[14px] font-semibold leading-[20px] text-[#030303]">
                {item.title}
              </span>
              {item.subtitle && (
                <span className="font-figtree text-[12px] font-normal leading-[20px] text-[#71717B]">
                  {item.subtitle}
                </span>
              )}
            </div>
            <span className="shrink-0 font-figtree text-[14px] font-semibold leading-[20px] text-[#030303]">
              {item.price}
            </span>
          </div>
        ))}

        {addons.map((addon) => (
          <div key={addon.id} className="flex items-start justify-between gap-3">
            <span className="font-figtree text-[14px] font-normal leading-[20px] text-[#3F3F47]">
              {addon.name} &times;{addon.quantity}
            </span>
            <span className="shrink-0 font-figtree text-[14px] font-semibold leading-[20px] text-[#030303]">
              {addon.price}
            </span>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2 border-t border-[#E4E4E7] pt-4">
        <div className="flex items-center justify-between font-figtree text-[13px] leading-[20px] text-[#71717B]">
          <span>Subtotal</span>
          <span>{subtotal}</span>
        </div>
        <div className="flex items-center justify-between font-figtree text-[13px] leading-[20px] text-[#71717B]">
          <span>GST ({gstPercent}%)</span>
          <span>{gstAmount}</span>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-[#E4E4E7] pt-4">
        <span className="font-figtree text-[15px] font-semibold leading-[22.5px] text-[#030303]">
          Estimated total
        </span>
        <span className="font-figtree text-[18px] font-bold leading-[24px] text-[#030303]">{total}</span>
      </div>
    </div>
  );
}
