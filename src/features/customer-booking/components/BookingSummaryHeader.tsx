export default function BookingSummaryHeader() {
  return (
    <div className="flex max-w-[868px] flex-col gap-[5px]">
      <h1 className="font-figtree text-[28px] sm:text-[32px] font-bold leading-[1.2] text-[#101828]">
        Booking Summary
      </h1>
      <p className="font-figtree text-[16px] font-normal text-body-secondary">
        Enter your communication details to secure your vendor lineup.
      </p>
    </div>
  );
}
