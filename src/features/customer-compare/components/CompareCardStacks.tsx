import Image from "next/image";
import { CheckCheck } from "lucide-react";
import type { AddonItem, IncludedItemEntry } from "@/features/customer-package-detail/types";
import { formatPrice } from "@/features/customer-vendors/utils/currency";

function detailValue(entry: IncludedItemEntry, label: string) {
  return entry.details.find((detail) => detail.label.toLowerCase() === label.toLowerCase())?.value;
}

/** "Setup Type: Outdoor · Item count: 3" — only the parts the vendor filled in. */
function setupMeta(entry: IncludedItemEntry) {
  const parts: string[] = [];
  const setupType = detailValue(entry, "Setup type");
  if (setupType) parts.push(`Setup Type: ${setupType}`);
  if (entry.items.length) parts.push(`Item count: ${entry.items.length}`);
  return parts.join(" · ");
}

/** One setup in the WHAT'S INCLUDED column (node 1200:2806). */
export function CompareSetupCard({ entry }: { entry: IncludedItemEntry }) {
  const meta = setupMeta(entry);
  const theme = entry.themeOptions?.join(", ") ?? detailValue(entry, "Theme");

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-[#E4E4E7] bg-white p-4">
      <div className="flex flex-col gap-1">
        <div className="flex flex-col gap-0.5">
          <p className="text-[14px] font-semibold leading-5 text-[#030303]">{entry.title}</p>
          {meta && <p className="text-[12px] leading-[18px] text-[#71717B]">{meta}</p>}
          {theme && <p className="text-[12px] font-medium leading-[18px] text-brand-primary">{theme}</p>}
        </div>
        {entry.price > 0 && (
          <p className="text-[16px] font-bold leading-6 text-[#030303]">{formatPrice(entry.price)}</p>
        )}
      </div>

      {entry.items.length > 0 && (
        <ul className="flex flex-col gap-2">
          {entry.items.map((line) => (
            <li key={line.id} className="flex items-center gap-2">
              <CheckCheck className="h-4 w-4 shrink-0 text-[#008236]" />
              <span className="text-[14px] leading-5 text-[#3F3F47]">
                {line.label}
                {line.qty > 1 ? ` × ${line.qty}` : ""}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** One add-on in the ADDONS column (node 1200:3024). */
export function CompareAddonCard({ addon }: { addon: AddonItem }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-[#E4E4E7] bg-white p-4">
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-[#F4F4F5]">
        {addon.image && <Image src={addon.image} alt={addon.title} fill sizes="64px" className="object-cover" />}
      </div>
      <div className="flex min-w-0 flex-col gap-0.5">
        <p className="truncate text-[14px] font-semibold leading-5 text-[#030303]">{addon.title}</p>
        {addon.subCategory && (
          <p className="truncate text-[12px] leading-[18px] text-[#71717B]">{addon.subCategory}</p>
        )}
        <p className="text-[14px] font-bold leading-5 text-[#030303]">
          {formatPrice(addon.price)}
          {addon.unitLabel && (
            <span className="text-[12px] font-normal text-[#71717B]"> {addon.unitLabel}</span>
          )}
        </p>
      </div>
    </div>
  );
}
