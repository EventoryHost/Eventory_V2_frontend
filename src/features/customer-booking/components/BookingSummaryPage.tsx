import BookingSummaryHeader from "./BookingSummaryHeader";
import BookingEntry, { type BookingEntryProps } from "./BookingEntry";
import PaymentSummary from "./PaymentSummary";
import CouponSection from "./CouponSection";
import PriceBreakdown from "./PriceBreakdown";
import TokenPaymentSection from "./TokenPaymentSection";
import PaymentActions from "./PaymentActions";

const INCLUDED_ITEMS = [
  "Professional sound system setup",
  "5-hour live DJ performance",
  "Pre-event song request coordination",
  "Nails ( 1 Set )",
  "Hair (4 people)",
  "LED lighting rig & stage effects",
  "Wireless mic for hosts (x2)",
  "Face Makeup ( 1 Bride , 3 Guests )",
  "Spa (1 Session)",
];

const ADD_ONS = [
  {
    image: "/images/customer/booking-summary/booking.jpg",
    title: "Fog Machine & Laser Add-on",
    price: "₹3,500",
  },
  {
    image: "/images/customer/booking-summary/booking.jpg",
    title: "Fog Machine & Laser Add-on",
    price: "₹3,500",
  },
];

const BOOKINGS: BookingEntryProps[] = Array.from({ length: 3 }, () => ({
  vendor: {
    avatar: "/images/customer/user-review.png",
    vendorName: "Vendor Name",
    rating: 4.9,
    reviewCount: 13,
  },
  package: {
    image: "/images/customer/booking-summary/booking.jpg",
    categoryLabel: "Makeup Artist",
    categoryIcon: "/images/customer/makeup.png",
    variantLabel: "Platinum Package Variant",
    title: "Bridal Ultra-Glow Signature Package",
    date: "12 Mar 2026",
    time: "16:00 – 21:00",
    location: "Guwahati, Assam",
    guestRange: "4-8 Customers",
    originalPrice: "₹45,000",
    price: "₹38,250",
  },
  included: {
    items: INCLUDED_ITEMS,
    specialRequest:
      "Bride prefers soft dewy airbrush finish. Arrive sharp at 6 AM.",
  },
  addOns: {
    addOns: ADD_ONS,
  },
  priceSummary: {
    rows: [
      { label: "Package Price", value: "₹38,250" },
      { label: "Items Added (4)", value: "₹6,750" },
      { label: "Add-ons (2)", value: "₹7,000" },
    ],
    subtotalLabel: "Vendor Subtotal",
    subtotalValue: "₹52,000",
  },
}));

export default function BookingSummaryPage() {
  return (
    <div className="mx-auto w-full max-w-[1320px] px-4 pt-8 pb-16 sm:px-6 lg:px-16">
      <BookingSummaryHeader />

      <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-start">
        <div className="flex w-full flex-col gap-8 lg:flex-1">
          {BOOKINGS.map((booking, i) => (
            <BookingEntry key={i} {...booking} />
          ))}
        </div>

        <div className="w-full lg:w-[424px] lg:shrink-0">
          <PaymentSummary vendorCount={BOOKINGS.length}>
            <CouponSection />
            <PriceBreakdown
              rows={[
                { label: "Subtotal ( 2 vendors )", value: "₹45,000" },
                { label: "GST (18%)", value: "₹2,550" },
                { label: "Convenience Fee (3%)", value: "₹250" },
              ]}
              grandTotalLabel="Grand Total"
              grandTotalValue="₹47,500"
            />
            <TokenPaymentSection percentageLabel="Token Amount (25%)" amount="₹5,000" />
            <PaymentActions />
          </PaymentSummary>
        </div>
      </div>
    </div>
  );
}
