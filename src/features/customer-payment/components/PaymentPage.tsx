import PaymentPageHeader from "./PaymentPageHeader";
import PaymentMethodTabs from "./PaymentMethodTabs";
import PaymentSummary from "@/features/customer-booking/components/PaymentSummary";
import CouponSection from "@/features/customer-booking/components/CouponSection";
import PriceBreakdown from "@/features/customer-booking/components/PriceBreakdown";
import TokenPaymentSection from "@/features/customer-booking/components/TokenPaymentSection";
import PaymentActions from "@/features/customer-booking/components/PaymentActions";

export default function PaymentPage() {
  return (
    <div className="mx-auto w-full max-w-[1320px] px-4 pt-8 pb-16 sm:px-6 lg:px-16">
      <PaymentPageHeader />

      <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-start">
        <div className="w-full lg:flex-1">
          <PaymentMethodTabs amountLabel="₹70,331" />
        </div>

        <div className="w-full lg:w-[424px] lg:shrink-0">
          <PaymentSummary vendorCount={2}>
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
            <TokenPaymentSection
              percentageLabel="Token Amount (25%)"
              amount="₹5,000"
            />
            <PaymentActions />
          </PaymentSummary>
        </div>
      </div>
    </div>
  );
}
