import {
  Armchair,
  Flower2,
  Grid3x3,
  Lightbulb,
  PartyPopper,
  Shirt,
  Signpost,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import type { ColourOption, WorkshopCategoryDef } from "../types";

// The platform-defined category set customers pick from when adding a new
// item in the workshop (design doc §3, Screen 3 — "closed grid, not free
// text": recognition beats recall, and it keeps requests machine-readable
// for the vendor).
export const WORKSHOP_CATEGORIES: WorkshopCategoryDef[] = [
  { id: "Flowers", label: "Flowers", typeLabel: "Flower type", typeOptions: ["Rose", "Jasmine", "Lily", "Marigold", "Orchid"] },
  { id: "Lighting", label: "Lighting", typeLabel: "Fixture type", typeOptions: ["Fairy Lights", "Lanterns", "Chandelier", "Uplighting"] },
  { id: "Carpet", label: "Carpet", typeLabel: "Carpet type", typeOptions: ["Red Runner", "Patterned", "Plain Beige", "Velvet"] },
  { id: "Furniture", label: "Furniture", typeLabel: "Furniture type", typeOptions: ["Chair", "Table", "Sofa", "Bench"] },
  { id: "Signage", label: "Signage", typeLabel: "Signage type", typeOptions: ["Welcome Board", "Table Numbers", "Directional Sign", "Neon Sign"] },
  { id: "Fabric/Drapery", label: "Fabric/Drapery", typeLabel: "Fabric type", typeOptions: ["Lace", "Satin", "Linen", "Organza"] },
  { id: "Balloon Decor", label: "Balloon Decor", typeLabel: "Balloon style", typeOptions: ["Arch", "Garland", "Cluster", "Column"] },
  { id: "Rangoli", label: "Rangoli", typeLabel: "Rangoli style", typeOptions: ["Floral", "Geometric", "Traditional", "Colour Powder"] },
];

// How full/dense a decor item should look — backend stores this as a free
// string per item (decoratorStep2Schema.js), so any vendor-entered original
// value is preserved even if it doesn't match one of these three.
export const VOLUME_OPTIONS = ["Low", "Medium", "High"];

export const WORKSHOP_CATEGORY_ICONS: Record<string, LucideIcon> = {
  Flowers: Flower2,
  Lighting: Lightbulb,
  Carpet: Grid3x3,
  Furniture: Armchair,
  Signage: Signpost,
  "Fabric/Drapery": Shirt,
  "Balloon Decor": PartyPopper,
  Rangoli: Sparkles,
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
