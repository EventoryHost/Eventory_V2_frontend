// Loading state for the Cart page (Figma 3642:117855). Mirrors the real page's
// geometry — select-all row, cards with a photo block + text lines + a price
// row (checkbox outside each card on desktop), the "People also buy this"
// strip and the payment summary — so nothing jumps when the cart lands.

function Bar({ className }: { className: string }) {
  return <div className={`skeleton rounded-full ${className}`} />;
}

function Dot() {
  return <div className="skeleton h-4 w-4 shrink-0 rounded-md" />;
}

function CheckboxSkeleton() {
  return <div className="hidden h-5 w-5 shrink-0 rounded-[5px] border-[1.5px] border-[#A1A1AA] md:block" />;
}

function CartRowSkeleton() {
  return (
    <div className="flex items-center gap-4">
      <CheckboxSkeleton />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-3xl border border-[#E4E4E7] bg-white md:min-h-[165px] md:flex-row">
        <div className="skeleton h-40 w-full shrink-0 md:h-auto md:w-[226px]" />
        <div className="flex min-w-0 flex-1 flex-col gap-3 p-3 md:px-4 md:py-3">
          <div className="flex items-center justify-between gap-4">
            <Bar className="h-4 w-28" />
            <div className="flex items-center gap-1.5">
              <Dot />
              <Bar className="h-2.5 w-20" />
            </div>
          </div>
          <Bar className="h-2.5 w-3/5 md:w-[210px]" />
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <div className="flex items-center gap-2">
              <Dot />
              <Bar className="h-2.5 w-20" />
            </div>
            <div className="flex items-center gap-2">
              <Dot />
              <Bar className="h-2.5 w-24" />
            </div>
            <div className="hidden items-center gap-2 md:flex">
              <Dot />
              <Bar className="h-2.5 w-20" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Dot />
            <Bar className="h-2.5 w-16" />
          </div>
          <Bar className="h-2.5 w-3/4 md:w-32" />
          <div className="mt-auto flex items-center justify-between">
            <div className="skeleton h-4 w-14 rounded-md" />
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <Dot />
                <Bar className="h-2.5 w-8" />
              </div>
              <div className="flex items-center gap-1.5">
                <Dot />
                <Bar className="h-2.5 w-9" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AddonStripSkeleton() {
  return (
    <div className="pt-1">
      <p className="mb-4 font-figtree text-[13px] font-medium tracking-wider text-[#030303] uppercase">
        People also buy this
      </p>
      <div className="flex gap-3 overflow-hidden">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-[218px] w-[234px] shrink-0 overflow-hidden rounded-2xl border border-[#F2F2F2] bg-white md:w-[calc(25%-9px)]"
          >
            <div className="skeleton h-[120px] w-full" />
            <div className="flex flex-col gap-2 px-3 pt-3">
              <Bar className="h-2.5 w-20" />
              <Bar className="h-2 w-28" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function OrderSummarySkeleton() {
  return (
    <div className="flex flex-col gap-4 rounded-[24px] border border-[#E4E4E7] bg-white p-5">
      <div className="flex flex-col gap-1.5">
        <h2 className="font-figtree text-[16px] leading-6 font-semibold tracking-[-0.24px] text-[#030303]">
          Payment summary
        </h2>
        <Bar className="h-2 w-24" />
      </div>

      <div className="flex flex-col gap-2 pt-3">
        <div className="flex items-center gap-2">
          <div className="flex h-11 flex-1 items-center gap-2 rounded-2xl border border-[#E4E4E7] px-3">
            <Dot />
            <Bar className="h-2 w-20" />
          </div>
          <div className="h-11 w-[72px] shrink-0 rounded-2xl border border-[#FDE2E6]" />
        </div>
        <Bar className="mt-2 h-2 w-28" />
      </div>

      <div className="h-px w-full bg-[#E4E4E7]" />

      <div className="flex flex-col gap-4 pt-1">
        {[
          ["w-24", "w-10"],
          ["w-32", "w-8"],
          ["w-12", "w-8"],
        ].map(([left, right], index) => (
          <div key={index} className="flex items-center justify-between">
            <Bar className={`h-2 ${left}`} />
            <Bar className={`h-2 ${right}`} />
          </div>
        ))}
      </div>

      <div className="h-px w-full bg-[#E4E4E7]" />

      <div className="flex items-center justify-between">
        <Bar className="h-2.5 w-16" />
        <Bar className="h-2.5 w-14" />
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#E4E4E7]">
        <div className="flex flex-col gap-3 p-4">
          <div className="flex items-center gap-2">
            <div className="skeleton h-3 w-3 shrink-0 rounded-full" />
            <Bar className="h-2 w-24" />
          </div>
          <div className="flex items-center justify-between">
            <div className="skeleton h-5 w-[84px] rounded-md" />
            <Bar className="h-5 w-[76px]" />
          </div>
        </div>
        <div className="h-px w-full bg-[#E4E4E7]" />
        <div className="flex flex-col gap-2 px-4 py-4">
          <Bar className="h-2 w-full" />
          <Bar className="h-2 w-3/4" />
        </div>
      </div>

      <div className="flex h-11 w-full items-center justify-center rounded-full bg-[#F0596F]/40 font-figtree text-[16px] font-semibold text-white">
        Proceed to Book
      </div>

      <div className="flex items-start gap-2">
        <div className="skeleton mt-0.5 h-3 w-3 shrink-0 rounded-full" />
        <div className="flex flex-1 flex-col gap-1.5">
          <Bar className="h-2 w-full" />
          <Bar className="h-2 w-2/3" />
        </div>
      </div>

      <p className="font-figtree text-[14px] leading-5 font-medium text-[#030303]">See full payment schedule →</p>
    </div>
  );
}

export default function CartPageSkeleton() {
  return (
    <div
      className="flex flex-col items-start gap-8 lg:flex-row lg:gap-12"
      role="status"
      aria-busy="true"
      aria-label="Loading your cart"
    >
      <div className="flex w-full min-w-0 flex-col gap-5 lg:flex-1">
        <div className="mb-3 flex items-center gap-1.5">
          <CheckboxSkeleton />
          <Bar className="h-2.5 w-52" />
        </div>
        {Array.from({ length: 2 }).map((_, index) => (
          <CartRowSkeleton key={index} />
        ))}
        <AddonStripSkeleton />
      </div>
      <div className="w-full lg:sticky lg:top-24 lg:mt-[52px] lg:w-[388px] lg:shrink-0">
        <OrderSummarySkeleton />
      </div>
    </div>
  );
}
