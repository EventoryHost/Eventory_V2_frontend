"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

type SavedCard = {
  id: string;
  label: string;
  holder: string;
  network: string;
};

const SAVED_CARDS: SavedCard[] = [
  { id: "card-1", label: "SBI Credit Card ending in 1673", holder: "Suraj Kumar", network: "VISA" },
  { id: "card-2", label: "HDFC Debit Card ending in 4521", holder: "Suraj Kumar", network: "MASTERCARD" },
];

export default function CreditDebitCardPanel() {
  const [selectedCardId, setSelectedCardId] = useState<string | null>(SAVED_CARDS[0]?.id ?? null);
  const [isAddingNewCard, setIsAddingNewCard] = useState(SAVED_CARDS.length === 0);
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardholderName, setCardholderName] = useState("");
  const [saveCard, setSaveCard] = useState(false);

  return (
    <div className="flex w-full flex-col gap-4">
      {SAVED_CARDS.length > 0 && (
        <div className="flex flex-col gap-3">
          {SAVED_CARDS.map((card) => {
            const isSelected = selectedCardId === card.id;
            return (
              <label
                key={card.id}
                className={`flex h-12 w-full cursor-pointer items-center gap-3 rounded-[8px] border px-4 transition-colors ${
                  isSelected ? "border-[#F0596F] bg-[#FFF1F2]" : "border-[#E4E4E7] hover:border-[#9CA3AF]"
                }`}
              >
                <span
                  role="radio"
                  aria-checked={isSelected}
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                    isSelected ? "border-[#F0596F]" : "border-[#D4D4D8]"
                  }`}
                >
                  {isSelected && <span className="h-2.5 w-2.5 rounded-full bg-[#F0596F]" />}
                </span>
                <input
                  type="radio"
                  name="saved-card"
                  checked={isSelected}
                  onChange={() => setSelectedCardId(card.id)}
                  className="sr-only"
                />
                <span className="flex flex-1 flex-wrap items-center gap-x-1.5 font-figtree text-[14px]">
                  <span className="font-semibold text-[#030303]">{card.label}</span>
                  <span className="text-[#71717B]">&middot; {card.holder}</span>
                  <span className="font-bold text-[#1447E6]">{card.network}</span>
                </span>
              </label>
            );
          })}

          <button
            type="button"
            onClick={() => setIsAddingNewCard((v) => !v)}
            className="flex w-fit items-center gap-1.5 font-figtree text-[14px] font-semibold text-[#F0596F]"
          >
            <Plus size={16} />
            Add a new card
          </button>
        </div>
      )}

      {isAddingNewCard && (
        <div className="flex flex-col gap-3">
          <input
            type="text"
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
            placeholder="Card number"
            className="h-12 w-full rounded-[8px] border border-[#E4E4E7] px-4 font-figtree text-[15px] text-[#030303] placeholder:text-[#9CA3AF] outline-none focus:border-[#0F172A]"
          />

          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
              placeholder="MM / YY"
              className="h-12 w-full rounded-[8px] border border-[#E4E4E7] px-4 font-figtree text-[15px] text-[#030303] placeholder:text-[#9CA3AF] outline-none focus:border-[#0F172A]"
            />
            <input
              type="text"
              value={cvv}
              onChange={(e) => setCvv(e.target.value)}
              placeholder="CVV"
              className="h-12 w-full rounded-[8px] border border-[#E4E4E7] px-4 font-figtree text-[15px] text-[#030303] placeholder:text-[#9CA3AF] outline-none focus:border-[#0F172A]"
            />
          </div>

          <input
            type="text"
            value={cardholderName}
            onChange={(e) => setCardholderName(e.target.value)}
            placeholder="Name on card"
            className="h-12 w-full rounded-[8px] border border-[#E4E4E7] px-4 font-figtree text-[15px] text-[#030303] placeholder:text-[#9CA3AF] outline-none focus:border-[#0F172A]"
          />

          <label className="flex items-start gap-3 rounded-[12px] bg-[#F4F4F5] p-4">
            <input
              type="checkbox"
              checked={saveCard}
              onChange={(e) => setSaveCard(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border border-[#D4D4D8] accent-[#0F172A]"
            />
            <span className="font-figtree text-[13px] leading-[19px] text-[#3F3F47]">
              <span className="font-semibold text-[#030303]">Save this card securely</span> for faster checkout
              next time. Your full card number is never stored by Eventory but only a bank approved
              token(RBI tokenisation). You&apos;ll get a one time OTP to confirm this.
            </span>
          </label>
        </div>
      )}
    </div>
  );
}
