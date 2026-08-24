"use client";

import { useState } from "react";
import { Zap, Tag, Home, Box } from "lucide-react";
import NetBankingPanel from "./NetBankingPanel";
import CreditDebitCardPanel from "./CreditDebitCardPanel";

const METHODS = [
  {
    key: "upi",
    icon: Zap,
    title: "UPI",
    badge: "Fastest",
    subtitle: "GPay, PhonePe, Paytm, any UPI app",
  },
  {
    key: "card",
    icon: Tag,
    title: "Credit / Debit card",
    subtitle: "Visa, Mastercard, RuPay",
  },
  {
    key: "netbanking",
    icon: Home,
    title: "Netbanking",
    subtitle: "All major Indian banks",
  },
  {
    key: "wallets",
    icon: Box,
    title: "Wallets",
    subtitle: "Paytm, Amazon Pay, Mobikwik",
  },
] as const;

type MethodKey = (typeof METHODS)[number]["key"];

const WALLETS = ["Paytm", "Amazon Pay", "Mobikwik"];

export default function PaymentMethodSelector() {
  const [selected, setSelected] = useState<MethodKey>("upi");
  const [selectedWallet, setSelectedWallet] = useState("Paytm");

  return (
    <div className="w-full max-w-[801px] rounded-[16px] border border-[#E4E4E7] bg-white">
      <div className="flex h-[67px] w-full max-w-[768px] items-center border-b border-[#E4E4E7] px-6">
        <h2 className="font-figtree text-[15px] font-bold text-[#030303]">
          How would you like to pay?
        </h2>
      </div>

      <div>
        {METHODS.map((method, i) => {
          const Icon = method.icon;
          const isSelected = selected === method.key;
          const isLast = i === METHODS.length - 1;

          return (
            <div
              key={method.key}
              className={isLast ? "" : "border-b border-[#E4E4E7]"}
            >
              <label className="flex min-h-[67px] w-full max-w-[768px] cursor-pointer items-center gap-3 px-6 py-4">
                <span
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => setSelected(method.key)}
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                    isSelected ? "border-[#F0596F]" : "border-[#D4D4D8]"
                  }`}
                >
                  {isSelected && (
                    <span className="h-2.5 w-2.5 rounded-full bg-[#F0596F]" />
                  )}
                </span>

                <input
                  type="radio"
                  name="payment-method"
                  checked={isSelected}
                  onChange={() => setSelected(method.key)}
                  className="sr-only"
                />

                <Icon size={18} className="shrink-0 text-[#71717B]" />

                <div className="flex flex-1 flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-figtree text-[14px] font-semibold leading-[20px] text-[#030303]">
                      {method.title}
                    </span>
                    {"badge" in method && method.badge && (
                      <span className="rounded-full bg-[#EFF6FF] px-2 py-0.5 font-figtree text-[11px] font-semibold text-[#1447E6]">
                        {method.badge}
                      </span>
                    )}
                  </div>
                  <span className="font-figtree text-[12px] font-normal leading-[18px] text-[#71717B]">
                    {method.subtitle}
                  </span>
                </div>
              </label>

              {isSelected && method.key === "upi" && (
                <div className="px-6 pb-5">
                  {/* Placeholder — UPI input/verify flow to be designed later */}
                  <input
                    type="text"
                    placeholder="yourname@upi"
                    className="h-12 w-full rounded-full border border-[#E4E4E7] px-4 font-figtree text-[15px] text-[#030303] placeholder:text-[#9CA3AF] outline-none"
                  />
                </div>
              )}

              {isSelected && method.key === "card" && (
                <div className="px-6 pb-5">
                  <CreditDebitCardPanel />
                </div>
              )}

              {isSelected && method.key === "netbanking" && (
                <div className="px-6 pb-5">
                  <NetBankingPanel />
                </div>
              )}

              {isSelected && method.key === "wallets" && (
                <div className="flex flex-wrap gap-3 px-6 pb-5">
                  {WALLETS.map((wallet) => {
                    const isWalletSelected = selectedWallet === wallet;
                    return (
                      <button
                        key={wallet}
                        type="button"
                        onClick={() => setSelectedWallet(wallet)}
                        className={`flex h-12 items-center justify-center rounded-full border px-6 font-figtree text-[15px] transition-colors ${
                          isWalletSelected
                            ? "border-[#F0596F] bg-[#FFF1F2] font-semibold text-[#030303]"
                            : "border-[#E4E4E7] font-normal text-[#030303]"
                        }`}
                      >
                        {wallet}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
