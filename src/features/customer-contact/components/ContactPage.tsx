import ContactPageHeader from "./ContactPageHeader";
import ContactDetailsForm from "./ContactDetailsForm";
import CoordinatorSection from "./CoordinatorSection";
import GstinToggleSection from "./GstinToggleSection";
import PaymentSummary from "@/features/customer-booking/components/PaymentSummary";

export default function ContactPage() {
  return (
    <div className="mx-auto w-full max-w-[1320px] px-4 pt-8 pb-16 sm:px-6 lg:px-16">
      <ContactPageHeader />

      <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-start">
        <div className="flex w-full flex-col gap-6 lg:flex-1">
          <ContactDetailsForm />
          <CoordinatorSection />
          <GstinToggleSection />
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
            ctaLabel="Continue to Payment"
            ctaHref="/payment"
          />
        </div>
      </div>
    </div>
  );
}
