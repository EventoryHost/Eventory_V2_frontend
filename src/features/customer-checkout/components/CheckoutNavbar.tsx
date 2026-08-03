"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { label: "Cart", href: "/booking-summary" },
  { label: "Contact Details", href: "/contact" },
  { label: "Payments", href: "/payment" },
];

export default function CheckoutNavbar() {
  const pathname = usePathname();

  return (
    <header className="w-full border-b border-black/10 bg-customer-bg">
      <div className="mx-auto grid max-w-7xl grid-cols-[1fr_auto_1fr] items-center px-4 py-4 sm:px-6 lg:px-16">
        <Link
          href="/"
          className="text-brand-primary font-semibold text-[22px] leading-[20px] tracking-[-0.03em]"
          style={{ fontFamily: "var(--font-lora)" }}
        >
          eventory
        </Link>

        <nav className="flex items-center gap-8">
          {TABS.map((tab) => {
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`pb-1 font-figtree text-[15px] font-medium transition-colors ${
                  isActive
                    ? "border-b-2 border-[#101828] text-[#101828]"
                    : "border-b-2 border-transparent text-[#6B7280] hover:text-[#101828]"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>

        <div />
      </div>
    </header>
  );
}
