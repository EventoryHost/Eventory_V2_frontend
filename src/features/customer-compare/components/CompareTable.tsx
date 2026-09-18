"use client";

import { Fragment, type ReactNode } from "react";
import Image from "next/image";
import { MAX_COMPARE_PACKAGES } from "@/lib/customerCompareApi";
import type { CompareCellValue, CompareRow, CompareSection, ComparePackageColumn } from "../types";
import CompareAddSlot from "./CompareAddSlot";
import ComparePackageCard from "./ComparePackageCard";
import { CompareAddonCard, CompareSetupCard } from "./CompareCardStacks";

/** Label column and minimum package column, in px (222 / 363 in the design). */
const LABEL_COLUMN = 222;
const MIN_PACKAGE_COLUMN = 300;

const CELL_CLASS = "border-b border-l border-[#E4E4E7] px-5 py-4";

function NotePanel({ text }: { text: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-[#DBEAFE] bg-[#EFF6FF] px-4 py-3">
      <p className="text-[11px] leading-4 text-[#2B7FFF]">YOUR NOTES</p>
      {text && <p className="text-[12px] leading-[18px] text-[#030303]">{text}</p>}
    </div>
  );
}

function CellContent({ cell }: { cell: CompareCellValue }): ReactNode {
  switch (cell.kind) {
    case "text":
      return (
        <p
          className={`text-[14px] font-medium leading-5 ${
            cell.tone === "success" ? "text-[#008236]" : "text-[#030303]"
          }`}
        >
          {cell.text}
        </p>
      );

    case "list":
      return (
        <ul className="flex list-disc flex-col gap-1.5 pl-4">
          {cell.items.map((item, index) => (
            <li key={`${item}-${index}`} className="text-[14px] font-medium leading-5 text-[#030303]">
              {item}
            </li>
          ))}
        </ul>
      );

    case "note":
      return <NotePanel text={cell.text} />;

    case "images":
      return (
        <div className="flex items-start gap-3">
          {cell.images.map((src, index) => {
            const isLast = index === cell.images.length - 1;
            const showOverlay = isLast && cell.extraCount > 0;
            return (
              <div key={src} className="relative h-16 w-16 shrink-0 overflow-hidden rounded-[10px] bg-[#F4F4F5]">
                <Image src={src} alt="" fill sizes="64px" className="object-cover" />
                {showOverlay && (
                  <span className="absolute inset-0 flex items-center justify-center bg-black/60 text-[14px] font-semibold text-white">
                    {cell.extraCount}+
                  </span>
                )}
              </div>
            );
          })}
        </div>
      );

    case "setups":
      return (
        <div className="flex flex-col gap-4">
          {cell.setups.map((entry) => (
            <CompareSetupCard key={entry.id} entry={entry} />
          ))}
        </div>
      );

    case "addons":
      return (
        <div className="flex flex-col gap-4">
          {cell.addons.map((addon) => (
            <CompareAddonCard key={addon.id} addon={addon} />
          ))}
          {cell.extraCount > 0 && (
            <p className="text-[14px] font-medium leading-5 text-brand-primary">+{cell.extraCount} More</p>
          )}
        </div>
      );

    case "empty":
    default:
      return <p className="text-[14px] font-medium leading-5 text-[#9F9FA9]">—</p>;
  }
}

function Row({ row, emptySlots }: { row: CompareRow; emptySlots: number }) {
  return (
    <>
      <div className={`${CELL_CLASS} flex items-start bg-white`}>
        {row.label && (
          <span
            className={`text-[14px] font-medium leading-5 ${
              row.labelTone === "danger" ? "text-[#C81E0D]" : "text-[#3F3F47]"
            }`}
          >
            {row.label}
          </span>
        )}
      </div>

      {row.cells.map((cell, index) => {
        const isWinner = row.winner?.index === index;
        return (
          <div
            key={index}
            className={`${CELL_CLASS} flex items-start gap-5 ${isWinner ? "bg-[#FFF5F6]" : "bg-white"}`}
          >
            <CellContent cell={cell} />
            {isWinner && (
              <span className="shrink-0 rounded-[38px] border border-brand-primary bg-white px-2 py-0.5 text-[11px] font-bold leading-4 text-brand-primary">
                {row.winner!.badge}
              </span>
            )}
          </div>
        );
      })}

      {/* Unfilled slots: bordered but blank, exactly as in the 2-package node */}
      {Array.from({ length: emptySlots }, (_, index) => (
        <div key={`empty-${index}`} className={`${CELL_CLASS} bg-white`} />
      ))}
    </>
  );
}

/**
 * The comparison grid (node 1200:2536): a fixed label column plus one column
 * per package, with every section sharing the same template so the columns
 * stay aligned down the whole page. It scrolls horizontally rather than
 * reflowing — a comparison only reads as one when the columns line up.
 */
export default function CompareTable({
  columns,
  sections,
  onRemove,
}: {
  columns: ComparePackageColumn[];
  sections: CompareSection[];
  onRemove: (packageId: string) => void;
}) {
  // The table keeps a column per comparison slot, filled or not, so two
  // packages still read as "two of three" rather than silently widening.
  const slotCount = Math.max(columns.length, MAX_COMPARE_PACKAGES);
  const emptySlots = slotCount - columns.length;
  const template = `${LABEL_COLUMN}px repeat(${slotCount}, minmax(${MIN_PACKAGE_COLUMN}px, 1fr))`;

  return (
    // print:overflow-visible so the printed sheet isn't cut off at the
    // viewport's scroll edge — the on-screen table scrolls sideways.
    <div className="overflow-x-auto print:overflow-visible">
      <div
        className="border-r border-t border-[#E4E4E7]"
        style={{ minWidth: LABEL_COLUMN + slotCount * MIN_PACKAGE_COLUMN }}
      >
        {/* Package cards */}
        <div className="grid" style={{ gridTemplateColumns: template }}>
          <div className="border-b border-l border-[#E4E4E7] bg-white" />
          {columns.map((column) => (
            <div key={column.packageId} className="border-b border-l border-[#E4E4E7] bg-white">
              <ComparePackageCard column={column} onRemove={onRemove} />
            </div>
          ))}
          {Array.from({ length: emptySlots }, (_, index) => (
            <div key={`slot-${index}`} className="border-b border-l border-[#E4E4E7] bg-white">
              <CompareAddSlot />
            </div>
          ))}
        </div>

        {sections.map((section) => (
          <div key={section.id} className="grid" style={{ gridTemplateColumns: template }}>
            <div className="col-span-full border-b border-l border-[#E4E4E7] bg-[#F4F4F5] p-6">
              <h2 className="text-[14px] font-semibold leading-5 text-[#030303]">{section.title}</h2>
            </div>
            {section.rows.map((row) => (
              <Fragment key={row.id}>
                <Row row={row} emptySlots={emptySlots} />
              </Fragment>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
