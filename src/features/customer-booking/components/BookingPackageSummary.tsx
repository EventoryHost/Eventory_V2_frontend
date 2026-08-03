import Image from "next/image";
import { Calendar, Clock, MapPin, Users } from "lucide-react";

export type BookingPackageSummaryProps = {
  image: string;
  categoryLabel: string;
  categoryIcon: string;
  variantLabel: string;
  title: string;
  date: string;
  time: string;
  location: string;
  guestRange: string;
  originalPrice: string;
  price: string;
};

export default function BookingPackageSummary({
  image,
  categoryLabel,
  categoryIcon,
  variantLabel,
  title,
  date,
  time,
  location,
  guestRange,
  originalPrice,
  price,
}: BookingPackageSummaryProps) {
  return (
    <div className="flex w-full max-w-[828px] gap-6 py-5">
      <div className="relative h-[132px] w-[200px] shrink-0 overflow-hidden rounded-[8px]">
        <Image src={image} alt={title} fill className="object-cover" />
      </div>

      <div className="relative flex h-[132px] w-full max-w-[604px] items-start justify-between gap-4">
        <div className="flex w-[393px] flex-col gap-3">
          <div className="flex w-[393px] items-center gap-3">
            <div
              className="flex shrink-0 items-center gap-2 rounded-[52px] pt-1 pr-3 pb-1 pl-1"
              style={{
                background: "linear-gradient(to left, #FFE5E9, #ffffff)",
              }}
            >
              <Image
                src={categoryIcon}
                alt={categoryLabel}
                width={16}
                height={16}
                className="h-4 w-4 rounded-full object-contain"
              />
              <span className="font-figtree text-[12px] font-semibold text-brand-950 whitespace-nowrap">
                {categoryLabel}
              </span>
            </div>
            <span className="font-figtree text-[14px] font-medium text-blue-600">
              {variantLabel}
            </span>
          </div>

          <h3 className="w-[393px] font-figtree text-[20px] font-medium leading-[32px] text-[#101828]">
            {title}
          </h3>

          <div className="grid w-[295px] grid-cols-2 gap-x-8 gap-y-2">
            <span className="flex h-[21px] w-[124px] items-center gap-2 font-figtree text-[14px] font-medium text-body-secondary">
              <Calendar size={16} className="text-[#C2703D]" />
              {date}
            </span>
            <span className="flex h-[21px] w-[124px] items-center gap-2 font-figtree text-[14px] font-medium text-body-secondary">
              <Clock size={16} className="text-[#C2703D]" />
              {time}
            </span>
            <span className="flex h-[21px] w-[124px] items-center gap-2 font-figtree text-[14px] font-medium text-body-secondary">
              <MapPin size={16} className="text-[#C2703D]" />
              {location}
            </span>
            <span className="flex h-[21px] w-[124px] items-center gap-2 font-figtree text-[14px] font-medium text-body-secondary">
              <Users size={16} className="text-[#C2703D]" />
              {guestRange}
            </span>
          </div>
        </div>

        <div className="shrink-0 text-right">
          <p className="font-figtree text-[14px] font-normal text-[#9CA3AF] line-through">
            {originalPrice}
          </p>
          <p className="font-figtree text-[24px] font-bold text-[#16A34A]">
            {price}
          </p>
        </div>
      </div>
    </div>
  );
}
