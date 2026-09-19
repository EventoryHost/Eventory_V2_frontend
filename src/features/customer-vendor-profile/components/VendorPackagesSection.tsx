"use client";

import Link from "next/link";
import type { Vendor } from "@/features/customer-vendors/types";
import VendorCard from "@/features/customer-vendors/components/VendorCard";
import SectionHeading from "./SectionHeading";

/**
 * "Event Packages" — the vendor's own Live packages.
 *
 * Reuses the listing's VendorCard rather than growing a second package-card
 * component: it is the same package, rendered the same way the customer
 * just saw it on /vendors, so the two cannot drift apart.
 */
export default function VendorPackagesSection({
  packages,
  total,
  vendorName,
  bookmarkedIds,
  onToggleBookmark,
}: {
  packages: Vendor[];
  total: number;
  vendorName: string;
  bookmarkedIds: ReadonlySet<string>;
  onToggleBookmark: (id: string) => void;
}) {
  return (
    <section className="flex flex-col gap-5">
      <SectionHeading>Event Packages</SectionHeading>

      {packages.length === 0 ? (
        <div className="rounded-[20px] border border-[#e4e4e7] bg-white px-6 py-12 text-center">
          <p className="font-figtree text-[16px] font-semibold text-neutral-primary">
            No packages listed yet
          </p>
          <p className="mt-1 font-figtree text-[14px] text-neutral-tertiary">
            {vendorName} hasn&apos;t published any packages. Send an enquiry to discuss your event
            directly.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {packages.map((pkg) => (
              <VendorCard
                key={pkg.id}
                vendor={pkg}
                isBookmarked={bookmarkedIds.has(pkg.id)}
                onToggleBookmark={onToggleBookmark}
                // These cards sit ON the vendor profile — the default
                // "vendor" target would just reload this same page.
                linkTo="package"
              />
            ))}
          </div>

          {/* Only when there are genuinely more than the grid shows — the
              listing page is where the rest live. */}
          {total > packages.length && (
            <Link
              href={`/vendors?q=${encodeURIComponent(vendorName)}`}
              className="self-center rounded-xl border border-[#e4e4e7] bg-white px-12 py-3.5 font-figtree text-[14px] font-bold text-neutral-primary transition-colors hover:border-brand-primary hover:text-brand-primary"
            >
              View all {total} packages
            </Link>
          )}
        </>
      )}
    </section>
  );
}
