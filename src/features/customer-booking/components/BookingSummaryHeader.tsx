import Link from "next/link";
import { ChevronRight } from "lucide-react";

const CRUMBS = [
  { label: "Home", href: "/" },
  { label: "Packages Page", href: "/packages" },
  { label: "Cart" },
];

export default function BookingSummaryHeader() {
  return (
    <div className="flex max-w-[868px] flex-col gap-3">
      <nav aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-1.5">
          {CRUMBS.map((crumb, index) => {
            const isLast = index === CRUMBS.length - 1;
            return (
              <li key={crumb.label} className="flex items-center gap-1.5">
                {index > 0 && <ChevronRight className="h-3 w-3 text-[#808080]" aria-hidden="true" />}
                {crumb.href && !isLast ? (
                  <Link
                    href={crumb.href}
                    className="font-figtree text-[12px] leading-[18px] tracking-[-0.01em] text-[#808080] transition-colors hover:text-brand-primary"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span
                    aria-current={isLast ? "page" : undefined}
                    className="font-figtree text-[12px] leading-[18px] tracking-[-0.01em] text-[#808080]"
                  >
                    {crumb.label}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>

      <div className="flex flex-col gap-[5px]">
        <h1 className="font-figtree text-[28px] leading-[36px] font-semibold tracking-[-0.42px] text-[#030303]">
          Cart
        </h1>
        <p className="font-figtree text-[14px] leading-[20px] font-normal text-[#3F3F47]">
          Open a package to see its pricing breakdown, or view full details.
        </p>
      </div>
    </div>
  );
}
