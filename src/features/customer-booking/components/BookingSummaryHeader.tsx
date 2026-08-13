export default function BookingSummaryHeader() {
  return (
    <div className="flex max-w-[868px] flex-col gap-[5px]">
      <h1 className="font-figtree text-[28px] sm:text-[32px] font-bold leading-[1.2] text-[#101828]">
        Review your Booking
      </h1>
      <p className="font-figtree text-[16px] font-normal text-body-secondary">
        Open a package to see its pricing breakdown, or view full details.
      </p>
    </div>
  );
}
