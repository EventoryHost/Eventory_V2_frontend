import type { Vendor } from "../types";

// Reuse the same vendor-category photography already shipped for the landing
// page / packages page instead of introducing new assets (see
// src/features/customer-packages/data/mockPackagesPageData.ts).
const CATEGORY_HERO_IMAGE: Record<string, string> = {
  "makeup-artist": "/images/customer/makeup.png",
  caterer: "/images/customer/caterers.png",
  "venue-provider": "/images/customer/venue.png",
  "dj-artist": "/images/customer/dj.png",
  decorator: "/images/customer/decorator.png",
  photographer: "/images/customer/video.png",
};

const EVENT_SCENE_IMAGES = [
  "/images/customer/haldi.jpg",
  "/images/customer/holi.jpg",
  "/images/customer/expo.jpg",
  "/images/customer/tech.jpg",
  "/images/customer/corporate.jpg",
  "/images/customer/planningcorp.jpg",
];

const CATEGORY_LABEL: Record<string, string> = {
  "makeup-artist": "Makeup Artist",
  caterer: "Caterer",
  "venue-provider": "Venue Provider",
  "dj-artist": "Dj Artist",
  decorator: "Decorator",
  photographer: "Photographer",
};

function image(categoryId: string, offset: number) {
  return offset === 0
    ? CATEGORY_HERO_IMAGE[categoryId]
    : EVENT_SCENE_IMAGES[offset % EVENT_SCENE_IMAGES.length];
}

interface VendorSeed {
  id: string;
  category: string;
  name: string;
  packageName: string;
  eventTypes: string[];
  services: string[];
  rating: number;
  reviewCount: number;
  duration: string;
  guestCapacity: string;
  startingPrice: number;
  location: string;
  description: string;
  imageOffset: number;
}

const SEEDS: VendorSeed[] = [
  // Makeup Artist
  {
    id: "ma-1",
    category: "makeup-artist",
    name: "Neon Pulse Studio",
    packageName: "Neon Pulse Club & Wedding - Gold Package",
    eventTypes: ["wedding", "anniversary"],
    services: ["bridal-makeup", "hd-makeup", "hairstyling"],
    rating: 4.5,
    reviewCount: 13,
    duration: "Full day (8 hrs)",
    guestCapacity: "Upto 300 guests",
    startingPrice: 15999,
    location: "Delhi NCR, New Delhi",
    description:
      "Full-service bridal and event makeup studio known for flawless HD finishes and long-lasting looks for weddings and receptions.",
    imageOffset: 0,
  },
  {
    id: "ma-2",
    category: "makeup-artist",
    name: "Glamour & Grace",
    packageName: "Glamour & Grace - Silver Package",
    eventTypes: ["wedding", "birthday"],
    services: ["party-makeup", "hd-makeup", "hairstyling"],
    rating: 4.8,
    reviewCount: 22,
    duration: "Full day (8 hrs)",
    guestCapacity: "Upto 150 guests",
    startingPrice: 14399,
    location: "Bangalore, Whitefield",
    description:
      "Specializing in trendy looks and precision application, perfect for proms and events where you want to stand out from the crowd.",
    imageOffset: 1,
  },
  {
    id: "ma-3",
    category: "makeup-artist",
    name: "Luxe Beauty Studio",
    packageName: "Luxe Beauty Studio - Platinum Package",
    eventTypes: ["wedding", "engagement"],
    services: ["bridal-makeup", "airbrush-makeup"],
    rating: 4.7,
    reviewCount: 18,
    duration: "Full day (10 hrs)",
    guestCapacity: "Upto 50 guests",
    startingPrice: 25999,
    location: "Mumbai, Juhu",
    description:
      "Premium airbrush and bridal makeup artistry with a personal styling consultation included in every package.",
    imageOffset: 2,
  },
  {
    id: "ma-4",
    category: "makeup-artist",
    name: "Artistic Glow",
    packageName: "Artistic Glow - Bridal Special",
    eventTypes: ["wedding", "mehendi"],
    services: ["bridal-makeup", "engagement-makeup"],
    rating: 4.9,
    reviewCount: 31,
    duration: "Half day (4 hrs)",
    guestCapacity: "Upto 20 guests",
    startingPrice: 18500,
    location: "Ghaziabad, Indirapuram",
    description:
      "Bridal-focused studio offering trial sessions, on-location service, and a dedicated hairstylist for the full wedding party.",
    imageOffset: 3,
  },
  {
    id: "ma-5",
    category: "makeup-artist",
    name: "Modern Maven",
    packageName: "Modern Maven - Premium HD",
    eventTypes: ["corporate-event", "birthday"],
    services: ["hd-makeup", "party-makeup"],
    rating: 4.6,
    reviewCount: 9,
    duration: "Half day (5 hrs)",
    guestCapacity: "Upto 80 guests",
    startingPrice: 12000,
    location: "Ghaziabad, Vaishali",
    description:
      "Camera-ready HD makeup for corporate shoots, launches, and celebrations with quick turnaround touch-up service.",
    imageOffset: 4,
  },
  {
    id: "ma-6",
    category: "makeup-artist",
    name: "Elegant Strokes",
    packageName: "Elegant Strokes - Bridal Studio",
    eventTypes: ["wedding", "reception"],
    services: ["bridal-makeup", "reception-makeup"],
    rating: 4.7,
    reviewCount: 27,
    duration: "Full day (9 hrs)",
    guestCapacity: "Upto 200 guests",
    startingPrice: 22999,
    location: "Ghaziabad, Raj Nagar Extension",
    description:
      "Two-decade legacy studio offering traditional and contemporary bridal looks with celebrity-trained artists.",
    imageOffset: 5,
  },
  {
    id: "ma-7",
    category: "makeup-artist",
    name: "Celebrity Touch",
    packageName: "Celebrity Touch - Signature Package",
    eventTypes: ["wedding", "anniversary", "engagement"],
    services: ["celebrity-makeup", "groom-makeup"],
    rating: 4.4,
    reviewCount: 11,
    duration: "Full day (8 hrs)",
    guestCapacity: "Upto 100 guests",
    startingPrice: 9999,
    location: "Ghaziabad, Kaushambi",
    description:
      "Affordable celebrity-style makeup packages covering both bride and groom for the full wedding weekend.",
    imageOffset: 0,
  },

  // Caterer
  {
    id: "ct-1",
    category: "caterer",
    name: "Royal Feast Caterers",
    packageName: "Royal Feast - Grand Wedding Buffet",
    eventTypes: ["wedding", "corporate-event"],
    services: ["buffet-setup", "live-counters"],
    rating: 4.6,
    reviewCount: 41,
    duration: "Full day (6 hrs)",
    guestCapacity: "Upto 500 guests",
    startingPrice: 799,
    location: "Delhi NCR, Dwarka",
    description:
      "Multi-cuisine live counters and buffet catering trusted for large weddings and corporate galas across Delhi NCR.",
    imageOffset: 1,
  },
  {
    id: "ct-2",
    category: "caterer",
    name: "Spice Route Catering",
    packageName: "Spice Route - Regional Delight",
    eventTypes: ["birthday", "mehendi"],
    services: ["regional-cuisine", "dessert-table"],
    rating: 4.5,
    reviewCount: 19,
    duration: "Half day (4 hrs)",
    guestCapacity: "Upto 150 guests",
    startingPrice: 499,
    location: "Noida, Sector 62",
    description:
      "Regional Indian specialties served fresh from live counters, with a dedicated dessert and chaat station.",
    imageOffset: 2,
  },
  {
    id: "ct-3",
    category: "caterer",
    name: "Urban Palate",
    packageName: "Urban Palate - Continental Combo",
    eventTypes: ["corporate-event"],
    services: ["buffet-setup", "beverage-counter"],
    rating: 4.3,
    reviewCount: 14,
    duration: "Half day (5 hrs)",
    guestCapacity: "Upto 100 guests",
    startingPrice: 699,
    location: "Gurugram, Cyber Hub",
    description:
      "Continental and fusion menus designed for corporate offsites, product launches, and formal receptions.",
    imageOffset: 3,
  },

  // Venue Provider
  {
    id: "vp-1",
    category: "venue-provider",
    name: "The Grand Banquet",
    packageName: "The Grand Banquet - City Hall",
    eventTypes: ["wedding", "corporate-event"],
    services: ["banquet-hall"],
    rating: 4.7,
    reviewCount: 52,
    duration: "Full day (12 hrs)",
    guestCapacity: "Upto 800 guests",
    startingPrice: 45000,
    location: "Delhi NCR, Rohini",
    description:
      "A spacious air-conditioned banquet hall with in-house decor and catering partners, ideal for large weddings.",
    imageOffset: 4,
  },
  {
    id: "vp-2",
    category: "venue-provider",
    name: "Skyline Terrace",
    packageName: "Skyline Terrace - Rooftop Party Venue",
    eventTypes: ["birthday", "engagement"],
    services: ["rooftop-venue"],
    rating: 4.6,
    reviewCount: 28,
    duration: "Evening (6 hrs)",
    guestCapacity: "Upto 150 guests",
    startingPrice: 35000,
    location: "Gurugram, Sector 29",
    description:
      "Skyline views and a curated bar setup make this rooftop venue a favourite for intimate celebrations.",
    imageOffset: 5,
  },
  {
    id: "vp-3",
    category: "venue-provider",
    name: "Green Meadows Farmhouse",
    packageName: "Green Meadows - Garden Wedding Package",
    eventTypes: ["wedding", "haldi"],
    services: ["garden-lawn", "farmhouse"],
    rating: 4.8,
    reviewCount: 37,
    duration: "Full day (14 hrs)",
    guestCapacity: "Upto 400 guests",
    startingPrice: 50000,
    location: "Noida, Greater Noida",
    description:
      "Sprawling lawns and farmhouse charm for multi-day wedding functions, with dedicated staging for haldi and sangeet.",
    imageOffset: 0,
  },

  // Dj Artist
  {
    id: "dj-1",
    category: "dj-artist",
    name: "BeatBox Entertainers",
    packageName: "BeatBox - Wedding Sangeet Package",
    eventTypes: ["wedding"],
    services: ["live-dj-console", "sound-lighting"],
    rating: 4.5,
    reviewCount: 24,
    duration: "Evening (5 hrs)",
    guestCapacity: "Upto 300 guests",
    startingPrice: 15000,
    location: "Delhi NCR, Karol Bagh",
    description:
      "High-energy sangeet and reception DJ sets with synchronized lighting and a live percussionist add-on.",
    imageOffset: 1,
  },
  {
    id: "dj-2",
    category: "dj-artist",
    name: "Pulse Sound Co.",
    packageName: "Pulse Sound - Corporate Event DJ",
    eventTypes: ["corporate-event"],
    services: ["sound-lighting", "led-screens"],
    rating: 4.4,
    reviewCount: 16,
    duration: "Full day (8 hrs)",
    guestCapacity: "Upto 200 guests",
    startingPrice: 20000,
    location: "Gurugram, DLF Phase 3",
    description:
      "Professional sound reinforcement and LED screen setups for conferences, launches, and award nights.",
    imageOffset: 2,
  },

  // Decorator
  {
    id: "dc-1",
    category: "decorator",
    name: "Petal & Light Decor",
    packageName: "Petal & Light - Floral Mandap Setup",
    eventTypes: ["wedding"],
    services: ["floral-decor", "backdrop-setup"],
    rating: 4.8,
    reviewCount: 33,
    duration: "Full day (10 hrs)",
    guestCapacity: "Upto 500 guests",
    startingPrice: 12000,
    location: "Delhi NCR, Pitampura",
    description:
      "Fresh floral mandaps and stage backdrops designed around your wedding colour palette.",
    imageOffset: 3,
  },
  {
    id: "dc-2",
    category: "decorator",
    name: "Balloon Bliss",
    packageName: "Balloon Bliss - Birthday Balloon Arch",
    eventTypes: ["birthday"],
    services: ["balloon-decor"],
    rating: 4.6,
    reviewCount: 21,
    duration: "Half day (3 hrs)",
    guestCapacity: "Upto 60 guests",
    startingPrice: 5000,
    location: "Noida, Sector 18",
    description:
      "Colourful balloon arches, backdrops, and themed setups for kids' and adult birthday parties alike.",
    imageOffset: 4,
  },
  {
    id: "dc-3",
    category: "decorator",
    name: "Ember & Ivory Events",
    packageName: "Ember & Ivory - Theme Decor Package",
    eventTypes: ["engagement", "anniversary"],
    services: ["theme-decor", "lighting-decor"],
    rating: 4.7,
    reviewCount: 15,
    duration: "Full day (8 hrs)",
    guestCapacity: "Upto 250 guests",
    startingPrice: 18000,
    location: "Gurugram, Sohna Road",
    description:
      "Bespoke theme decor and fairy-light installations for engagements, anniversaries, and intimate receptions.",
    imageOffset: 5,
  },

  // Photographer
  {
    id: "ph-1",
    category: "photographer",
    name: "Frame & Story",
    packageName: "Frame & Story - Wedding Candid Package",
    eventTypes: ["wedding"],
    services: ["candid-photography", "cinematic-videography"],
    rating: 4.9,
    reviewCount: 48,
    duration: "Full day (12 hrs)",
    guestCapacity: "Upto 500 guests",
    startingPrice: 25000,
    location: "Delhi NCR, Saket",
    description:
      "Candid-first wedding photography and cinematic films with same-week teaser edits for every couple.",
    imageOffset: 0,
  },
  {
    id: "ph-2",
    category: "photographer",
    name: "Aerial Lens Studio",
    packageName: "Aerial Lens - Drone Coverage Add-on",
    eventTypes: ["wedding", "corporate-event"],
    services: ["drone-coverage", "pre-wedding-shoot"],
    rating: 4.6,
    reviewCount: 20,
    duration: "Half day (4 hrs)",
    guestCapacity: "Upto 300 guests",
    startingPrice: 8000,
    location: "Gurugram, Golf Course Road",
    description:
      "Licensed drone operators delivering sweeping aerial coverage for venues, processions, and pre-wedding shoots.",
    imageOffset: 1,
  },
  {
    id: "ph-3",
    category: "photographer",
    name: "Timeless Frames",
    packageName: "Timeless Frames - Album Design & Print",
    eventTypes: ["wedding", "anniversary"],
    services: ["album-design", "candid-photography"],
    rating: 4.7,
    reviewCount: 26,
    duration: "Full day (10 hrs)",
    guestCapacity: "Upto 200 guests",
    startingPrice: 6000,
    location: "Ghaziabad, Vasundhara",
    description:
      "Premium leather-bound album design and printing bundled with full-day traditional and candid coverage.",
    imageOffset: 2,
  },
];

export const mockVendors: Vendor[] = SEEDS.map((seed) => ({
  id: seed.id,
  name: seed.name,
  packageName: seed.packageName,
  category: seed.category,
  categoryLabel: CATEGORY_LABEL[seed.category],
  eventTypes: seed.eventTypes,
  services: seed.services,
  rating: seed.rating,
  reviewCount: seed.reviewCount,
  duration: seed.duration,
  guestCapacity: seed.guestCapacity,
  startingPrice: seed.startingPrice,
  location: seed.location,
  description: seed.description,
  images: [image(seed.category, seed.imageOffset), image(seed.category, seed.imageOffset + 1)],
  isBookmarked: false,
}));
