import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import SuccessBanner from "./SuccessBanner";
import BookedVendorsList, {
  type BookedVendorItem,
} from "./BookedVendorsList";
import PaymentBreakdownCard from "./PaymentBreakdownCard";

const VENDORS: BookedVendorItem[] = [
  {
    vendorName: "Sharma Decorators",
    packageName: "Marigold Stage & Mandap",
    tier: "Standard",
    date: "12 Mar 2026",
    status: "booked",
  },
  {
    vendorName: "Sharma Decorators",
    packageName: "Mehendi Corner & Seating",
    tier: "Basic",
    date: "12 Mar 2026",
    status: "reserved",
  },
  {
    vendorName: "Roshan Lights & Sound",
    packageName: "Ambient Uplighting",
    tier: "Standard",
    date: "12 Mar 2026",
    status: "reserved",
  },
];

export default function BookingSuccessPage() {
  return (
    <div className="w-full bg-white">
      <div className="mx-auto flex w-full max-w-[1320px] flex-col gap-6 px-4 pt-8 pb-16 sm:px-6 lg:px-16">
        <SuccessBanner phone="+91 7978169449" email="surajk7978@gmail.com" />
        <BookedVendorsList vendors={VENDORS} />
        <PaymentBreakdownCard
          rows={[
            { label: "Paid today", value: "₹12,000" },
            { label: "Balance due 5 Mar 2026", value: "₹1,09,804" },
          ]}
          grandTotalLabel="Grand total"
          grandTotalValue="₹1,21,804"
        />

        <Link
          href="/events"
          className="flex w-fit items-center gap-2 font-figtree text-[15px] font-semibold text-[#F0596F]"
        >
          <ArrowLeft size={18} />
          Back to packages
        </Link>
      </div>
    </div>
  );
}
