"use client";

import Link from "next/link";
import { useState } from "react";
import { formatPrice } from "@/features/customer-package-detail/utils/formatPrice";
import type { HelpPackageResult } from "../assistant/findPackages";

// v6f4 "Help / Package card": only what differs between packages — name,
// vendor, rating, price, what it takes to book, and how far over budget.
// What they share is the "understood" line above. Both buttons open the
// package page: variant and date are chosen there, so "Add to cart" is a
// way in, not a one-tap add.
type HelpPackageCardProps = {
  card: HelpPackageResult;
  /** The customer's budget ceiling, for "₹X over your budget". */
  budgetMax?: number;
  onOpen: () => void;
};

const SMALL = "font-figtree text-[11px] font-normal leading-[16px]";

export default function HelpPackageCard({ card, budgetMax, onOpen }: HelpPackageCardProps) {
  // Vendor photos sometimes 404 — fall back to the gallery placeholder.
  const [imageFailed, setImageFailed] = useState(false);
  const [explain, setExplain] = useState(false);
  const href = `/packages/${card.id}`;
  const over = budgetMax && card.price > budgetMax ? card.price - budgetMax : 0;

  return (
    <article className="flex w-[232px] shrink-0 snap-start flex-col overflow-hidden rounded-[12px] border border-[#e4e4e7] bg-white">
      <Link href={href} onClick={onOpen} tabIndex={-1} aria-hidden className="flex h-[76px] w-full items-center justify-center bg-[#f4f4f5]">
        {card.imageUrl && !imageFailed ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={card.imageUrl} alt="" className="size-full object-cover" onError={() => setImageFailed(true)} />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src="/images/customer/help/gallery.svg" alt="" width={20} height={20} className="block" />
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-0.5 px-2.5 pb-2.5 pt-2 font-figtree">
        <Link
          href={href}
          onClick={onOpen}
          className="line-clamp-2 text-[12px] font-normal leading-[18px] text-[#030303] hover:underline"
        >
          {card.name}
        </Link>
        <div className={`flex min-w-0 items-center gap-2 text-[#71717b] ${SMALL}`}>
          <span className="min-w-0 truncate">{card.vendor}</span>
          {card.reviewCount > 0 ? (
            <span className="flex shrink-0 items-center gap-0.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/customer/help/star.svg" alt="" width={12} height={12} className="block" />
              {card.rating.toFixed(1)} ({card.reviewCount})
            </span>
          ) : (
            <span className="shrink-0 rounded-full bg-[#eff6ff] px-1.5 text-[#1447e6]">New on Eventory</span>
          )}
        </div>
        <p className="mt-1 text-[14px] font-normal leading-[20px] text-[#030303] tabular-nums">{formatPrice(card.price)}</p>
        <button
          type="button"
          onClick={() => setExplain((v) => !v)}
          aria-expanded={explain}
          className={`flex items-center gap-1 self-start text-left text-[#71717b] ${SMALL}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/customer/help/info.svg" alt="" width={12} height={12} className="block" />
          {card.token ? `${formatPrice(card.token)} to book` : "Free to book"}
        </button>
        {explain && (
          <p className={`text-[#3f3f47] ${SMALL}`}>
            {card.token
              ? `Pay ${formatPrice(card.token)} now to hold your date. The rest is due closer to the event.`
              : "Nothing to pay now to hold your date. Free to book isn’t free to cancel: check the policy on the package."}
          </p>
        )}
        {over > 0 && (
          <p className={`mt-0.5 flex items-center gap-1 text-[#bb4d00] ${SMALL}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/customer/help/info-warning.svg" alt="" width={14} height={14} className="block" />
            {formatPrice(over)} over your budget
          </p>
        )}
        <div className="mt-auto grid grid-cols-2 gap-1.5 pt-2">
          <Link
            href={href}
            onClick={onOpen}
            className="flex min-h-[30px] items-center justify-center rounded-full border border-[#030303] bg-white px-3 text-[12px] leading-[18px] text-[#030303]"
          >
            View package
          </Link>
          <Link
            href={href}
            onClick={onOpen}
            className="flex min-h-[30px] items-center justify-center rounded-full bg-[#f0596f] px-3 text-[12px] leading-[18px] text-white"
          >
            Add to cart
          </Link>
        </div>
      </div>
    </article>
  );
}
