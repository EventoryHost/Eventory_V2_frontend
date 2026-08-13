import Image from "next/image";
import { Star } from "lucide-react";

export type ReviewCardProps = {
  rating: number;
  quote: string;
  name: string;
  timeAgo: string;
  avatar: string;
  avatarBg?: string;
};

export default function ReviewCard({
  rating,
  quote,
  name,
  timeAgo,
  avatar,
  avatarBg = "#FBBF24",
}: ReviewCardProps) {
  return (
    <div className="flex w-[313px] h-[432px] flex-col justify-between rounded-[20px] border border-black/5 bg-[#FFEDEF] p-6">
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }, (_, i) => (
            <Star
              key={i}
              size={20}
              className={
                i < rating
                  ? "fill-[#EA1D3B] text-[#EA1D3B]"
                  : "fill-[#EA1D3B]/20 text-[#EA1D3B]/20"
              }
            />
          ))}
        </div>

        <p className="font-figtree text-[16px] font-medium leading-[24px] tracking-[0%] text-brand-950">
          {quote}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <span
          className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full"
          style={{ backgroundColor: avatarBg }}
        >
          <Image src={avatar} alt={name} fill className="object-cover" />
        </span>
        <div>
          <p className="font-figtree text-[16px] font-bold text-brand-950">
            {name}
          </p>
          <p className="font-figtree text-[14px] font-normal text-body-secondary">
            {timeAgo}
          </p>
        </div>
      </div>
    </div>
  );
}
