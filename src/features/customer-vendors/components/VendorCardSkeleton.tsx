import type { ViewMode } from "../types";

function GridSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-[18px] border border-black/10 bg-white">
      <div className="h-[190px] w-full animate-pulse bg-neutral-subtle" />
      <div className="flex flex-col gap-3 p-4">
        <div className="h-5 w-24 animate-pulse rounded bg-neutral-subtle" />
        <div className="h-4 w-full animate-pulse rounded bg-neutral-subtle" />
        <div className="h-4 w-2/3 animate-pulse rounded bg-neutral-subtle" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-neutral-subtle" />
        <div className="mt-2 h-8 w-1/2 animate-pulse rounded bg-neutral-subtle" />
      </div>
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-[20px] border border-black/10 bg-white md:h-[260px] md:flex-row">
      <div className="h-[200px] w-full animate-pulse bg-neutral-subtle md:h-full md:w-[34%]" />
      <div className="flex flex-1 flex-col gap-3 p-5 md:p-6">
        <div className="h-4 w-40 animate-pulse rounded bg-neutral-subtle" />
        <div className="h-6 w-2/3 animate-pulse rounded bg-neutral-subtle" />
        <div className="h-4 w-1/3 animate-pulse rounded bg-neutral-subtle" />
        <div className="h-4 w-full animate-pulse rounded bg-neutral-subtle" />
        <div className="h-4 w-full animate-pulse rounded bg-neutral-subtle" />
      </div>
    </div>
  );
}

export default function VendorCardSkeletonGroup({
  view,
  count = 6,
}: {
  view: ViewMode;
  count?: number;
}) {
  if (view === "grid") {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: count }).map((_, index) => (
          <GridSkeleton key={index} />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <ListSkeleton key={index} />
      ))}
    </div>
  );
}
