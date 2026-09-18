"use client";

import { CreditCard, Trash2 } from "lucide-react";
import type { SavedCard, SavedUpiId } from "../types";

// The design (node 1414:6624) shows both lists populated, but there is no
// backend behind them — no saved-instrument fields on Customer, and no
// list/add/delete endpoints under /customer/payments. Rendering the design's
// sample cards would put fabricated payment instruments in front of the
// customer, so the sections ship with real empty states instead and the row
// components below wait for a data source. See the note on SavedCard in
// ../types.ts for what that source has to look like (tokens, never PANs).
const SAVED_UPI_IDS: SavedUpiId[] = [];
const SAVED_CARDS: SavedCard[] = [];

const CARD_NETWORK_LOGOS: Record<NonNullable<SavedCard["network"]>, string | null> = {
  visa: "/images/customer/payment/visa.svg",
  mastercard: "/images/customer/payment/mastercard.svg",
  rupay: "/images/customer/payment/rupay.svg",
  other: null,
};

const ROW_CLASS =
  "flex w-full max-w-[464px] items-center justify-between overflow-hidden rounded-xl border border-[#E4E4E7] bg-white p-4";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="overflow-hidden rounded-[20px] border border-[#E4E4E7] bg-white p-[19px]">
      <h2 className="text-[16px] font-semibold leading-6 text-[#71717B]">{title}</h2>
      <div className="mt-3 flex flex-col gap-6">{children}</div>
    </section>
  );
}

function EmptyRow({ message }: { message: string }) {
  return (
    <div className="flex w-full max-w-[464px] items-center gap-3 rounded-xl border border-dashed border-[#E4E4E7] bg-[#FAFAFA] p-4">
      <CreditCard className="h-5 w-5 shrink-0 text-[#9F9FA9]" />
      <p className="text-[14px] leading-5 text-[#71717B]">{message}</p>
    </div>
  );
}

function DeleteButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="shrink-0 text-[#71717B] transition-colors hover:text-[#C81E0D]"
    >
      <Trash2 className="h-5 w-5" />
    </button>
  );
}

function UpiRow({ upi, onDelete }: { upi: SavedUpiId; onDelete: () => void }) {
  return (
    <div className={ROW_CLASS}>
      <div className="flex min-w-0 items-center gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#4527A0]">
            {/* next/image refuses local SVGs unless dangerouslyAllowSVG is
                set, which it isn't — plain img, same as the nav logo. */}
            {upi.provider === "phonepe" && (
              <img src="/images/customer/payment/phonepe.svg" alt="" className="h-[30px] w-[30px]" />
            )}
          </span>
          <p className="truncate text-[14px] leading-5 text-[#030303]">{upi.vpa}</p>
        </div>
        {upi.isPrimary && (
          <span className="shrink-0 rounded-[37px] border border-[#DCFCE7] bg-[#F0FDF4] px-1.5 py-0.5 text-[11px] font-medium leading-4 text-[#008236]">
            Primary
          </span>
        )}
      </div>
      <DeleteButton label={`Remove UPI ID ${upi.vpa}`} onClick={onDelete} />
    </div>
  );
}

function CardRow({ card, onDelete }: { card: SavedCard; onDelete: () => void }) {
  const logo = CARD_NETWORK_LOGOS[card.network ?? "other"];

  return (
    <div className={ROW_CLASS}>
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white">
          {logo ? (
            <img src={logo} alt="" className="w-7" />
          ) : (
            <CreditCard className="h-5 w-5 text-[#71717B]" />
          )}
        </span>
        <div className="flex min-w-0 flex-col justify-center">
          <p className="truncate text-[14px] leading-5 text-[#030303]">
            <span className="font-bold">{card.label}</span> ending with {card.last4}
          </p>
          {card.holderName && (
            <p className="truncate text-[12px] font-semibold leading-[18px] text-[#71717B]">
              {card.holderName}
            </p>
          )}
        </div>
      </div>
      <DeleteButton label={`Remove card ending with ${card.last4}`} onClick={onDelete} />
    </div>
  );
}

export default function PaymentDetailsContent() {
  // Deletion needs an endpoint that doesn't exist yet. No rows render today,
  // so this is unreachable — it's here so the wiring point is obvious rather
  // than a button that silently does nothing once rows do appear.
  function notImplemented() {
    throw new Error("Removing a saved payment method needs a backend endpoint.");
  }

  return (
    <>
      <h1 className="text-[24px] font-semibold leading-8 text-[#030303]">Payment Details</h1>

      <Section title="SAVED UPI IDs">
        {SAVED_UPI_IDS.length === 0 ? (
          <EmptyRow message="No UPI IDs saved yet." />
        ) : (
          SAVED_UPI_IDS.map((upi) => <UpiRow key={upi.id} upi={upi} onDelete={notImplemented} />)
        )}
      </Section>

      <Section title="SAVED CARDS">
        {SAVED_CARDS.length === 0 ? (
          <EmptyRow message="No cards saved yet." />
        ) : (
          SAVED_CARDS.map((card) => <CardRow key={card.id} card={card} onDelete={notImplemented} />)
        )}
      </Section>
    </>
  );
}
