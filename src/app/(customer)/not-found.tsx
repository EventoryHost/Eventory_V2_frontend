// src/app/(customer)/not-found.tsx
//
// Scoped to the (customer) route group, so it renders nested inside
// (customer)/layout.tsx (Navbar/Footer/HelpWidget) instead of Next's bare
// default 404 — every `notFound()` call under this group (the package
// detail page, the vendor profile page) now lands on a branded "no longer
// available" page rather than a generic error.
//
// Deliberately generic wording ("no longer available"), not "not found":
// most real hits here are a vendor that's since gone Unlive/deactivated/
// under the profile-completion floor (see backend's customerVisibility.js),
// reached via an old cart line, wishlist entry, bookmark or shared link —
// "not found" reads like a broken URL, "no longer available" matches what
// actually happened.
import Link from "next/link";
import { PackageX } from "lucide-react";

export default function CustomerNotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-[480px] flex-col items-center justify-center gap-4 px-4 py-20 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-neutral-subtle">
        <PackageX className="h-6 w-6 text-neutral-tertiary" />
      </div>
      <div>
        <p className="font-figtree text-[18px] font-semibold text-neutral-primary">
          This is no longer available
        </p>
        <p className="mt-1 font-figtree text-[14px] text-neutral-tertiary">
          The package or vendor you're looking for has been removed or is no longer live. It may have been taken
          down by the vendor, or isn't currently accepting bookings.
        </p>
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/packages/browse"
          className="rounded-full bg-brand-primary px-6 py-2.5 font-figtree text-[14px] font-bold text-white transition-opacity hover:opacity-90"
        >
          Browse packages
        </Link>
        <Link
          href="/vendors"
          className="rounded-full border border-black/10 px-6 py-2.5 font-figtree text-[14px] font-semibold text-neutral-primary transition-colors hover:bg-neutral-subtle"
        >
          Browse vendors
        </Link>
      </div>
    </div>
  );
}
