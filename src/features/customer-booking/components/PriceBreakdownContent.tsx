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
  /** Real, separate flat charge (step3_policiesAndCharges.teamAndEquipment) — shown as its own line, same as PDP's PriceBreakdownDialog, rather than folded silently into subtotal. */
  teamAndEquipmentCharge?: string;
  subtotal: string;
  gstPercent: number;
  gstAmount: string;
  total: string;
};

// Same two text treatments throughout — labels/subtitles in the regular
// weight, values/titles/prices in the semibold one — matching PDP's own
// price breakdown dialog styling.
const NORMAL = "font-figtree text-[14px] leading-[22.75px] font-normal text-[#3F3F47]";
const BOLD = "font-figtree text-[14px] leading-[22.75px] font-semibold text-[#3F3F47]";

export default function PriceBreakdownContent({
  items,
  addons,
  teamAndEquipmentCharge,
  subtotal,
  gstPercent,
  gstAmount,
  total,
}: PriceBreakdownContentProps) {
  return (
    <div className="w-full max-w-[586px] rounded-2xl bg-[#F4F4F5] p-4">
      <div className="flex flex-col gap-4">
        {items.map((item) => (
          <div key={item.id} className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-0.5">
              <span className={BOLD}>{item.title}</span>
              {item.subtitle && <span className={NORMAL}>{item.subtitle}</span>}
            </div>
            <span className={`shrink-0 ${BOLD}`}>{item.price}</span>
          </div>
        ))}

        {addons.map((addon) => (
          <div key={addon.id} className="flex items-start justify-between gap-3">
            <span className={NORMAL}>
              {addon.name} &times;{addon.quantity}
            </span>
            <span className={`shrink-0 ${BOLD}`}>{addon.price}</span>
          </div>
        ))}

        {teamAndEquipmentCharge && (
          <div className="flex items-start justify-between gap-3">
            <span className={NORMAL}>Team &amp; equipment</span>
            <span className={`shrink-0 ${BOLD}`}>{teamAndEquipmentCharge}</span>
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-col gap-2 border-t border-[#E4E4E7] pt-4">
        <div className="flex items-center justify-between">
          <span className={NORMAL}>Subtotal</span>
          <span className={NORMAL}>{subtotal}</span>
        </div>
        {/* Only when the vendor actually configured GST on this package — a
            GST-free package resolves to 0% / a null amount. */}
        {gstPercent > 0 && (
          <div className="flex items-center justify-between">
            <span className={NORMAL}>GST ({gstPercent}%)</span>
            <span className={NORMAL}>{gstAmount}</span>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-[#E4E4E7] pt-4">
        <span className={BOLD}>Estimated total</span>
        <span className={BOLD}>{total}</span>
      </div>
    </div>
  );
}
