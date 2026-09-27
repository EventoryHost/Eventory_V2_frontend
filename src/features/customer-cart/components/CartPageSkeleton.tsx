// Loading state for the Cart page — mirrors VendorGroupCard/CartItemRow's
// geometry (thumbnail + two text lines + a price block) on the left and
// PaymentSummary's shape (title, line rows, CTA) on the right, so nothing
// jumps when the real cart lands. Replaces a plain "Loading…" spinner per
// the reference design.
function CartRowSkeleton() {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-[#e4e4e7] bg-white p-4">
      <div className="size-16 shrink-0 animate-pulse rounded-xl bg-neutral-subtle" />
      <div className="flex flex-1 flex-col gap-2">
        <div className="h-4 w-3/4 max-w-[280px] animate-pulse rounded bg-neutral-subtle" />
        <div className="h-3 w-1/2 max-w-[160px] animate-pulse rounded bg-neutral-subtle" />
      </div>
      <div className="flex shrink-0 flex-col items-end gap-2">
        <div className="h-4 w-16 animate-pulse rounded bg-neutral-subtle" />
        <div className="h-5 w-10 animate-pulse rounded-full bg-neutral-subtle" />
      </div>
    </div>
  );
}

function OrderSummarySkeleton() {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-[#e4e4e7] bg-white p-6">
      <div className="h-5 w-32 animate-pulse rounded bg-neutral-subtle" />
      <div className="flex flex-col gap-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="h-3.5 w-24 animate-pulse rounded bg-neutral-subtle" />
            <div className="h-3.5 w-14 animate-pulse rounded bg-neutral-subtle" />
          </div>
        ))}
      </div>
      <div className="h-px w-full bg-[#e4e4e7]" />
      <div className="flex items-center justify-between">
        <div className="h-4 w-20 animate-pulse rounded bg-neutral-subtle" />
        <div className="h-4 w-16 animate-pulse rounded bg-neutral-subtle" />
      </div>
      <div className="mt-1 h-11 w-full animate-pulse rounded-full bg-neutral-subtle" />
      <div className="h-3 w-2/3 self-center animate-pulse rounded bg-neutral-subtle" />
    </div>
  );
}

export default function CartPageSkeleton() {
  return (
    <div className="flex flex-col items-start gap-8 lg:flex-row">
      <div className="flex w-full flex-grow flex-col gap-5 lg:w-2/3">
        {Array.from({ length: 3 }).map((_, index) => (
          <CartRowSkeleton key={index} />
        ))}
      </div>
      <div className="w-full lg:sticky lg:top-24 lg:w-1/3">
        <OrderSummarySkeleton />
      </div>
    </div>
  );
}
