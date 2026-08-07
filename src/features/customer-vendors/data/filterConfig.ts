import type { FilterOption, FilterSectionConfig, VendorCategory } from "../types";

// Same category slugs as src/features/customer-packages/data/mockPackagesPageData.ts
// so links between Packages <-> Vendors stay interoperable.
export const VENDOR_CATEGORIES: VendorCategory[] = [
  { id: "all", label: "All" },
  { id: "makeup-artist", label: "Makeup Artist" },
  { id: "caterer", label: "Caterer" },
  { id: "venue-provider", label: "Venue Provider" },
  { id: "dj-artist", label: "Dj Artist" },
  { id: "decorator", label: "Decorator" },
  { id: "photographer", label: "Photographer" },
];

export const EVENT_TYPE_OPTIONS: FilterOption[] = [
  { id: "wedding", label: "Wedding" },
  { id: "haldi", label: "Haldi" },
  { id: "corporate-event", label: "Corporate Event" },
  { id: "mehendi", label: "Mehendi" },
  { id: "birthday", label: "Birthday" },
  { id: "engagement", label: "Engagement" },
  { id: "anniversary", label: "Anniversary" },
];

export const PRICE_RANGE_OPTIONS: FilterOption[] = [
  { id: "5000-9999", label: "₹5000 - ₹9999" },
  { id: "10000-14999", label: "₹10000 - ₹14999" },
  { id: "15000-19999", label: "₹15000 - ₹19999" },
  { id: "20000-29999", label: "₹20000 - ₹29999" },
  { id: "30000-49999", label: "₹30000 - ₹49999" },
  { id: "50000-plus", label: "₹50000 and above" },
];

/** Service filter options per vendor category. Falls back to a merged list for "all". */
const SERVICE_OPTIONS_BY_CATEGORY: Record<string, FilterOption[]> = {
  "makeup-artist": [
    { id: "bridal-makeup", label: "Bridal Makeup" },
    { id: "party-makeup", label: "Party Makeup" },
    { id: "hd-makeup", label: "HD Makeup" },
    { id: "airbrush-makeup", label: "Airbrush Makeup" },
    { id: "engagement-makeup", label: "Engagement Makeup" },
    { id: "reception-makeup", label: "Reception Makeup" },
    { id: "groom-makeup", label: "Groom Makeup" },
    { id: "celebrity-makeup", label: "Celebrity Makeup" },
  ],
  caterer: [
    { id: "live-counters", label: "Live Counters" },
    { id: "buffet-setup", label: "Buffet Setup" },
    { id: "dessert-table", label: "Dessert Table" },
    { id: "beverage-counter", label: "Beverage Counter" },
    { id: "regional-cuisine", label: "Regional Cuisine" },
  ],
  "venue-provider": [
    { id: "banquet-hall", label: "Banquet Hall" },
    { id: "rooftop-venue", label: "Rooftop Venue" },
    { id: "garden-lawn", label: "Garden Lawn" },
    { id: "poolside-venue", label: "Poolside Venue" },
    { id: "farmhouse", label: "Farmhouse" },
  ],
  "dj-artist": [
    { id: "sound-lighting", label: "Sound & Lighting" },
    { id: "live-dj-console", label: "Live DJ Console" },
    { id: "dance-floor-setup", label: "Dance Floor Setup" },
    { id: "led-screens", label: "LED Screens" },
    { id: "live-band", label: "Live Band" },
  ],
  decorator: [
    { id: "balloon-decor", label: "Balloon Decor" },
    { id: "floral-decor", label: "Floral Decor" },
    { id: "theme-decor", label: "Theme Decor" },
    { id: "backdrop-setup", label: "Backdrop Setup" },
    { id: "lighting-decor", label: "Lighting Decor" },
  ],
  photographer: [
    { id: "candid-photography", label: "Candid Photography" },
    { id: "cinematic-videography", label: "Cinematic Videography" },
    { id: "drone-coverage", label: "Drone Coverage" },
    { id: "pre-wedding-shoot", label: "Pre-Wedding Shoot" },
    { id: "album-design", label: "Album Design" },
  ],
};

const SERVICE_SECTION_TITLE_BY_CATEGORY: Record<string, string> = {
  "makeup-artist": "Makeup Service",
  caterer: "Catering Service",
  "venue-provider": "Venue Service",
  "dj-artist": "DJ Service",
  decorator: "Decorator Service",
  photographer: "Photography Service",
};

export function getServiceOptionsForCategory(categoryId: string): FilterOption[] {
  if (categoryId !== "all" && SERVICE_OPTIONS_BY_CATEGORY[categoryId]) {
    return SERVICE_OPTIONS_BY_CATEGORY[categoryId];
  }
  return Object.values(SERVICE_OPTIONS_BY_CATEGORY).flat();
}

const ALL_SERVICE_OPTIONS = Object.values(SERVICE_OPTIONS_BY_CATEGORY).flat();

export function serviceLabel(serviceId: string): string {
  return ALL_SERVICE_OPTIONS.find((option) => option.id === serviceId)?.label ?? serviceId;
}

export function eventTypeLabel(eventTypeId: string): string {
  return EVENT_TYPE_OPTIONS.find((option) => option.id === eventTypeId)?.label ?? eventTypeId;
}

export function getFilterSectionsForCategory(categoryId: string): FilterSectionConfig[] {
  return [
    { id: "eventType", title: "Event Type", options: EVENT_TYPE_OPTIONS },
    {
      id: "service",
      title: SERVICE_SECTION_TITLE_BY_CATEGORY[categoryId] ?? "Service",
      options: getServiceOptionsForCategory(categoryId),
    },
    { id: "pricing", title: "Pricing", options: PRICE_RANGE_OPTIONS },
  ];
}
