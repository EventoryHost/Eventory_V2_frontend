"use client";

import { useState, type ReactNode } from "react";

// Small pieces the v6f9 booking screens share: list rows, section heads,
// banners, pills, package picker cards and accordions — mock classes
// .row / .gh / .winbar / .pill / .pkc / .acc, in the help panel's tokens.

export function SectionHead({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex items-center gap-2 font-figtree">
      <span className="h-4 w-[3px] shrink-0 rounded-full bg-[#f0596f]" />
      <h4 className="flex-1 text-[14px] font-semibold leading-[20px] text-[#030303]">{children}</h4>
      {action}
    </div>
  );
}

export function SmallHead({ children }: { children: ReactNode }) {
  return <p className="font-figtree text-[12px] uppercase leading-[18px] tracking-[0.4px] text-[#71717b]">{children}</p>;
}

export function Chevron() {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src="/images/customer/help/arrow-right.svg" alt="" width={18} height={18} className="block shrink-0 opacity-60" />;
}

export function Pill({ tone, children }: { tone: "pending" | "confirmed" | "neutral" | "today"; children: ReactNode }) {
  const cls = {
    pending: "bg-[#fffbeb] text-[#bb4d00]",
    confirmed: "bg-[#f0fdf4] text-[#008236]",
    neutral: "bg-[#f4f4f5] text-[#3f3f47]",
    today: "bg-[#fff2f1] text-[#c81e0d]",
  }[tone];
  return <span className={`shrink-0 whitespace-nowrap rounded-full px-2 font-figtree text-[12px] leading-[18px] ${cls}`}>{children}</span>;
}

/** A tappable list row: optional leading visual, title, sub line, trailing pill, chevron. */
export function Row({
  title,
  sub,
  lead,
  pill,
  onClick,
  framed = true,
}: {
  title: ReactNode;
  sub?: ReactNode;
  lead?: ReactNode;
  pill?: ReactNode;
  onClick: () => void;
  framed?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-4 bg-white p-3 text-left font-figtree transition-colors hover:bg-[#fafafa] ${
        framed ? "rounded-[12px] border border-[#e4e4e7]" : ""
      }`}
    >
      {lead}
      <span className="flex min-w-0 flex-1 flex-col text-[14px] leading-[20px] text-[#030303]">
        {title}
        {sub && <span className="text-[12px] font-normal leading-[18px] text-[#71717b]">{sub}</span>}
      </span>
      {pill}
      <Chevron />
    </button>
  );
}

/** Rows joined in one bordered list (mock .dlist). */
export function RowList({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col divide-y divide-[#e4e4e7] overflow-hidden rounded-[16px] border border-[#e4e4e7]">{children}</div>
  );
}

/** Info (blue) or warning (amber) banner. */
export function Banner({ tone, icon, children }: { tone: "info" | "warn"; icon?: string; children: ReactNode }) {
  return (
    <div
      className={`flex items-start gap-2 rounded-[12px] px-3 py-2.5 font-figtree text-[12px] leading-[18px] ${
        tone === "info" ? "bg-[#eff6ff] text-[#1447e6]" : "bg-[#fffbeb] text-[#bb4d00]"
      }`}
    >
      {icon && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={icon} alt="" width={16} height={16} className="mt-px block shrink-0" />
      )}
      <span>{children}</span>
    </div>
  );
}

/** Package card for pickers (mock .pkc): image, name, vendor · tier · status, tick or radio. */
export function PackagePick({
  name,
  sub,
  image,
  selected,
  single = false,
  disabled = false,
  extra,
  onClick,
}: {
  name: string;
  sub: string;
  image?: string;
  selected: boolean;
  single?: boolean;
  disabled?: boolean;
  extra?: ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      aria-pressed={selected}
      onClick={onClick}
      className={`flex w-full items-center gap-4 rounded-[16px] border bg-white py-3 pl-3 pr-4 text-left font-figtree transition-colors ${
        selected ? "border-[#030303] shadow-[inset_0_0_0_1px_#030303]" : "border-[#e4e4e7] hover:border-[#9f9fa9]"
      } ${disabled ? "cursor-default opacity-55" : ""}`}
    >
      <span className="size-14 shrink-0 overflow-hidden rounded-[12px] bg-[#f4f4f5]">
        {image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt="" className="size-full object-cover" />
        )}
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="text-[16px] font-medium leading-[24px] text-[#030303]">{name}</span>
        <span className="text-[14px] leading-[20px] text-[#71717b]">{sub}</span>
        {extra}
      </span>
      {!disabled && (
        <span
          className={`flex size-6 shrink-0 items-center justify-center rounded-full border-[1.5px] border-[#030303] ${
            selected && !single ? "bg-[#030303]" : ""
          }`}
        >
          {selected && single && <span className="size-3 rounded-full bg-[#030303]" />}
          {selected && !single && (
            <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
              <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </span>
      )}
    </button>
  );
}

/** Expandable row (mock .acc / ExpansionTile). */
export function Accordion({ title, sub, icon, children }: { title: string; sub?: string; icon?: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="font-figtree">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-4 bg-white p-3 text-left hover:bg-[#fafafa]"
      >
        {icon && (
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#fdeef0]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={icon} alt="" width={20} height={20} className="block" />
          </span>
        )}
        <span className="flex min-w-0 flex-1 flex-col text-[14px] leading-[20px] text-[#030303]">
          {title}
          {sub && <span className="text-[12px] leading-[18px] text-[#71717b]">{sub}</span>}
        </span>
        <span className={`transition-transform duration-300 ${open ? "rotate-90" : ""}`}>
          <Chevron />
        </span>
      </button>
      {open && <div className="flex flex-col px-3 pb-3.5 pt-1">{children}</div>}
    </div>
  );
}

/** Key–value table with a total row (mock .kv). */
export function Statement({ rows, total }: { rows: [string, string][]; total?: [string, string] }) {
  return (
    <table className="w-full border-collapse font-figtree text-[14px] tabular-nums">
      <tbody>
        {rows.map(([k, v], i) => (
          <tr key={k}>
            <td className={`py-2 ${i ? "border-t border-[#e4e4e7]" : ""}`}>{k}</td>
            <td className={`py-2 text-right ${i ? "border-t border-[#e4e4e7]" : ""}`}>{v}</td>
          </tr>
        ))}
        {total && (
          <tr className="font-semibold">
            <td className="border-t border-[#030303] py-2">{total[0]}</td>
            <td className="border-t border-[#030303] py-2 text-right">{total[1]}</td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
