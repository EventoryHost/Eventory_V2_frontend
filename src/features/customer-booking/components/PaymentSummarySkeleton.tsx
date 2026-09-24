// Mirrors PaymentSummary's own geometry (heading, coupon block, fee rows,
// grand total, CTA, cancellation note, schedule link) so the column doesn't
// jump when the real summary lands.
export default function PaymentSummarySkeleton() {
  return (
    <div
      role="status"
      aria-busy="true"
      className="w-full max-w-[360px] rounded-[24px] border border-[#E4E4E7] bg-white p-5"
    >
      <span className="sr-only">Loading summary…</span>
      <div className="flex w-full max-w-[318px] flex-col gap-4">
        <div className="flex flex-col gap-1">
          <div className="h-5 w-36 animate-pulse rounded bg-neutral-subtle" />
          <div className="h-4 w-28 animate-pulse rounded bg-neutral-subtle" />
        </div>

        <div className="flex flex-col gap-3">
          <div className="h-10 w-full animate-pulse rounded-2xl bg-neutral-subtle" />
          <div className="flex items-center gap-2">
            <div className="h-11 flex-1 animate-pulse rounded-[16px] bg-neutral-subtle" />
            <div className="h-11 w-[72px] shrink-0 animate-pulse rounded-xl bg-neutral-subtle" />
          </div>
        </div>

        <div className="h-px w-full bg-[#E4E4E7]" />

        <div className="flex flex-col gap-4">
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="flex items-center justify-between gap-3">
              <div className="h-4 w-36 animate-pulse rounded bg-neutral-subtle" />
              <div className="h-4 w-16 animate-pulse rounded bg-neutral-subtle" />
            </div>
          ))}
        </div>

        <div className="h-px w-full bg-[#E4E4E7]" />

        <div className="flex items-center justify-between">
          <div className="h-5 w-24 animate-pulse rounded bg-neutral-subtle" />
          <div className="h-5 w-20 animate-pulse rounded bg-neutral-subtle" />
        </div>

        <div className="h-11 w-full animate-pulse rounded-full bg-neutral-subtle" />

        <div className="flex items-start gap-2">
          <div className="mt-0.5 size-4 shrink-0 animate-pulse rounded-full bg-neutral-subtle" />
          <div className="flex flex-1 flex-col gap-1.5">
            <div className="h-3 w-full animate-pulse rounded bg-neutral-subtle" />
            <div className="h-3 w-2/3 animate-pulse rounded bg-neutral-subtle" />
          </div>
        </div>

        <div className="h-5 w-44 animate-pulse rounded bg-neutral-subtle" />
      </div>
    </div>
  );
}
