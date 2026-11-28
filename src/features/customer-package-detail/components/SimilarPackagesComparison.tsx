"use client";

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";

import { addCompareItem, clearCompare } from "@/lib/customerCompareApi";
import { findSimilarPackages } from "../utils/findSimilarPackages";
import CompareModal from "@/features/customer-compare/components/CompareModal";
import type { PackageDetail } from "../types";
import { getPackageDetail } from "../services/getPackageDetail";
import { formatPrice } from "../utils/formatPrice";
import SectionHeading from "./SectionHeading";

const SIMILAR_COUNT = 2;

interface Column {
  id: string;
  isCurrent: boolean;
  title: string;
  variantLabel?: string;
  vendorName: string;
  categoryLabel: string;
  categoryIcon?: string;
  categoryGradientFrom?: string;
  image?: string;
  price: number;
  tokenRequired: boolean;
  setupsCount: number;
  setupNames: string;
  setupTime: string;
  crewSize: string;
  gallery: string[];
  rating: number;
  reviewCount: number;
  href: string;
}

function startingPrice(detail: PackageDetail): number {
  return detail.variants.find((variant) => variant.id === detail.defaultVariantId)?.price ?? detail.variants[0]?.price ?? 0;
}

function toColumn(detail: PackageDetail, isCurrent: boolean): Column {
  const variant = detail.variants.length > 1 ? detail.variants.find((v) => v.id === detail.defaultVariantId) : undefined;
  return {
    id: detail.id,
    isCurrent,
    title: detail.title,
    variantLabel: variant?.label,
    vendorName: detail.vendorName,
    categoryLabel: detail.categoryLabel,
    categoryIcon: detail.categoryIcon,
    categoryGradientFrom: detail.categoryGradientFrom,
    image: detail.gallery.find((item) => item.image)?.image,
    price: startingPrice(detail),
    tokenRequired: detail.pricing.tokenType !== null,
    setupsCount: detail.includedItems.length,
    setupNames: detail.includedItems.map((setup) => setup.title).filter(Boolean).slice(0, 3).join(", "),
    setupTime: detail.summary.setupTime,
    crewSize: detail.summary.crewSize,
    gallery: detail.gallery.map((item) => item.image).filter((src): src is string => Boolean(src)),
    rating: detail.rating,
    reviewCount: detail.reviewCount,
    href: `/packages/${detail.id}`,
  };
}

// Phones (Figma node 3642:97673): a 104px label column that sticks while the 168px package columns scroll sideways.
const GRID_CLASS =
  "grid [grid-template-columns:var(--lbl)_repeat(var(--n),168px)] md:[grid-template-columns:222px_repeat(var(--n),minmax(0,1fr))]";
const HIDE_LABEL = "max-md:group-data-[labels=hidden]/tbl:overflow-hidden max-md:group-data-[labels=hidden]/tbl:border-0 max-md:group-data-[labels=hidden]/tbl:p-0 max-md:group-data-[labels=hidden]/tbl:opacity-0";
const labelCell = `flex min-w-0 items-center border border-[#E4E4E7] bg-white p-3 font-figtree text-[14px] leading-5 font-medium text-[#3F3F47] max-md:sticky max-md:left-0 max-md:z-10 md:px-5 md:py-4 ${HIDE_LABEL}`;

function Cell({ column, children, tall }: { column: Column; children: ReactNode; tall?: boolean }) {
  return (
    <div
      className={`flex items-center border border-[#E4E4E7] px-3 font-figtree text-[14px] leading-5 md:px-5 ${
        column.isCurrent ? "bg-[#FAFAFA]" : "bg-white"
      } ${tall ? "py-3" : "min-h-[52px] py-3"}`}
    >
      {children}
    </div>
  );
}

function Pill({ children, tone }: { children: ReactNode; tone: "brand" | "green" | "blue" }) {
  const styles = {
    brand: "border-[#F0596F] bg-white text-[#F0596F] text-[11px] leading-4 font-semibold rounded-[38px] px-2 py-0.5",
    green: "border-[#00C950] bg-gradient-to-r from-[#F0FDF4] to-white text-[#008236] text-[14px] leading-5 font-medium rounded-full px-2 py-0.5",
    blue: "border-[#2B7FFF] bg-gradient-to-r from-[#EFF6FF] to-white text-[#1447E6] text-[14px] leading-5 font-medium rounded-full px-2 py-0.5",
  } as const;
  return <span className={`border whitespace-nowrap ${styles[tone]}`}>{children}</span>;
}

export default function SimilarPackagesComparison({ current }: { current: PackageDetail }) {
  const [columns, setColumns] = useState<Column[] | null>(null);
  const [compareOpen, setCompareOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [labelsHidden, setLabelsHidden] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const similar = await findSimilarPackages(current, { count: SIMILAR_COUNT });
      const details = await Promise.all(similar.map((pkg) => getPackageDetail(pkg._id).catch(() => null)));
      if (cancelled) return;
      const others = details.filter((detail): detail is PackageDetail => detail !== null);
      setColumns(others.length === 0 ? [] : [toColumn(current, true), ...others.map((detail) => toColumn(detail, false))]);
    })().catch(() => {
      if (!cancelled) setColumns([]);
    });
    return () => {
      cancelled = true;
    };
  }, [current]);

  if (!columns || columns.length === 0) return null;

  const prices = columns.map((column) => column.price).filter((price) => price > 0);
  const lowestPrice = prices.length > 1 && new Set(prices).size > 1 ? Math.min(...prices) : null;
  const mostSetups = Math.max(...columns.map((column) => column.setupsCount));
  const showMostSetups = mostSetups > 0 && new Set(columns.map((column) => column.setupsCount)).size > 1;

  async function openFullComparison() {
    setBusy(true);
    try {
      await clearCompare();
      for (const column of columns ?? []) await addCompareItem(column.id);
      setCompareOpen(true);
    } catch {
      // Best-effort: the table above already shows the comparison.
    } finally {
      setBusy(false);
    }
  }

  const gridStyle = { "--n": columns.length, "--lbl": labelsHidden ? "0px" : "104px" } as CSSProperties;

  return (
    <section id="compare-similar" className="mt-12 border-t border-black/5 pt-8">
      <div className="mb-3 md:mb-5">
        <div className="flex items-center justify-between gap-3 md:hidden">
          <h2 className="flex items-center gap-3 font-figtree text-[18px] font-semibold text-[#222]">
            <span className="h-6 w-[5px] rounded-sm bg-[#F0596F]" />
            Compare with similar packages
          </h2>
          {labelsHidden && (
            <button
              type="button"
              onClick={() => setLabelsHidden(false)}
              className="shrink-0 rounded-full border border-[#E4E4E7] px-2.5 py-1 font-figtree text-[11px] leading-4 font-semibold text-[#3F3F47]"
            >
              Show labels
            </button>
          )}
        </div>
        <div className="hidden md:block">
          <SectionHeading>Compare with similar packages</SectionHeading>
          <p className="-mt-4 pl-[17px] font-figtree text-[14px] leading-5 text-[#3F3F47]">
            Same event type, similar budget, available in your city
          </p>
        </div>
      </div>

      <div className="overflow-x-auto max-md:rounded-2xl">
        <div
          data-labels={labelsHidden ? "hidden" : "shown"}
          className="group/tbl w-max md:w-auto md:min-w-[860px]"
        >
          {/* Package header row */}
          <div className={GRID_CLASS} style={gridStyle}>
            <div
              className={`flex min-w-0 flex-col items-end justify-end border border-[#E4E4E7] bg-white py-3 pr-2.5 pl-4 max-md:sticky max-md:left-0 max-md:z-10 md:p-0 ${HIDE_LABEL}`}
            >
              <button
                type="button"
                onClick={() => setLabelsHidden(true)}
                className="rounded-full border border-[#E4E4E7] px-2.5 py-1 font-figtree text-[11px] leading-4 font-semibold whitespace-nowrap text-[#3F3F47] md:hidden"
              >
                Hide labels
              </button>
            </div>
            {columns.map((column) => (
              <div
                key={column.id}
                className={`flex flex-col justify-end gap-1.5 border border-[#E4E4E7] px-2.5 py-3 md:justify-start md:gap-4 md:px-5 md:pt-6 md:pb-8 ${column.isCurrent ? "bg-[#FAFAFA]" : "bg-white"}`}
              >
                <div className="relative h-[112px] w-full shrink-0 overflow-hidden rounded-xl bg-[#F4F4F5] md:h-[170px]">
                  {column.image && <Image src={column.image} alt={column.title} fill sizes="340px" className="object-cover" />}
                </div>
                <div className="flex flex-col gap-1.5 md:gap-2">
                  <div
                    className="flex h-6 w-fit items-center gap-2 rounded-[52px] py-1 pr-3 pl-1"
                    style={{ background: `linear-gradient(to left, ${column.categoryGradientFrom ?? "#FFE5E9"}, #ffffff)` }}
                  >
                    {column.categoryIcon && (
                      <Image src={column.categoryIcon} alt="" width={16} height={16} className="h-4 w-4 rounded-full object-contain" />
                    )}
                    <span className="font-figtree text-[11px] leading-4 font-bold tracking-[-0.11px] whitespace-nowrap text-[#3C060D] uppercase md:text-[12px] md:leading-[18px] md:tracking-[-0.12px]">
                      {column.categoryLabel}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="min-w-0 font-figtree text-[14px] leading-5 font-semibold text-[#030303] md:flex md:items-center md:gap-1 md:text-[16px] md:leading-normal">
                      <span className="md:truncate">{column.title}</span>
                      {column.variantLabel && (
                        <span className="font-medium text-[#71717B] max-md:ml-1 md:shrink-0">
                          <span className="mr-1">·</span>
                          {column.variantLabel}
                        </span>
                      )}
                    </p>
                    <p className="font-figtree text-[12px] leading-[18px] text-[#3F3F47] md:text-[14px] md:leading-5 md:font-medium md:text-[#030303]">By {column.vendorName}</p>
                  </div>
                </div>
                {column.isCurrent ? (
                  <span className="flex min-h-9 w-full items-center justify-center rounded-full border border-[#030303] px-3 py-2 font-figtree text-[12px] leading-[18px] font-medium text-[#030303] md:px-5 md:text-[14px] md:leading-5">
                    Currently viewing
                  </span>
                ) : (
                  <Link
                    href={column.href}
                    className="flex min-h-9 w-full items-center justify-center rounded-full bg-[#FEF5F7] px-2 py-2 font-figtree text-[12px] leading-[18px] font-semibold text-[#B91D34] transition hover:bg-[#FDEEF0] md:px-3.5 md:text-[14px] md:leading-5 md:text-[#F0596F]"
                  >
                    View package Details
                  </Link>
                )}
              </div>
            ))}
          </div>

          <Row label="Starting price" style={gridStyle}>
            {columns.map((column) => (
              <Cell key={column.id} column={column}>
                <span className="flex flex-wrap items-center gap-x-2.5 gap-y-1 font-semibold text-[#030303]">
                  {column.price > 0 ? formatPrice(column.price) : "—"}
                  {lowestPrice !== null && column.price === lowestPrice && <Pill tone="brand">BEST PRICE</Pill>}
                </span>
              </Cell>
            ))}
          </Row>

          <Row label="Token amount" style={gridStyle}>
            {columns.map((column) => (
              <Cell key={column.id} column={column}>
                {column.tokenRequired ? <Pill tone="green">Token Required</Pill> : <Pill tone="blue">Free Booking</Pill>}
              </Cell>
            ))}
          </Row>

          <Row label="Setups & areas" style={gridStyle}>
            {columns.map((column) => (
              <Cell key={column.id} column={column} tall>
                <div className="flex w-full items-start justify-between gap-2 max-md:flex-col md:items-center md:gap-5">
                  <div className="min-w-0">
                    <p className="font-semibold text-[#030303]">
                      {column.setupsCount} setup{column.setupsCount === 1 ? "" : "s"}
                    </p>
                    {column.setupNames && <p className="text-[#3F3F47]">{column.setupNames}</p>}
                  </div>
                  {showMostSetups && column.setupsCount === mostSetups && <Pill tone="brand">MOST SETUPS</Pill>}
                </div>
              </Cell>
            ))}
          </Row>

          <Row label="Setup Time" style={gridStyle}>
            {columns.map((column) => (
              <Cell key={column.id} column={column}>
                <span className="font-medium text-[#030303]">{column.setupTime || "—"}</span>
              </Cell>
            ))}
          </Row>

          <Row label="Crew size" style={gridStyle}>
            {columns.map((column) => (
              <Cell key={column.id} column={column}>
                <span className="font-medium text-[#030303]">{column.crewSize || "—"}</span>
              </Cell>
            ))}
          </Row>

          <Row label="Sample decoration" style={gridStyle} alignTop>
            {columns.map((column) => (
              <Cell key={column.id} column={column}>
                <div className="flex gap-3 md:hidden">
                  {column.gallery.slice(0, 2).map((src, index) => {
                    const extra = column.gallery.length - 1;
                    const isMore = index === 1 && extra > 0;
                    return (
                      <div key={`${src}-m-${index}`} className="relative size-16 shrink-0 overflow-hidden rounded-[10px] bg-[#F4F4F5]">
                        <Image src={src} alt="" fill sizes="64px" className="object-cover" />
                        {isMore && (
                          <span className="absolute inset-0 flex items-center justify-center bg-black/60 font-figtree text-[14px] font-semibold text-white">
                            {extra}+
                          </span>
                        )}
                      </div>
                    );
                  })}
                  {column.gallery.length === 0 && <span className="text-[#71717B]">—</span>}
                </div>
                <div className="hidden gap-3 md:flex">
                  {column.gallery.slice(0, 4).map((src, index) => {
                    const extra = column.gallery.length - 3;
                    const isMore = index === 3 && extra > 0;
                    return (
                      <div key={`${src}-${index}`} className="relative h-16 w-16 shrink-0 overflow-hidden rounded-[10px] bg-[#F4F4F5]">
                        <Image src={src} alt="" fill sizes="64px" className="object-cover" />
                        {isMore && (
                          <span className="absolute inset-0 flex items-center justify-center bg-black/60 font-figtree text-[14px] font-semibold text-white">
                            {extra}+
                          </span>
                        )}
                      </div>
                    );
                  })}
                  {column.gallery.length === 0 && <span className="text-[#71717B]">—</span>}
                </div>
              </Cell>
            ))}
          </Row>

          <Row label="Customer Review" style={gridStyle}>
            {columns.map((column) => (
              <Cell key={column.id} column={column}>
                {column.reviewCount > 0 ? (
                  <span className="flex items-center gap-1.5">
                    <Image src="/images/customer/package-detail/rating-star.svg" alt="" width={14} height={14} />
                    <span className="font-semibold text-[#030303]">{column.rating}</span>
                    <span className="text-[#71717B] underline">({column.reviewCount} reviews)</span>
                  </span>
                ) : (
                  <span className="text-[#71717B]">No reviews yet</span>
                )}
              </Cell>
            ))}
          </Row>
        </div>
      </div>

      <div className="flex justify-center pt-6">
        <button
          type="button"
          onClick={openFullComparison}
          disabled={busy}
          className="rounded-xl border border-[#D92640] px-6 py-2.5 font-figtree text-[16px] leading-6 text-[#D92640] transition hover:bg-[#FEF5F7] disabled:opacity-60"
        >
          {busy ? "Opening…" : "View complete comparison"}
        </button>
      </div>

      <CompareModal open={compareOpen} onClose={() => setCompareOpen(false)} />
    </section>
  );
}

function Row({
  label,
  style,
  children,
  alignTop,
}: {
  label: string;
  style: React.CSSProperties;
  children: ReactNode;
  alignTop?: boolean;
}) {
  return (
    <div className={`-mt-px ${GRID_CLASS}`} style={style}>
      <div className={`${labelCell} ${alignTop ? "items-start" : ""}`}>{label}</div>
      {children}
    </div>
  );
}
