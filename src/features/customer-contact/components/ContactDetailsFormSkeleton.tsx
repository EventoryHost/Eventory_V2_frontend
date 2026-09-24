// Mirrors ContactDetailsForm's card (name, phone + OTP pill, email) while
// the checkout session's contact prefill loads. Hidden from assistive tech —
// PaymentSummarySkeleton alongside it already announces the loading state.
export default function ContactDetailsFormSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="flex w-full max-w-[801px] flex-col gap-5 rounded-[24px] border border-[#E4E4E7] bg-white p-6"
    >
      <div className="flex flex-col gap-1">
        <div className="h-5 w-24 animate-pulse rounded bg-neutral-subtle" />
        <div className="h-4 w-64 max-w-full animate-pulse rounded bg-neutral-subtle" />
        <div className="mt-2 h-12 w-full animate-pulse rounded-[16px] bg-neutral-subtle" />
      </div>

      <div className="flex flex-col gap-1">
        <div className="h-5 w-36 animate-pulse rounded bg-neutral-subtle" />
        <div className="h-4 w-72 max-w-full animate-pulse rounded bg-neutral-subtle" />
        <div className="mt-2 flex gap-2">
          <div className="h-12 w-[72px] shrink-0 animate-pulse rounded-[16px] bg-neutral-subtle" />
          <div className="h-12 flex-1 animate-pulse rounded-[16px] bg-neutral-subtle" />
        </div>
        <div className="mt-2 h-[34px] w-36 animate-pulse rounded-full bg-neutral-subtle" />
      </div>

      <div className="flex flex-col gap-1">
        <div className="h-5 w-28 animate-pulse rounded bg-neutral-subtle" />
        <div className="h-4 w-64 max-w-full animate-pulse rounded bg-neutral-subtle" />
        <div className="mt-2 h-12 w-full animate-pulse rounded-[16px] bg-neutral-subtle" />
      </div>
    </div>
  );
}
