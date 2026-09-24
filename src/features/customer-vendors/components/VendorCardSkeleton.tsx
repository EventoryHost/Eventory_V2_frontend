import type { ViewMode } from "../types";

// Mirrors VendorCard's own geometry (100px cover, overlapping 84px avatar,
// footer strip) so the layout doesn't jump when the real cards land.
function GridSkeleton() {
  return (
    <div className="relative flex h-[328px] flex-col overflow-hidden rounded-[20px] border border-[#e4e4e7] bg-white">
      <div className="h-[100px] w-full shrink-0 animate-pulse bg-neutral-subtle" />
      <div className="absolute top-[69px] left-[15px] size-[84px] animate-pulse rounded-full border-2 border-white bg-neutral-subtle" />
      <div className="flex flex-1 flex-col gap-3 px-[15px] pt-[61px]">
        <div className="flex flex-col gap-1">
          <div className="h-5 w-36 animate-pulse rounded bg-neutral-subtle" />
          <div className="h-4 w-24 animate-pulse rounded bg-neutral-subtle" />
        </div>
        <div className="h-px w-full bg-[#e4e4e7]" />
        <div className="flex items-center justify-between">
          <div className="h-9 w-32 animate-pulse rounded bg-neutral-subtle" />
          <div className="h-5 w-24 animate-pulse rounded-full bg-neutral-subtle" />
        </div>
      </div>
      <div className="mt-auto flex items-center border-t border-[#e4e4e7] px-4 py-2">
        <div className="h-5 w-2/3 animate-pulse rounded bg-neutral-subtle" />
      </div>
    </div>
  );
}

// Mirrors VendorListCard: 84px avatar beside the text block, a divider,
// the stat row, then the full-bleed location strip.
function ListSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-[20px] border border-[#e4e4e7] bg-white">
      <div className="flex flex-col gap-3 px-4 pt-5">
        <div className="flex gap-5">
          <div className="size-[84px] shrink-0 animate-pulse rounded-full bg-neutral-subtle" />
          <div className="flex flex-1 flex-col gap-2">
            <div className="h-6 w-56 animate-pulse rounded bg-neutral-subtle" />
            <div className="h-4 w-32 animate-pulse rounded bg-neutral-subtle" />
            <div className="mt-1 h-4 w-full max-w-[532px] animate-pulse rounded bg-neutral-subtle" />
            <div className="h-4 w-2/3 max-w-[532px] animate-pulse rounded bg-neutral-subtle" />
          </div>
        </div>
        <div className="h-px w-full bg-[#e4e4e7]" />
        <div className="flex items-center justify-between gap-4 pb-4">
          <div className="flex items-center gap-8">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="size-9 shrink-0 animate-pulse rounded-full bg-neutral-subtle" />
                <div className="flex flex-col gap-1">
                  <div className="h-5 w-16 animate-pulse rounded bg-neutral-subtle" />
                  <div className="h-3 w-20 animate-pulse rounded bg-neutral-subtle" />
                </div>
              </div>
            ))}
          </div>
          <div className="h-5 w-28 animate-pulse rounded-full bg-neutral-subtle" />
        </div>
      </div>
      <div className="flex items-center border-t border-[#e4e4e7] px-4 py-2">
        <div className="h-5 w-1/3 animate-pulse rounded bg-neutral-subtle" />
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
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: count }).map((_, index) => (
          <GridSkeleton key={index} />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {Array.from({ length: count }).map((_, index) => (
        <ListSkeleton key={index} />
      ))}
    </div>
  );
}
