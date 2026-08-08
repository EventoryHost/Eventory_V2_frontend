"use client";

import { useEffect } from "react";
import { X, Calendar, Clock, MapPin, Tag, Pencil } from "lucide-react";
import CollapsibleSection from "./CollapsibleSection";
import SetupArticleCard, {
  type SetupArticleCardProps,
} from "./SetupArticleCard";
import AddOnRow, { type AddOnRowProps } from "./AddOnRow";
import NotIncludedRow, {
  type NotIncludedRowProps,
} from "./NotIncludedRow";
import AllPoliciesContent from "./AllPoliciesContent";

const NOT_INCLUDED: NotIncludedRowProps[] = [
  { name: "Live catering staff", category: "Catering · Service staff" },
  { name: "Valet parking", category: "Logistics · On-ground service" },
  { name: "DJ & sound system", category: "Entertainment · Audio setup" },
];

const POLICIES = {
  cancellationRows: [
    { label: "Until 4 Mar 2026", value: "Free cancellation" },
    { label: "Until 9 Mar 2026", value: "50% refund" },
    { label: "After that", value: "No refund" },
  ],
  lastMinuteChanges:
    "Changes to items, colours or sizes are free until 7 days before the event. Inside 7 days, the vendor may accept a change if crew and stock allow; added items are billed at listing price.",
  refundAndPayment:
    "Refunds return to the original payment method within 5–7 working days of approval. The advance is adjusted first, then any balance already collected.",
  vendorPolicy:
    "The vendor needs venue access 4 hours before start time and a 15A power point on site. Teardown happens within 2 hours of the end time.",
};

const ADD_ONS: AddOnRowProps[] = [
  {
    image: "/images/customer/booking-summary/addon.jpg",
    name: "Photo booth corner",
    quantity: 1,
    price: "₹6,500",
    category: "Photography · Photo booth",
    attributes: [{ label: "Color", value: "Red" }],
  },
  {
    image: "/images/customer/booking-summary/addon.jpg",
    name: "Welcome drink station",
    quantity: 1,
    price: "₹4,200",
    category: "Catering · Beverage station",
    attributes: [{ label: "Flavor", value: "Mixed fruit" }],
  },
  {
    image: "/images/customer/booking-summary/addon.jpg",
    name: "Fog machine",
    quantity: 2,
    price: "₹3,500",
    category: "Effects · Stage effects",
    attributes: [{ label: "Duration", value: "2 hrs" }],
  },
];

const SETUP_ARTICLES: SetupArticleCardProps[] = [
  {
    image: "/images/customer/booking-summary/article.jpg",
    title: "Marigold stage backdrop",
    price: "₹24,000",
    details: [
      { label: "Decorating", value: "Stage backdrop (+1 more)" },
      { label: "Theme", value: "Marigold traditional" },
      { label: "Setup type", value: "Indoor" },
      { label: "Items", value: "2" },
    ],
    items: [
      {
        name: "Stage backdrop",
        quantity: 1,
        subtitle: "Structure · Frame backdrop · Marigold + white · 16 ft × 8 ft",
        requests: ["Add Flower type Jasmine", "Remove Flower type Marigold"],
      },
      {
        name: "Fairy-light curtain",
        quantity: 2,
        subtitle: "Lighting · Fairy lights · Warm white · 12 ft",
        requests: ["Add Flower type Jasmine", "Remove Flower type Marigold"],
      },
    ],
  },
  {
    image: "/images/customer/booking-summary/article.jpg",
    title: "Entrance floral arch",
    price: "₹18,500",
    details: [
      { label: "Decorating", value: "Entrance arch (+1 more)" },
      { label: "Theme", value: "Marigold traditional" },
      { label: "Setup type", value: "Outdoor" },
      { label: "Items", value: "2" },
    ],
    items: [
      {
        name: "Floral arch",
        quantity: 1,
        subtitle: "Structure · Frame arch · Marigold + white · 10 ft × 8 ft",
        requests: ["Add Flower type Jasmine", "Remove Flower type Marigold"],
      },
      {
        name: "Hanging lanterns",
        quantity: 4,
        subtitle: "Lighting · Lanterns · Warm white",
        requests: ["Add Flower type Jasmine", "Remove Flower type Marigold"],
      },
    ],
  },
];

export type ServiceDetailsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  vendorName: string;
  serviceName: string;
  packageTier: string;
  date: string;
  time: string;
  location: string;
  eventType: string;
  price: string;
  onEdit?: () => void;
};

export default function ServiceDetailsModal({
  isOpen,
  onClose,
  vendorName,
  serviceName,
  packageTier,
  date,
  time,
  location,
  eventType,
  price,
  onEdit,
}: ServiceDetailsModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:p-8">
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-10 flex w-full max-w-[640px] flex-col rounded-[24px] bg-white shadow-xl">
        <div className="relative flex flex-col gap-2 border-b border-[#E4E4E7] pt-5 pr-7 pb-5 pl-7">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute top-5 right-7 flex h-8 w-8 items-center justify-center rounded-full text-[#030303] transition-colors hover:bg-[#F4F4F5]"
          >
            <X size={20} />
          </button>

          <span className="font-figtree text-[12px] font-normal leading-[18px] text-[#71717B]">
            {vendorName}
          </span>

          <h2 className="pr-10 font-figtree text-[18px] font-semibold leading-[28px] tracking-[-0.27px] text-[#030303]">
            {serviceName} &middot; {packageTier}
          </h2>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-1.5">
            <span className="flex items-center gap-2 font-figtree text-[12px] font-normal leading-[18px] text-[#3F3F47]">
              <Calendar size={16} className="text-[#9F9FA9]" />
              {date}
            </span>
            <span className="flex items-center gap-2 font-figtree text-[12px] font-normal leading-[18px] text-[#3F3F47]">
              <Clock size={16} className="text-[#9F9FA9]" />
              {time}
            </span>
            <span className="flex items-center gap-2 font-figtree text-[12px] font-normal leading-[18px] text-[#3F3F47]">
              <MapPin size={16} className="text-[#9F9FA9]" />
              {location}
            </span>
            <span className="flex items-center gap-2 font-figtree text-[12px] font-normal leading-[18px] text-[#3F3F47]">
              <Tag size={16} className="text-[#9F9FA9]" />
              {eventType}
            </span>
          </div>

          <div className="mt-1 flex items-center justify-between">
            <span className="font-figtree text-[18px] font-semibold leading-[20px] text-[#030303]">
              {price}
            </span>

            <button
              type="button"
              onClick={onEdit}
              className="flex items-center gap-1.5 font-figtree text-[14px] font-semibold leading-[22px] text-[#F0596F]"
            >
              <Pencil size={14} />
              Edit Package
            </button>
          </div>
        </div>

        <div className="flex flex-col px-7">
          <CollapsibleSection label="Setups" count="2 setups">
            <div className="flex flex-col gap-4">
              {SETUP_ARTICLES.map((article, i) => (
                <SetupArticleCard key={i} {...article} />
              ))}
            </div>
          </CollapsibleSection>
          <CollapsibleSection label="Add-ons" count="3">
            <div className="flex flex-col gap-5">
              {ADD_ONS.map((addOn, i) => (
                <AddOnRow key={i} {...addOn} />
              ))}
            </div>
          </CollapsibleSection>
          <CollapsibleSection label="Not included" count="3">
            <div className="flex flex-col gap-4">
              {NOT_INCLUDED.map((item, i) => (
                <NotIncludedRow key={i} {...item} />
              ))}
            </div>
          </CollapsibleSection>
          <CollapsibleSection label="All policies" count="4">
            <AllPoliciesContent {...POLICIES} />
          </CollapsibleSection>
        </div>
      </div>
    </div>
  );
}
