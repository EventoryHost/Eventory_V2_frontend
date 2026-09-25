// Loading state for the Review (Booking Summary) page — mirrors
// VendorSummaryRow/ServiceBookingCard's geometry (avatar + name row, then a
// 226px-tall image beside the details block) on the left and
// PaymentSummary's shape on the right, so nothing jumps when the real data
// lands. Replaces a plain "Loading…" spinner per the reference design.
function VendorRowSkeleton() {
  return (
    <div className="flex items-center gap-3">
      <div className="size-11 shrink-0 animate-pulse rounded-full bg-neutral-subtle" />
      <div className="flex flex-1 flex-col gap-2">
        <div className="h-4 w-40 animate-pulse rounded bg-neutral-subtle" />
        <div className="h-3 w-28 animate-pulse rounded bg-neutral-subtle" />
      </div>
    </div>
  );
}

function ServiceCardSkeleton() {
  return (
    <div className="flex w-full max-w-[799px] flex-col overflow-hidden rounded-[24px] border border-[#E4E4E7] bg-white">
      <div className="flex flex-col gap-4 sm:h-[246px] sm:flex-row">
        <div className="h-[220px] w-full shrink-0 animate-pulse bg-neutral-subtle sm:h-full sm:w-[226px]" />
        <div className="flex flex-1 flex-col justify-center gap-3 p-6 sm:py-4 sm:pr-6 sm:pl-0">
          <div className="h-6 w-24 animate-pulse rounded-full bg-neutral-subtle" />
          <div className="h-4 w-3/4 max-w-[320px] animate-pulse rounded bg-neutral-subtle" />
          <div className="h-3 w-1/2 max-w-[220px] animate-pulse rounded bg-neutral-subtle" />
          <div className="h-3 w-2/3 max-w-[260px] animate-pulse rounded bg-neutral-subtle" />
          <div className="h-5 w-24 animate-pulse rounded bg-neutral-subtle" />
        </div>
      </div>
    </div>
  );
}

function PaymentSummarySkeleton() {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-[#E4E4E7] bg-white p-6">
      <div className="h-5 w-32 animate-pulse rounded bg-neutral-subtle" />
      <div className="flex flex-col gap-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="h-3.5 w-24 animate-pulse rounded bg-neutral-subtle" />
            <div className="h-3.5 w-14 animate-pulse rounded bg-neutral-subtle" />
          </div>
        ))}
      </div>
      <div className="h-px w-full bg-[#E4E4E7]" />
      <div className="flex items-center justify-between">
        <div className="h-4 w-20 animate-pulse rounded bg-neutral-subtle" />
        <div className="h-4 w-16 animate-pulse rounded bg-neutral-subtle" />
      </div>
      <div className="mt-1 h-11 w-full animate-pulse rounded-full bg-neutral-subtle" />
      <div className="h-3 w-2/3 self-center animate-pulse rounded bg-neutral-subtle" />
    </div>
  );
}

export default function BookingSummarySkeleton() {
  return (
    <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-start">
      <div className="flex w-full flex-col gap-8 lg:flex-1">
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className="flex w-full flex-col gap-4">
            <VendorRowSkeleton />
            <ServiceCardSkeleton />
          </div>
        ))}
      </div>
      <div className="w-full lg:w-[424px] lg:shrink-0">
        <PaymentSummarySkeleton />
      </div>
    </div>
  );
}
