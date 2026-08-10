import Image from "next/image";

export type SetupItem = {
  name: string;
  quantity: number;
  subtitle: string;
  requests: string[];
};

export type SetupArticleCardProps = {
  image: string;
  title: string;
  price: string;
  details: { label: string; value: string }[];
  items: SetupItem[];
};

export default function SetupArticleCard({
  image,
  title,
  price,
  details,
  items,
}: SetupArticleCardProps) {
  return (
    <div className="flex w-full max-w-[586px] flex-col gap-4 rounded-[24px] border border-[#E4E4E7] p-5">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative h-[180px] w-full shrink-0 overflow-hidden rounded-[16px] sm:h-[134px] sm:w-[179px]">
          <Image src={image} alt={title} fill className="object-cover" />
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex flex-wrap items-start justify-between gap-x-2 gap-y-1">
            <span className="font-figtree text-[16px] font-semibold leading-[24px] tracking-[-0.24px] text-[#030303]">
              {title}
            </span>
            <span className="shrink-0 font-figtree text-[14px] font-semibold leading-[20px] text-[#030303]">
              {price}
            </span>
          </div>

          {details.map((detail) => (
            <p
              key={detail.label}
              className="font-figtree text-[14px] font-normal leading-[24px]"
            >
              <span className="text-[#71717B]">{detail.label}: </span>
              <span className="text-[#3F3F47]">{detail.value}</span>
            </p>
          ))}
        </div>
      </div>

      <div className="h-px w-full bg-[#E4E4E7]" />

      <div className="flex flex-col gap-4">
        <span className="font-figtree text-[12px] font-medium tracking-[0.03em] text-[#71717B] uppercase">
          Items
        </span>

        {items.map((item, i) => (
          <div key={i} className="flex flex-col gap-1.5">
            <p className="font-figtree text-[14px] font-semibold leading-[20px] text-[#030303]">
              {item.name} &times;{item.quantity}
            </p>
            <p className="font-figtree text-[14px] font-normal leading-[20px] text-[#3F3F47]">
              {item.subtitle}
            </p>

            {item.requests.length > 0 && (
              <div className="mt-1 flex flex-col gap-2 rounded-[12px] bg-[#F4F4F5] p-4">
                <span className="font-figtree text-[12px] font-normal leading-[20px] text-[#1447E6]">
                  Requests
                </span>
                <ul className="flex flex-col gap-1">
                  {item.requests.map((request, j) => (
                    <li
                      key={j}
                      className="flex items-start gap-2 font-figtree text-[14px] font-normal leading-[18px] text-[#030303]"
                    >
                      <span className="text-[#3F3F47]">&bull;</span>
                      {request}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
