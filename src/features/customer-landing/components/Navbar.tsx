// src/features/customer-landing/components/Navbar.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { MapPin, ChevronDown, ShoppingCart, Menu, X } from "lucide-react";
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

function CartButton() {
  return (
    <Link
      href="/cart"
      className="flex items-center gap-1.5 rounded-full bg-white px-3 py-2 text-brand-950 font-semibold text-[14px] leading-[20px] tracking-[-0.01em]"
    >
      <ShoppingCart size={20} />
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
