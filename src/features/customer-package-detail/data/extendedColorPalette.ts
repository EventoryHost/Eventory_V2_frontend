import type { ColourOption } from "../types";

// Source: SVG_Balloon_Color_Palette.xlsx ("Master Color Palette" sheet) — the
// full reference palette a customer picks from in the Customize items modal
// when they want a colour OTHER than what the vendor already offers for that
// item (see CustomizeWorkshopModal.tsx's colour section). Picking one of
// these is what makes a colour choice a real request; picking among the
// vendor's own colourOptions (shown in the item-details view, SetupDetailPanel.tsx)
// never is. Only rows with a single real hex value are included — the
// sheet's "Confetti"/"Marble"/"Printed" (pattern/multi-colour fills) and
// "Transparent / Clear" have no single swatch color to render.
export interface ColourCategory {
  id: string;
  label: string;
  colours: ColourOption[];
}

function slugify(label: string): string {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function category(label: string, entries: [string, string][]): ColourCategory {
  return {
    id: slugify(label),
    label,
    colours: entries.map(([name, hex]) => ({ id: slugify(name), label: name, swatch: hex })),
  };
}

export const EXTENDED_COLOUR_PALETTE: ColourCategory[] = [
  category("Classic & Solid Colours", [
    ["White", "#FFFFFF"],
    ["Black", "#000000"],
    ["Red", "#FF0000"],
    ["Maroon", "#800000"],
    ["Burgundy", "#800020"],
    ["Pink", "#FFC0CB"],
    ["Baby Pink", "#F4C2C2"],
    ["Hot Pink", "#FF69B4"],
    ["Magenta", "#FF00FF"],
    ["Fuchsia", "#C154C1"],
    ["Coral", "#FF7F50"],
    ["Peach", "#FFE5B4"],
    ["Orange", "#FFA500"],
    ["Yellow", "#FFFF00"],
    ["Lemon Yellow", "#FFF44F"],
    ["Mustard Yellow", "#FFDB58"],
    ["Green", "#008000"],
    ["Lime Green", "#32CD32"],
    ["Mint Green", "#98FF98"],
    ["Forest Green", "#228B22"],
    ["Dark Green", "#006400"],
    ["Blue", "#0000FF"],
    ["Baby Blue", "#89CFF0"],
    ["Sky Blue", "#87CEEB"],
    ["Royal Blue", "#4169E1"],
    ["Navy Blue", "#000080"],
    ["Cobalt Blue", "#0047AB"],
    ["Turquoise", "#40E0D0"],
    ["Teal", "#008080"],
    ["Purple", "#800080"],
    ["Lavender", "#E6E6FA"],
    ["Lilac", "#C8A2C8"],
    ["Violet", "#8F00FF"],
    ["Plum", "#8E4585"],
    ["Brown", "#A52A2A"],
    ["Chocolate Brown", "#7B3F00"],
    ["Beige", "#F5F5DC"],
    ["Cream", "#FFFDD0"],
    ["Ivory", "#FFFFF0"],
    ["Grey", "#808080"],
    ["Light Grey", "#D3D3D3"],
    ["Dark Grey", "#A9A9A9"],
  ]),
  category("Pastel Shades", [
    ["Pastel Pink", "#FFD1DC"],
    ["Pastel Blue", "#AEC6CF"],
    ["Pastel Yellow", "#FDFD96"],
    ["Pastel Green", "#77DD77"],
    ["Pastel Purple", "#B39EB5"],
    ["Pastel Peach", "#FFDAB9"],
    ["Pastel Orange", "#FFB347"],
    ["Pastel Lavender", "#D8B4E2"],
    ["Pastel Mint", "#AAF0D1"],
    ["Pastel Lilac", "#DCD0FF"],
    ["Pastel Coral", "#F88379"],
    ["Pastel Cream", "#FFF8DC"],
  ]),
  category("Metallic & Chrome Shades", [
    ["Metallic Gold", "#D4AF37"],
    ["Metallic Silver", "#AAA9AD"],
    ["Metallic Red", "#A62B2B"],
    ["Metallic Pink", "#D98695"],
    ["Metallic Blue", "#32527B"],
    ["Metallic Green", "#4B7F52"],
    ["Metallic Purple", "#6A4A7A"],
    ["Chrome Gold", "#FFD700"],
    ["Chrome Silver", "#E5E4E2"],
    ["Chrome Rose Gold", "#B76E79"],
    ["Chrome Pink", "#FF5C8A"],
    ["Chrome Blue", "#1F75FE"],
    ["Chrome Green", "#00A86B"],
    ["Chrome Purple", "#7851A9"],
    ["Chrome Black", "#1C1C1C"],
    ["Chrome Copper", "#B87333"],
  ]),
  category("Pearl & Satin Shades", [
    ["Pearl White", "#F8F6F0"],
    ["Pearl Pink", "#F3D8E0"],
    ["Pearl Blue", "#D2E4EE"],
    ["Pearl Lavender", "#E2DAEB"],
    ["Pearl Purple", "#DAC3E8"],
    ["Pearl Green", "#DAE8D5"],
    ["Pearl Yellow", "#FDF6C7"],
    ["Pearl Peach", "#FBE3D5"],
    ["Satin White", "#F5F2EB"],
    ["Satin Pink", "#F1C5C5"],
    ["Satin Blue", "#7FA6C1"],
    ["Satin Gold", "#CBA135"],
  ]),
  category("Special & Neon", [
    ["Glitter", "#E6C229"],
    ["LED White", "#FFFFFF"],
    ["Neon Pink", "#FF1493"],
    ["Neon Green", "#39FF14"],
    ["Neon Yellow", "#FFF01F"],
    ["Neon Orange", "#FF5F1F"],
    ["Neon Blue", "#00F0FF"],
  ]),
];

/** Flat lookup across every category — for resolving a picked id/label back to its swatch. */
export const ALL_EXTENDED_COLOURS: ColourOption[] = EXTENDED_COLOUR_PALETTE.flatMap((c) => c.colours);
