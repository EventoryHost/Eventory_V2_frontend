import Image from "next/image";

export type AddOnRowProps = {
  image: string;
  name: string;
  quantity: number;
  price: string;
  category?: string;
  attributes?: { label: string; value: string }[];
};

// Same layout as cart's AddedAddonRow — image left, title/category/color
// middle, price right — just without the increment/decrement/delete
// controls, since booking summary is read-only (editing happens back in
// cart/PDP, not here).
export default function AddOnRow({
  image,
  name,
  quantity,
  price,
  category = "",
  attributes = [],
}: AddOnRowProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative h-[84px] w-[84px] shrink-0 overflow-hidden rounded-xl bg-neutral-subtle">
        <Image src={image} alt={name} fill sizes="84px" className="object-cover" />
      </div>

      <div className="min-w-0 flex-1">
        <h5 className="truncate font-figtree text-[14px] leading-[20px] font-semibold text-[#030303]">
          {name} ×{quantity}
        </h5>
        {category && (
          <p className="mt-1 truncate font-figtree text-[12px] leading-[20px] text-[#71717B]">{category}</p>
        )}
        {attributes.map((attribute) => (
          <span
            key={attribute.label}
            className="mt-2 inline-flex items-center rounded-full border border-black/10 bg-white px-2.5 py-1 font-figtree text-[12px] leading-[18px] font-semibold text-[#030303]"
          >
            {attribute.label}: {attribute.value}
          </span>
        ))}
      </div>

      <p className="shrink-0 font-figtree text-[16px] leading-[20px] font-semibold text-[#030303]">{price}</p>
    </div>
  );
}
