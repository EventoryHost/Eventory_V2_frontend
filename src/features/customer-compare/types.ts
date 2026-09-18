import type { AddonItem, IncludedItemEntry } from "@/features/customer-package-detail/types";

/** One package column — the card at the top of the comparison (node 1200:2550). */
export interface ComparePackageColumn {
  packageId: string;
  title: string;
  /** Variant tier ("Basic", "Premium"), shown after the title. */
  variantLabel?: string;
  categoryLabel: string;
  categoryIcon?: string;
  categoryGradientFrom?: string;
  image?: string;
  rating: number;
  reviewCount: number;
  price: number;
  href: string;
}

/**
 * What one table cell holds. The comparison mixes plain values with panels
 * (notes), media strips and stacked cards (setups, add-ons), so each cell
 * carries its own kind rather than everything being coerced to a string.
 */
export type CompareCellValue =
  | { kind: "text"; text: string; tone?: "default" | "success" }
  | { kind: "list"; items: string[] }
  | { kind: "note"; text: string }
  | { kind: "images"; images: string[]; extraCount: number }
  | { kind: "setups"; setups: IncludedItemEntry[] }
  | { kind: "addons"; addons: AddonItem[]; extraCount: number }
  | { kind: "empty" };

export interface CompareRow {
  id: string;
  /** Left-column label. Omitted for the full-width card rows (setups, add-ons). */
  label?: string;
  /** The design prints the overtime-charges label in the error colour. */
  labelTone?: "default" | "danger";
  cells: CompareCellValue[];
  /** The cell that wins this row, with the pill the design puts beside it. */
  winner?: { index: number; badge: string };
}

export interface CompareSection {
  id: string;
  title: string;
  rows: CompareRow[];
}

export interface ComparisonView {
  /** The single vendorType the comparison is locked to (backend rule). */
  vendorType: string | null;
  columns: ComparePackageColumn[];
  sections: CompareSection[];
}
