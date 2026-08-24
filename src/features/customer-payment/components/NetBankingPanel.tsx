"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Check, ChevronDown } from "lucide-react";

const BANKS = [
  { name: "HDFC Bank", image: "/images/customer/payment/hdfc.jpg" },
  { name: "ICICI Bank", image: "/images/customer/payment/icici.jpg" },
  { name: "SBI", image: "/images/customer/payment/sbi.jpg" },
  { name: "Axis Bank", image: "/images/customer/payment/axis.jpg" },
  { name: "Kotak Bank", image: "/images/customer/payment/kotak.jpg" },
  { name: "Yes Bank", image: "/images/customer/payment/yes.jpg" },
  { name: "Bank of Baroda", image: "/images/banks/bob.png" },
  { name: "IDFC FIRST Bank", image: "/images/banks/idfc.png" },
  { name: "IndusInd Bank", image: "/images/banks/indusind.png" },
];

export default function NetBankingPanel() {
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selected = BANKS.find((bank) => bank.name === selectedBank);

  useEffect(() => {
    if (!isDropdownOpen) return;
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownOpen]);

  return (
    <div ref={dropdownRef} className="relative flex w-full flex-col gap-2">
      <h3 className="font-figtree text-[15px] font-medium text-[#101828]">Choose Bank</h3>
      <button
        type="button"
        onClick={() => setIsDropdownOpen((open) => !open)}
        aria-haspopup="listbox"
        aria-expanded={isDropdownOpen}
        className={`flex h-12 w-full items-center justify-between rounded-[8px] border px-4 font-figtree text-[14px] transition-colors ${
          selected ? "border-[#0F172A] text-[#101828]" : "border-[#E5E5E5] text-[#9CA3AF] hover:border-[#9CA3AF]"
        }`}
      >
        <span className="flex items-center gap-2">
          {selected && (
            <span className="relative h-5 w-5 shrink-0">
              <Image src={selected.image} alt="" fill className="rounded-[4px] object-cover" />
            </span>
          )}
          {selected ? selected.name : "Select Bank"}
        </span>
        <ChevronDown size={16} className={`transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
      </button>

      {isDropdownOpen && (
        <div
          role="listbox"
          className="absolute top-full z-10 mt-1 max-h-[280px] w-full overflow-y-auto rounded-[8px] border border-[#E5E5E5] bg-white shadow-lg"
        >
          {BANKS.map((bank) => (
            <button
              key={bank.name}
              type="button"
              role="option"
              aria-selected={selectedBank === bank.name}
              onClick={() => {
                setSelectedBank(bank.name);
                setIsDropdownOpen(false);
              }}
              className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left transition-colors hover:bg-[#F4F4F5]"
            >
              <span className="flex items-center gap-2">
                <span className="relative h-6 w-6 shrink-0">
                  <Image src={bank.image} alt={bank.name} fill className="rounded-[4px] object-cover" />
                </span>
                <span className="font-figtree text-[14px] text-[#101828]">{bank.name}</span>
              </span>
              {selectedBank === bank.name && <Check size={16} className="shrink-0 text-[#0F172A]" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
