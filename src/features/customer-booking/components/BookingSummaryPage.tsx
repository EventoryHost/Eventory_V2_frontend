import BookingSummaryHeader from "./BookingSummaryHeader";
import VendorSummaryRow, { type VendorSummaryRowProps } from "./VendorSummaryRow";
import ServiceBookingCard, {
  type ServiceBookingCardProps,
} from "./ServiceBookingCard";
import PaymentSummary from "./PaymentSummary";

const SERVICES: ServiceBookingCardProps[] = Array.from({ length: 2 }, () => ({
  image: "/images/customer/booking-summary/service.jpg",
  categoryLabel: "Makeup Artist",
  categoryIcon: "/images/customer/makeup.png",
  vendorName: "Sharma Decorators",
  serviceName: "Mehendi Corner & Seating",
  packageTier: "Basic Package",
  date: "12 March, 2026",
  time: "01:00 PM - 05:00 PM",
  location: "Guwahati, Assam",
  eventType: "Birthday Party",
  cancellationNote: "Free cancellation till 1st March",
  price: "₹12,399",
}));

const VENDOR_GROUPS: { vendor: VendorSummaryRowProps }[] = Array.from(
  { length: 2 },
  () => ({
    vendor: {
      avatar: "/images/customer/booking-summary/decorators.jpg",
      vendorName: "Sharma Decorators",
      rating: 4.6,
      reviewCount: 142,
      eventsOnEventory: 38,
      packageCount: 2,
      subtotal: "₹77,400",
    },
  })
);

export default function BookingSummaryPage() {
  return (
    <div className="mx-auto w-full max-w-[1320px] px-4 pt-8 pb-16 sm:px-6 lg:px-16">
      <BookingSummaryHeader />

      <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-start">
        <div className="flex w-full flex-col gap-8 lg:flex-1">
          {VENDOR_GROUPS.map((group, i) => (
            <div key={i} className="flex w-full flex-col gap-4">
              <VendorSummaryRow {...group.vendor} />
              {SERVICES.map((service, j) => (
                <ServiceBookingCard key={j} {...service} />
              ))}
            </div>
          ))}
        </div>

        <div className="w-full lg:w-[424px] lg:shrink-0">
          <PaymentSummary
            vendorCount={2}
            packageCount={3}
            rows={[
              { label: "Total booking amount", value: "₹1,01,200" },
              { label: "Service & security fee", value: "₹2,024" },
              { label: "GST (18%)", value: "₹18,580" },
            ]}
            grandTotal="₹1,21,804"
            tokenAmount="₹12,000"
            cancellationNote="Free cancellation until 4 Mar 2026. Held safely by Eventory until your event."
            ctaLabel="Continue to Details"
            ctaHref="/contact"
          />
        </div>
      </div>
    </div>
  );
}
