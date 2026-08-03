import BookingVendorCard, {
  type BookingVendorCardProps,
} from "./BookingVendorCard";
import BookingPackageSummary, {
  type BookingPackageSummaryProps,
} from "./BookingPackageSummary";
import WhatsIncludedSection, {
  type WhatsIncludedSectionProps,
} from "./WhatsIncludedSection";
import AddOnsSection, { type AddOnsSectionProps } from "./AddOnsSection";
import VendorPriceSummary, {
  type VendorPriceSummaryProps,
} from "./VendorPriceSummary";

export type BookingEntryProps = {
  vendor: Omit<BookingVendorCardProps, "children">;
  package: BookingPackageSummaryProps;
  included: WhatsIncludedSectionProps;
  addOns: AddOnsSectionProps;
  priceSummary: VendorPriceSummaryProps;
};

export default function BookingEntry({
  vendor,
  package: pkg,
  included,
  addOns,
  priceSummary,
}: BookingEntryProps) {
  return (
    <BookingVendorCard {...vendor}>
      <div className="flex w-full flex-col gap-6">
        <BookingPackageSummary {...pkg} />
        <WhatsIncludedSection {...included} />
        <AddOnsSection {...addOns} />
        <VendorPriceSummary {...priceSummary} />
      </div>
    </BookingVendorCard>
  );
}
