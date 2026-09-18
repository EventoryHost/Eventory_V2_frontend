"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, X } from "lucide-react";
import { formatPrice } from "@/features/customer-vendors/utils/currency";
import type { ComparePackageColumn } from "../types";

/** The package column header (node 1200:2550) — card, identity, price, CTA. */
export default function ComparePackageCard({
  column,
  onRemove,
}: {
  column: ComparePackageColumn;
  onRemove: (packageId: string) => void;
}) {
  return (
    <div className="flex h-full flex-col gap-5 p-[19px]">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => onRemove(column.packageId)}
          aria-label={`Remove ${column.title} from the comparison`}
          className="flex items-center rounded-full border border-[#E4E4E7] bg-white p-1.5 text-[#030303] transition-colors hover:bg-[#FAFAFA] print:hidden"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex flex-col gap-4">
        <div className="relative h-[170px] w-full overflow-hidden rounded-xl bg-[#F4F4F5]">
          {column.image && (
            <Image src={column.image} alt={column.title} fill sizes="363px" className="object-cover" />
          )}
        </div>

        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <span
              className="flex h-6 w-fit items-center justify-center gap-2 rounded-[52px] py-1 pl-1 pr-3"
              style={{
                background: `linear-gradient(to right, #ffffff, ${column.categoryGradientFrom ?? "#FFE5E9"} 80%)`,
              }}
            >
              {column.categoryIcon && (
                <Image src={column.categoryIcon} alt="" width={16} height={16} className="h-4 w-4 object-contain" />
              )}
              <span className="whitespace-nowrap text-[12px] font-bold leading-[18px] tracking-[-0.01em] text-[#3C060D]">
                {column.categoryLabel.toUpperCase()}
              </span>
            </span>

            <div className="flex flex-col gap-2">
              <div className="flex min-w-0 items-center gap-[3px]">
                <Link href={column.href} className="truncate text-[16px] font-medium text-[#030303] hover:underline">
                  {column.title}
                </Link>
                {column.variantLabel && (
                  <>
                    <span aria-hidden className="h-1 w-1 shrink-0 rounded-full bg-[#D4D4D8]" />
                    <span className="truncate text-[16px] font-medium text-[#71717B]">{column.variantLabel}</span>
                  </>
                )}
              </div>

              {column.reviewCount > 0 && (
                <div className="flex items-center gap-1.5">
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#EA1D3B]">
                    <Star className="h-2.5 w-2.5 fill-white text-white" />
                  </span>
                  <p className="text-[14px] tracking-[-0.01em]">
                    <span className="font-semibold leading-5 text-[#1A1A1A]">{column.rating} </span>
                    <span className="leading-5 text-[#666]">from {column.reviewCount} reviews</span>
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1">
              <p className="text-[11px] leading-[14px] text-[#9F9FA9]">STARTING FROM</p>
              <p className="text-[24px] font-bold leading-6 tracking-[-0.01em] text-black">
                {formatPrice(column.price)}
              </p>
            </div>

            <Link
              href={column.href}
              className="flex w-full items-center justify-center rounded-full bg-[#FDEEF0] px-3.5 py-2 text-[14px] font-semibold leading-5 text-brand-primary transition-colors hover:bg-[#FCE3E7]"
            >
              View package Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
