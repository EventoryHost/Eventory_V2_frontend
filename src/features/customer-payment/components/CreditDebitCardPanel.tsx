"use client";

import { useState } from "react";

function CardField({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex w-full max-w-[389px] flex-col gap-1">
      <label className="font-figtree text-[15px] font-normal text-[#101828]">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-12 w-full rounded-[8px] border border-[#E5E5E5] px-4 font-figtree text-[14px] text-[#101828] placeholder:text-[#9CA3AF] outline-none transition-colors hover:border-[#9CA3AF] focus:border-[#0F172A]"
      />
    </div>
  );
}

export default function CreditDebitCardPanel() {
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardholderName, setCardholderName] = useState("");
  const [saveCard, setSaveCard] = useState(false);

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
        <CardField
          label="Card Number"
          placeholder="XXXX XXXX XXXX"
          value={cardNumber}
          onChange={setCardNumber}
        />
        <CardField
          label="Expiry Date"
          placeholder="MM/YY"
          value={expiry}
          onChange={setExpiry}
        />
        <CardField
          label="CVV"
          placeholder="***"
          value={cvv}
          onChange={setCvv}
        />
        <CardField
          label="Cardholder Name"
          placeholder="Full name as on card"
          value={cardholderName}
          onChange={setCardholderName}
        />
      </div>

      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={saveCard}
          onChange={(e) => setSaveCard(e.target.checked)}
          className="h-5 w-5 rounded-[6px] border border-[#D1D5DB] accent-[#0F172A]"
        />
        <span className="font-figtree text-[14px] font-normal text-[#374151]">
          Save Card for future payments
        </span>
      </label>
    </div>
  );
}
