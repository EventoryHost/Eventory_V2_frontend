// src/features/customer-landing/components/Navbar.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { MapPin, ChevronDown, Menu, X } from "lucide-react";
import { useCustomerSession } from "@/features/customer-auth/hooks/useCustomerSession";
import { customerFirstName } from "@/features/customer-auth/utils/displayName";
import { useSelectedCity } from "../hooks/useSelectedCity";
import LocationPickerModal from "./LocationPickerModal";

const NAV_LINKS = [
  { label: "Events", hasDropdown: true, href: "/events" },
  { label: "Packages", hasDropdown: true, href: "/packages" },
  { label: "Vendor", hasDropdown: true, href: "/vendors" },
  { label: "Corporate", hasDropdown: true },
  { label: "EPP", hasDropdown: false },
];

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2">
      {/* next/image blocks local SVGs by default (dangerouslyAllowSVG isn't
          set) — plain img sidesteps that, same as hero-bg.svg elsewhere. */}
      <img src="/nav-logo.svg" alt="Eventory" width={28} height={28} />
      <span
        className="text-brand-primary font-semibold text-[22px] sm:text-[26px] leading-[20px] tracking-[-0.03em]"
        style={{ fontFamily: "var(--font-lora)" }}
      >
        Eventory
      </span>
    </Link>
  );
}

function CitySelect() {
  const { city, setCity } = useSelectedCity();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        className="flex items-center gap-1 text-brand-950 font-semibold text-[13px] leading-[20px]"
      >
        <MapPin size={16} className="shrink-0" />
        <span className="max-w-55 truncate" title={city ?? undefined}>
          {city ?? "Select City"}
        </span>
        <ChevronDown size={14} className="shrink-0" />
      </button>

      {isOpen && (
        <LocationPickerModal
          onClose={() => setIsOpen(false)}
          onSelect={(label) => setCity(label)}
        />
      )}
    </div>
  );
}

function NavLinks({ className = "" }: { className?: string }) {
  return (
    <>
      {NAV_LINKS.map((item) =>
        item.href ? (
          <Link
            key={item.label}
            href={item.href}
            className={`flex items-center gap-1 text-brand-950 font-semibold text-[14px] leading-[20px] tracking-[-0.01em] ${className}`}
          >
            {item.label}
            {item.hasDropdown && <ChevronDown size={14} />}
          </Link>
        ) : (
          <button
            key={item.label}
            type="button"
            className={`flex items-center gap-1 text-brand-950 font-semibold text-[14px] leading-[20px] tracking-[-0.01em] ${className}`}
          >
            {item.label}
            {item.hasDropdown && <ChevronDown size={14} />}
          </button>
        )
      )}
    </>
  );
}

function CartIcon({ className }: { className?: string }) {
  return (
    <svg width="19" height="19" viewBox="0 0 19 19" fill="currentColor" className={className}>
      <path d="M6.24921 14.3752C7.28474 14.3752 8.12421 15.2147 8.12421 16.2502C8.12405 17.2856 7.28464 18.1252 6.24921 18.1252C5.21379 18.1252 4.37437 17.2856 4.37421 16.2502C4.37421 15.2147 5.2137 14.3753 6.24921 14.3752ZM13.7492 14.3752C14.7847 14.3752 15.6242 15.2147 15.6242 16.2502C15.624 17.2856 14.7846 18.1252 13.7492 18.1252C12.7138 18.1252 11.8744 17.2856 11.8742 16.2502C11.8742 15.2148 12.7137 14.3753 13.7492 14.3752ZM6.24921 15.6252C5.90405 15.6253 5.62421 15.9051 5.62421 16.2502C5.62437 16.5953 5.90415 16.8752 6.24921 16.8752C6.59429 16.8752 6.87405 16.5953 6.87421 16.2502C6.87421 15.9051 6.59439 15.6252 6.24921 15.6252ZM13.7492 15.6252C13.4041 15.6253 13.1242 15.9051 13.1242 16.2502C13.1244 16.5953 13.4042 16.8752 13.7492 16.8752C14.0943 16.8752 14.374 16.5953 14.3742 16.2502C14.3742 15.9051 14.0944 15.6252 13.7492 15.6252ZM1.07636 2.29321C1.19081 1.96767 1.54768 1.79613 1.87323 1.9104L2.09101 1.98755C2.61911 2.17322 3.06741 2.32913 3.41816 2.50122C3.7852 2.68136 4.10036 2.9038 4.3371 3.25024C4.57187 3.59399 4.6693 3.97153 4.71405 4.38501C4.71721 4.41429 4.71818 4.44458 4.72089 4.47485H14.2404C14.9307 4.47485 15.6373 4.4745 16.217 4.5393C16.5081 4.57188 16.7968 4.62354 17.0519 4.71313C17.3023 4.80113 17.5779 4.94603 17.7736 5.20044C18.0915 5.61397 18.1475 6.09594 18.1174 6.58423C18.088 7.05901 17.9683 7.65237 17.8273 8.35864L17.8264 8.36157L17.4103 10.3831C17.2823 11.0043 17.1753 11.526 17.0373 11.9358C16.8937 12.3619 16.6944 12.737 16.3391 13.0266C15.9837 13.3162 15.5764 13.4358 15.1301 13.4905C14.7008 13.543 14.1679 13.5422 13.5334 13.5422H9.11444C7.97118 13.5422 7.04675 13.5435 6.32148 13.4407C5.57475 13.3348 4.94717 13.107 4.45234 12.5852C3.99738 12.1053 3.75399 11.5955 3.63202 10.884C3.51783 10.2173 3.50605 9.34408 3.50605 8.13403V5.86548C3.50605 5.24933 3.50511 4.83651 3.47089 4.51977C3.43815 4.21729 3.37998 4.06536 3.30487 3.95532C3.23152 3.84802 3.11974 3.74716 2.86737 3.62329C2.59847 3.49138 2.23272 3.36166 1.67694 3.16626L1.45917 3.09009C1.13369 2.97565 0.962211 2.61872 1.07636 2.29321ZM4.75605 5.86548V8.13403C4.75605 9.37445 4.77085 10.1323 4.86347 10.6731C4.9484 11.1684 5.09288 11.4446 5.35956 11.7258C5.58664 11.9651 5.90204 12.119 6.49726 12.2034C7.11441 12.2908 7.9342 12.2922 9.11444 12.2922H13.5334C14.1989 12.2922 14.6419 12.2903 14.9777 12.2493C15.2962 12.2103 15.4447 12.1428 15.549 12.0579C15.6533 11.9729 15.7502 11.8415 15.8527 11.5374C15.9608 11.2166 16.0513 10.7824 16.1857 10.1301L16.6017 8.10962C16.7495 7.36944 16.8465 6.87633 16.8693 6.50708C16.8913 6.15164 16.835 6.02951 16.7834 5.96216C16.7932 5.97479 16.7703 5.93941 16.6379 5.89282C16.5084 5.84733 16.3235 5.80902 16.0773 5.78149C15.5818 5.72613 14.9537 5.72485 14.2404 5.72485H4.75507C4.75509 5.771 4.75605 5.81807 4.75605 5.86548ZM7.81171 6.88403C8.15192 6.82652 8.47473 7.05555 8.53241 7.39575L8.97284 9.99438C9.03004 10.3343 8.80094 10.6572 8.46112 10.7151C8.12091 10.7727 7.79823 10.5425 7.74042 10.2024L7.29999 7.60473C7.24234 7.26444 7.47144 6.94173 7.81171 6.88403ZM13.0441 6.88403C13.3843 6.94181 13.6135 7.26449 13.5559 7.60473L13.1154 10.2024C13.0577 10.5425 12.7349 10.7726 12.3947 10.7151C12.0548 10.6573 11.8257 10.3344 11.883 9.99438L12.3234 7.39575C12.3811 7.05547 12.7038 6.82638 13.0441 6.88403Z" />
    </svg>
  );
}

function CartButton() {
  return (
    <Link
      href="/cart"
      className="flex items-center gap-1.5 rounded-full bg-customer-bg px-3 py-2 text-brand-950 font-semibold text-[14px] leading-[20px] tracking-[-0.01em]"
    >
      <CartIcon className="h-5 w-5" />
      <span className="hidden sm:inline">Cart</span>
    </Link>
  );
}

function SignupLoginLink({ className = "" }: { className?: string }) {
  const { isLoggedIn, session, isHydrated } = useCustomerSession();

  // Clicking this used to log the customer straight out — a destructive
  // action on the one control they'd reach for to get to their account.
  // It now opens the account dashboard, which is where Log Out lives.
  if (isHydrated && isLoggedIn && session) {
    return (
      <Link
        href="/account"
        title="Go to my account"
        className={`text-brand-950 font-semibold text-[14px] leading-[20px] tracking-[-0.02em] ${className}`}
      >
        Hi, {customerFirstName(session)}
      </Link>
    );
  }

  return (
    <Link
      href="/register"
      className={`text-brand-primary font-semibold text-[14px] leading-[20px] tracking-[-0.02em] ${className}`}
    >
      Signup/Login
    </Link>
  );
}

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    lastScrollY.current = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY <= 0) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY.current) {
        setIsVisible(false);
        setIsMenuOpen(false);
      } else if (currentScrollY < lastScrollY.current) {
        setIsVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
    <header
      className={`fixed top-[0.61px] inset-x-0 z-50 w-full border-b border-black/5 bg-customer-bg transition-transform duration-300 ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      {/*
        h-[71px] lives on this row, not the <header>, so the header still
        grows to fit the mobile dropdown panel below when it's open — a fixed
        height on <header> itself would make the border-bottom cut through
        the middle of that open panel instead of sitting at its true bottom.
      */}
      <div className="mx-auto flex h-[71px] max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* First div: logo + location */}
        <div className="flex items-center gap-6">
          <Logo />
          <div className="hidden lg:flex">
            <CitySelect />
          </div>
        </div>

        {/* Second div: nav links (desktop only) */}
        <nav className="hidden lg:flex items-center gap-8">
          <NavLinks />
        </nav>

        {/* Third div: cart + signup/login (desktop only). Cart comes first —
            that's the order in every frame of the design. */}
        <div className="hidden lg:flex items-center gap-2">
          <CartButton />
          <SignupLoginLink className="rounded-full px-4 py-2" />
        </div>

        {/* Mobile/tablet: cart + hamburger toggle */}
        <div className="flex items-center gap-4 lg:hidden">
          <CartButton />
          <button
            type="button"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen((open) => !open)}
            className="text-brand-950"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile/tablet dropdown panel */}
      {isMenuOpen && (
        <div className="lg:hidden border-t border-black/5 bg-customer-bg px-4 sm:px-6 py-4 flex flex-col gap-4">
          <CitySelect />
          <nav className="flex flex-col gap-4">
            <NavLinks />
          </nav>
          <SignupLoginLink className="pt-2 border-t border-black/5" />
        </div>
      )}
    </header>
    <div className="h-[71.61px] w-full" />
    </>
  );
}
