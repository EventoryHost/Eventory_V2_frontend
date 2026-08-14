import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export type UpcomingEventListItemProps = {
  image: string;
  title: string;
  description: string;
  priceLabel: string;
};

export default function UpcomingEventListItem({
  image,
  title,
  description,
  priceLabel,
}: UpcomingEventListItemProps) {
  return (
    <div className="flex w-full items-center justify-between gap-4 rounded-[20px] border border-[#F1F1F1] py-4 pr-5 pl-4">
      <div className="flex min-w-0 items-center gap-4">
        <div className="relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-[12px]">
          <Image src={image} alt={title} fill className="object-cover" />
        </div>

        <div className="flex min-w-0 flex-col gap-1">
          <h3 className="font-figtree text-[16px] font-bold text-brand-950">
            {title}
          </h3>
          <p className="truncate font-figtree text-[14px] font-normal text-body-secondary">
            {description}
          </p>
          <p className="font-figtree text-[16px] font-semibold leading-[20px] tracking-[-0.01em] text-black">
            {priceLabel}
          </p>
        </div>
      </div>

      <Link
        href="/packages"
        className="flex shrink-0 items-center gap-2 font-figtree text-[14px] font-semibold text-brand-primary"
      >
        Explore Packages
        <ArrowRight size={16} />
      </Link>
    </div>
  );
}
