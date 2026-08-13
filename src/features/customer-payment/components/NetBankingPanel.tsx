"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronDown } from "lucide-react";

const BANKS = [
  { name: "HDFC Bank", image: "/images/customer/payment/hdfc.jpg" },
  { name: "ICICI Bank", image: "/images/customer/payment/icici.jpg" },
  { name: "SBI", image: "/images/customer/payment/sbi.jpg" },
  { name: "Axis Bank", image: "/images/customer/payment/axis.jpg" },
  { name: "Kotak Bank", image: "/images/customer/payment/kotak.jpg" },
  { name: "Yes Bank", image: "/images/customer/payment/yes.jpg" },
];

export default function NetBankingPanel() {
  const [selectedBank, setSelectedBank] = useState<string | null>(null);

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-col gap-4">
        <h3 className="font-figtree text-[15px] font-medium text-[#101828]">
          Popular Banks
        </h3>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {BANKS.map((bank) => (
            <button
              key={bank.name}
              type="button"
              onClick={() => setSelectedBank(bank.name)}
              className={`flex h-[94px] flex-col items-center justify-center gap-2 rounded-[8px] border p-4 transition-colors ${
                selectedBank === bank.name
                  ? "border-[#0F172A]"
                  : "border-[#D4D4D8] hover:border-[#9CA3AF]"
              }`}
            >
              <div className="relative h-8 w-8 shrink-0">
                <Image
                  src={bank.image}
                  alt={bank.name}
                  fill
                  className="rounded-[4px] object-cover"
                />
              </div>
              <span className="font-figtree text-[14px] font-medium text-[#101828]">
                {bank.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="font-figtree text-[15px] font-medium text-[#101828]">
          Search for other Banks
        </h3>
        <button
          type="button"
          className="flex h-12 w-full items-center justify-between rounded-[8px] border border-[#E5E5E5] px-4 font-figtree text-[14px] text-[#9CA3AF] transition-colors hover:border-[#9CA3AF]"
        >
          Select Bank
          <ChevronDown size={16} />
        </button>
      </div>
    </div>
  );
}
