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
    id: "Carpet/Flooring Decor",
    label: "Carpet/Flooring Decor",
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
  "Carpet/Flooring Decor": "/images/customize/carpet.png",
  Furnitures: "/images/customize/furniture.png",
  Signage: "/images/customize/signage.png",
  "Fabric/Drapery": "/images/customize/fabric.png",
  Balloons: "/images/customize/balloon.png",
};

export const COLOUR_PALETTE: ColourOption[] = [
  { id: "marigold", label: "Marigold", swatch: "#F0A500" },
  { id: "ivory", label: "Cream/Ivory", swatch: "#F5EEDC" },
  { id: "rose-gold", label: "Rose Gold", swatch: "#DB9A93" },
  { id: "maroon", label: "Maroon", swatch: "#5C0A24" },
  { id: "champagne", label: "Champagne", swatch: "#E8D9B5" },
  { id: "gold", label: "Gold", swatch: "#D4AF37" },
  { id: "terracotta", label: "Terracotta", swatch: "#B5602D" },
  { id: "warm-white", label: "Warm White", swatch: "#FBF6EC" },
  { id: "blush-pink", label: "Blush Pink", swatch: "#F4C2C2" },
  { id: "forest-green", label: "Forest Green", swatch: "#2E4A3D" },
  { id: "navy", label: "Navy", swatch: "#1B2A4A" },
  { id: "charcoal", label: "Charcoal", swatch: "#333333" },
  { id: "natural-wood", label: "Natural Wood", swatch: "#A0784A" },
];
