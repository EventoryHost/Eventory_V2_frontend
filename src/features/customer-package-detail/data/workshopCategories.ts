import type { ColourOption, WorkshopCategoryDef } from "../types";

// The platform-defined category set customers pick from when adding a new
// item in the workshop (design doc §3, Screen 3 — "closed grid, not free
// text": recognition beats recall, and it keeps requests machine-readable
// for the vendor). Categories/type lists given directly by product
// 2026-10-02 (replaces the earlier placeholder set) — each list ends in
// "Other", which CustomizeWorkshopModal's AttributeEditor handles specially
// (free-text input instead of a fixed pill) rather than literally sending
// the request with type "Other".
export const WORKSHOP_CATEGORIES: WorkshopCategoryDef[] = [
  {
    id: "Flowers",
    label: "Flowers",
    typeLabel: "Flower type",
    typeOptions: [
      "Marigold (Yellow/Orange)",
      "Jasmine",
      "Tuberose (Rajnigandha)",
      "Rose",
      "Carnation",
      "Chrysanthemum",
      "Gerbera",
      "Seasonal Local Flowers",
      "Gladiolus",
      "Lily",
      "Other",
    ],
  },
  {
    id: "Lighting",
    label: "Lighting",
    typeLabel: "Fixture type",
    typeOptions: [
      "Fairy Lights",
      "Pixel Lights",
      "LED Strip",
      "Chandeliers (Crystal/Traditional)",
      "Diyas (Oil lamps - traditional)",
      "Candles (Pillar/Floating)",
      "Lanterns (Paper/Metal)",
      "Neon Signs",
      "Spot Lights",
      "Up-lighting",
      "Par Cans",
      "Moving Heads",
      "Gobo Projection",
      "Marquee Lights",
      "Festoon Bulbs",
      "Other",
    ],
  },
  {
    id: "Balloons",
    label: "Balloons",
    typeLabel: "Balloon type",
    typeOptions: ["Metallic Balloons", "Chrome Balloons", "Confetti Balloons", "Balloon Arch", "Other"],
  },
  {
    id: "Carpet",
    label: "Carpet",
    typeLabel: "Flooring type",
    typeOptions: ["Red Carpet", "White Carpet", "Artificial Grass Turf", "Wooden Dance Floor", "Other"],
  },
  {
    id: "Furnitures",
    label: "Furnitures",
    typeLabel: "Furniture type",
    typeOptions: [
      "Chiavari Chairs",
      "Cushioned Chairs",
      "Round Tables",
      "Long Tables",
      "Bar Stools",
      "Lounge Sofas",
      "Bean Bags",
      "Carpets",
      "Daris",
      "Rugs",
      "Sheesham Wooden Chairs (Traditional)",
      "Carved Wooden Stools",
      "Other",
    ],
  },
  {
    id: "Signage",
    label: "Signage",
    typeLabel: "Signage type",
    typeOptions: ["Welcome Board", "Seating Chart", "Neon Sign", "Directional Arrow", "Other"],
  },
  {
    id: "Fabric/Drapery",
    label: "Fabric/Drapery",
    typeLabel: "Fabric type",
    typeOptions: ["Satin Drapes", "Chiffon Drapes", "Velvet Curtains", "Ceiling Draping", "Other"],
  },
  {
    id: "Props",
    label: "Props",
    typeLabel: "Prop type",
    typeOptions: ["Vintage Trunk", "Easel Stand", "Flower Vases", "Lanterns", "Other"],
  },
  {
    id: "Rangoli",
    label: "Rangoli",
    typeLabel: "Rangoli style",
    // No existing Rangoli data anywhere in the codebase (vendor schemas,
    // seed data) to ground this in — these are common real-world rangoli
    // styles, this session's own reasonable pick, not sourced from a given
    // list. Flag for product review before shipping, same as the other
    // extrapolated category mappings in eventSearchTaxonomy.ts.
    typeOptions: [
      "Floral Rangoli",
      "Peacock Design",
      "Geometric / Traditional",
      "Colour Powder (Gulal)",
      "Flower Petals",
      "Rice / Flour Rangoli",
      "Other",
    ],
  },
];

// How full/dense a decor item should look — backend stores this as a free
// string per item (decoratorStep2Schema.js), so any vendor-entered original
// value is preserved even if it doesn't match one of these three.
export const VOLUME_OPTIONS = ["Low", "Medium", "High"];

// Illustration shown on each "Add an item" category card — saved as
// /public/images/customize/<slug>.png. No "Props" entry exists yet (no
// illustration asset for it) — CategoryGrid skips the <img> for any
// category id with no mapping here rather than rendering a broken image.
export const WORKSHOP_CATEGORY_IMAGES: Record<string, string> = {
  Flowers: "/images/customize/flowers.png",
  Lighting: "/images/customize/lighting.png",
  Carpet: "/images/customize/carpet.png",
  Furnitures: "/images/customize/furniture.png",
  Signage: "/images/customize/signage.png",
  "Fabric/Drapery": "/images/customize/fabric.png",
  Balloons: "/images/customize/balloon.png",
  Rangoli: "/images/customize/rangoli.png",
};

// Flat colour list for the "Add an item" workshop flow's Colours dropdown —
// given directly by product 2026-10-02 (replaces the earlier 13-colour
// set). Deliberately flat/uncategorised, matching the Figma dropdown
// (distinct from data/extendedColorPalette.ts's 5-category palette, which
// is a separate picker for a different flow — requesting an alternate
// colour on an EXISTING item). Two "Coral"/"Green"/"Red" entries are
// duplicate labels with distinct hex values, kept as given rather than
// silently merged or renamed.
export const COLOUR_PALETTE: ColourOption[] = [
  { id: "white", label: "White", swatch: "#FFFFFF" },
  { id: "blue", label: "Blue", swatch: "#2B7FFF" },
  { id: "green-1", label: "Green", swatch: "#00C950" },
  { id: "turquoise", label: "Turquoise", swatch: "#40E0D0" },
  { id: "red-1", label: "Red", swatch: "#FF3333" },
  { id: "burgundy", label: "Burgundy", swatch: "#800020" },
  { id: "fuchsia", label: "Fuchsia", swatch: "#FF00FF" },
  { id: "champagne", label: "Champagne", swatch: "#F7E7CE" },
  { id: "orange", label: "Orange", swatch: "#FB8C00" },
  { id: "brown", label: "Brown", swatch: "#643801" },
  { id: "mango", label: "Mango", swatch: "#F9A825" },
  { id: "maroon-wedding", label: "Maroon (Classic)", swatch: "#7A1F2B" },
  { id: "gold", label: "Gold", swatch: "#D4AF37" },
  { id: "teal", label: "Teal", swatch: "#008080" },
  { id: "peach", label: "Peach", swatch: "#FFD3AC" },
  { id: "ivory", label: "Cream/Ivory", swatch: "#FFF8E7" },
  { id: "rose-gold", label: "Rose Gold", swatch: "#B76E79" },
  { id: "navy", label: "Navy Blue", swatch: "#000080" },
  { id: "copper", label: "Copper", swatch: "#B87333" },
  { id: "saffron", label: "Saffron (Diwali)", swatch: "#FF9933" },
  { id: "green-2", label: "Green", swatch: "#2E7D32" },
  { id: "purple", label: "Purple", swatch: "#7B3FA1" },
  { id: "emerald", label: "Emerald", swatch: "#009B77" },
  { id: "royal-blue", label: "Royal Blue", swatch: "#4169E1" },
  { id: "pastel-pink", label: "Pastel Pink", swatch: "#F8C8DC" },
  { id: "blush", label: "Blush", swatch: "#F4C2C2" },
  { id: "coral-1", label: "Coral", swatch: "#FF6F61" },
  { id: "mustard", label: "Mustard", swatch: "#D4A017" },
  { id: "coral-2", label: "Coral", swatch: "#FF6F61" },
  { id: "silver", label: "Silver", swatch: "#C0C0C0" },
  { id: "grey", label: "Grey", swatch: "#808080" },
  { id: "yellow", label: "Yellow", swatch: "#FFD54F" },
  { id: "red-2", label: "Red", swatch: "#D32F2F" },
  { id: "lavender", label: "Lavender", swatch: "#C8A2C8" },
  { id: "black", label: "Black", swatch: "#1A1A1A" },
  { id: "multicolor", label: "Multicolor", swatch: "multicolor" },
];
