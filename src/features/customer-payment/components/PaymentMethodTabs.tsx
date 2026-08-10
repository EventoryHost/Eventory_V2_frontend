"use client";

import { useState } from "react";
import { QrCode, CreditCard, Landmark } from "lucide-react";
import UpiQrPanel from "./UpiQrPanel";
import CreditDebitCardPanel from "./CreditDebitCardPanel";
import NetBankingPanel from "./NetBankingPanel";

const TABS = [
  { key: "upi", label: "UPI / QR Code", icon: QrCode },
  { key: "card", label: "Credit & Debit Cards", icon: CreditCard },
  { key: "netbanking", label: "Net Banking", icon: Landmark },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export type PaymentMethodTabsProps = {
  amountLabel: string;
};

export default function PaymentMethodTabs({
  amountLabel,
}: PaymentMethodTabsProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("upi");

  return (
    <div className="w-full max-w-[868px] rounded-[12px] border border-[#E5E5E5]">
      <div className="flex items-center border-b border-[#E5E5E5]">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`flex flex-1 items-center justify-center gap-2 border-b-2 py-4 font-figtree text-[15px] font-medium transition-colors sm:flex-initial sm:px-8 ${
                isActive
                  ? "border-[#0F172A] text-[#0F172A]"
                  : "border-transparent text-[#6B7280] hover:text-[#101828]"
              }`}
            >
              <Icon size={18} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="p-6 sm:p-8">
        {activeTab === "upi" && <UpiQrPanel amountLabel={amountLabel} />}
        {activeTab === "card" && <CreditDebitCardPanel />}
        {activeTab === "netbanking" && <NetBankingPanel />}
      </div>
    </div>
  );
}
