import Image from "next/image";

export type AddOnRowProps = {
  image: string;
  name: string;
  quantity: number;
  price: string;
  category: string;
  attributes: { label: string; value: string }[];
};

export default function AddOnRow({
  image,
  name,
  quantity,
  price,
  category,
  attributes,
}: AddOnRowProps) {
  return (
    <div className="flex w-full max-w-[569px] gap-3">
      <div className="relative h-[84px] w-[84px] shrink-0 overflow-hidden rounded-[12px]">
        <Image src={image} alt={name} fill className="object-cover" />
      </div>

      <div className="flex flex-1 flex-col gap-1.5">
        <div className="flex items-start justify-between gap-2">
          <span className="font-figtree text-[14px] font-semibold leading-[20px] text-[#030303]">
            {name} &times;{quantity}
          </span>
          <span className="shrink-0 font-figtree text-[14px] font-semibold leading-[20px] text-[#030303]">
            {price}
          </span>
        </div>

        <span className="font-figtree text-[12px] font-normal leading-[20px] text-[#71717B]">
          {category}
        </span>

        {attributes.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {attributes.map((attribute) => (
              <span
                key={attribute.label}
                className="flex w-fit items-center rounded-[12px] bg-[#F4F4F5] pt-2 pr-3 pb-2 pl-3 font-figtree text-[12px] font-semibold leading-[18px] text-[#030303]"
              >
                {attribute.label}: {attribute.value}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
