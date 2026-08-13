import Image from "next/image";
import { ArrowRight } from "lucide-react";

export type EventPackageCardProps = {
  image: string;
  avatars: string[];
  bookedLabel: string;
  badge?: string;
  title: string;
  description: string;
};

function TrendingTagIcon({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  return (
    <svg
      role="img"
      aria-label={label}
      xmlns="http://www.w3.org/2000/svg"
      width="117"
      height="24"
      viewBox="0 0 117 24"
      fill="none"
      className={className}
    >
      <path
        d="M117 0C117 0 113 1 109.5 9C108.191 11.9911 107.232 14.8424 106.544 17.2403C105.446 21.067 102.043 24 98.0616 24H18.9384C14.9572 24 11.5538 21.067 10.4558 17.2403C9.76771 14.8424 8.80859 11.9911 7.5 9C4 1 0 0 0 0H117Z"
        fill="white"
      />
      <path
        d="M30.688 16V9.1H28.168V7.6H34.84V9.1H32.332V16H30.688ZM35.7998 16V7.6H38.9198C39.5118 7.6 40.0358 7.716 40.4918 7.948C40.9478 8.18 41.3038 8.5 41.5598 8.908C41.8158 9.308 41.9438 9.776 41.9438 10.312C41.9438 10.864 41.7958 11.352 41.4998 11.776C41.2038 12.192 40.8158 12.508 40.3358 12.724L42.2798 16H40.4198L38.7038 13.024C38.6558 13.024 38.6038 13.024 38.5478 13.024C38.4998 13.024 38.4478 13.024 38.3918 13.024H37.4438V16H35.7998ZM37.4438 11.524H38.9318C39.1798 11.524 39.3998 11.472 39.5918 11.368C39.7918 11.264 39.9478 11.12 40.0598 10.936C40.1798 10.752 40.2398 10.544 40.2398 10.312C40.2398 9.952 40.1078 9.66 39.8438 9.436C39.5878 9.212 39.2558 9.1 38.8478 9.1H37.4438V11.524ZM43.4142 16V7.6H48.7302V9.1H45.0582V11.008H48.2262V12.472H45.0582V14.5H48.7782V16H43.4142ZM50.3606 16V7.6H52.0766L56.1806 13.24V7.6H57.8126V16H56.1806L52.0046 10.252V16H50.3606ZM59.5218 16V7.6H62.2098C63.0658 7.6 63.8218 7.78 64.4778 8.14C65.1418 8.5 65.6578 8.996 66.0258 9.628C66.4018 10.252 66.5898 10.976 66.5898 11.8C66.5898 12.616 66.4018 13.34 66.0258 13.972C65.6578 14.604 65.1418 15.1 64.4778 15.46C63.8218 15.82 63.0658 16 62.2098 16H59.5218ZM61.1658 14.464H62.2098C62.5938 14.464 62.9498 14.396 63.2778 14.26C63.6058 14.124 63.8898 13.936 64.1298 13.696C64.3778 13.456 64.5698 13.176 64.7058 12.856C64.8418 12.528 64.9098 12.176 64.9098 11.8C64.9098 11.424 64.8418 11.076 64.7058 10.756C64.5698 10.428 64.3778 10.144 64.1298 9.904C63.8898 9.664 63.6058 9.476 63.2778 9.34C62.9498 9.204 62.5938 9.136 62.2098 9.136H61.1658V14.464ZM67.8042 16V7.6H69.4482V16H67.8042ZM71.1529 16V7.6H72.8689L76.9729 13.24V7.6H78.6049V16H76.9729L72.7969 10.252V16H71.1529ZM84.2142 16.144C83.3582 16.144 82.5982 15.96 81.9342 15.592C81.2782 15.216 80.7622 14.704 80.3862 14.056C80.0102 13.4 79.8222 12.648 79.8222 11.8C79.8222 10.952 80.0102 10.204 80.3862 9.556C80.7622 8.9 81.2782 8.388 81.9342 8.02C82.5982 7.644 83.3582 7.456 84.2142 7.456C84.7262 7.456 85.1982 7.532 85.6302 7.684C86.0622 7.836 86.4422 8.048 86.7702 8.32C87.1062 8.584 87.3862 8.888 87.6102 9.232L86.2662 10.072C86.1302 9.856 85.9502 9.664 85.7262 9.496C85.5102 9.328 85.2702 9.196 85.0062 9.1C84.7422 9.004 84.4782 8.956 84.2142 8.956C83.6862 8.956 83.2182 9.08 82.8102 9.328C82.4022 9.568 82.0822 9.9 81.8502 10.324C81.6182 10.748 81.5022 11.24 81.5022 11.8C81.5022 12.352 81.6142 12.844 81.8382 13.276C82.0702 13.708 82.3942 14.048 82.8102 14.296C83.2262 14.536 83.7062 14.656 84.2502 14.656C84.6582 14.656 85.0222 14.58 85.3422 14.428C85.6622 14.268 85.9182 14.048 86.1102 13.768C86.3022 13.488 86.4102 13.16 86.4342 12.784H84.4902V11.5H88.0182V12.52C88.0022 13.288 87.8302 13.944 87.5022 14.488C87.1742 15.024 86.7262 15.436 86.1582 15.724C85.5902 16.004 84.9422 16.144 84.2142 16.144Z"
        fill="#155DFC"
      />
    </svg>
  );
}

export default function EventPackageCard({
  image,
  avatars,
  bookedLabel,
  badge,
  title,
  description,
}: EventPackageCardProps) {
  return (
    <div className="flex h-[399px] w-[313px] shrink-0 flex-col overflow-hidden rounded-[24px] border border-[#F1F1F1] bg-white">
      <div className="relative h-[256px] w-[313px]">
        <Image src={image} alt="" fill className="object-cover" />

        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.7) 100%)",
          }}
        />

        {badge && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2">
            <TrendingTagIcon label={badge} />
          </div>
        )}

        <div className="absolute bottom-3 left-4 flex items-center">
          {avatars.map((avatar, i) => (
            <span
              key={i}
              className="relative h-6 w-6 overflow-hidden rounded-[47px] border border-white"
              style={i === 0 ? undefined : { marginLeft: "-12px" }}
            >
              <Image src={avatar} alt="" fill className="object-cover" />
            </span>
          ))}
          <span className="ml-2 font-figtree text-[13px] font-medium text-white">
            {bookedLabel}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 px-4 py-4">
        <h3 className="font-figtree text-[18px] font-bold text-brand-950">
          {title}
        </h3>
        <p className="font-figtree text-[14px] font-normal leading-[1.4] text-body-secondary line-clamp-2">
          {description}
        </p>
      </div>

      <button
        type="button"
        className="flex h-[45px] w-[313px] items-center justify-between gap-[10px] bg-[#F6F6F6] pt-[14px] pr-4 pb-[14px] pl-4"
      >
        <span className="font-figtree text-[14px] font-semibold text-brand-primary">
          Explore Packages
        </span>
        <ArrowRight size={16} className="text-brand-primary" />
      </button>
    </div>
  );
}
