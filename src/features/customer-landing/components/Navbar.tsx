// src/features/customer-landing/components/Navbar.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, ChevronDown, ShoppingCart, Menu, X } from "lucide-react";
import { useCustomerSession } from "@/features/customer-auth/hooks/useCustomerSession";
import { SUPPORTED_CITIES, useSelectedCity } from "../hooks/useSelectedCity";

const NAV_LINKS = [
  { label: "Packages", hasDropdown: true, href: "/packages" },
  { label: "Events", hasDropdown: true, href: "/events" },
  { label: "Vendor", hasDropdown: true, href: "/vendors" },
  { label: "Corporate", hasDropdown: true },
  { label: "EPP", hasDropdown: false },
];

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <Image
        src="/images/customer/ev-logo.png"
        alt="Eventory"
        width={28}
        height={28}
      />
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
        <MapPin size={16} />
        {city ?? "Select City"}
        <ChevronDown size={14} />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full z-10 mt-2 w-44 rounded-xl border border-black/5 bg-white py-2 shadow-lg">
          {SUPPORTED_CITIES.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                setCity(option);
                setIsOpen(false);
              }}
              className={`block w-full px-4 py-2 text-left font-figtree text-[13px] transition-colors hover:bg-brand-subtle ${
                option === city ? "font-semibold text-brand-primary" : "text-brand-950"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
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
      className="flex items-center gap-2 text-brand-950 font-semibold text-[14px] leading-[20px] tracking-[-0.01em]"
    >
      <ShoppingCart size={18} />
      <span className="hidden sm:inline">Cart</span>
    </Link>
  );
}

function SignupLoginLink({ className = "" }: { className?: string }) {
  const { isLoggedIn, session, isHydrated, logout } = useCustomerSession();

  if (isHydrated && isLoggedIn && session) {
    return (
      <button
        type="button"
        onClick={logout}
        title="Log out"
        className={`text-brand-950 font-semibold text-[14px] leading-[20px] tracking-[-0.02em] ${className}`}
      >
        Hi, {session.name?.split(" ")[0] ?? "there"}
      </button>
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

        {/* Third div: signup/login + cart (desktop only) */}
        <div className="hidden lg:flex items-center gap-6">
          <SignupLoginLink />
          <CartButton />
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
