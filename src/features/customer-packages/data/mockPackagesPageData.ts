import type {
  FestiveOffer,
  MagicalMomentsBlock,
  PackagesPageBlock,
  PackagesPageData,
} from "../types";

// Reuse the same vendor-category photography already shipped for the
// landing page (see BrowseVendors.tsx) instead of introducing new assets.
const CATEGORY_HERO_IMAGE: Record<string, string> = {
  decorator: "/images/customer/decorator.png",
  caterer: "/images/customer/caterers.png",
  "venue-provider": "/images/customer/venue.png",
  "dj-artist": "/images/customer/dj.png",
  "makeup-artist": "/images/customer/makeup.png",
  photographer: "/images/customer/video.png",
};

// General event-scene photography already in public/images/customer, cycled
// across the rest of each row so every card gets a real photo, not a repeat
// of the single category thumbnail.
const EVENT_SCENE_IMAGES = [
  "/images/customer/haldi.jpg",
  "/images/customer/holi.jpg",
  "/images/customer/expo.jpg",
  "/images/customer/tech.jpg",
  "/images/customer/corporate.jpg",
  "/images/customer/planningcorp.jpg",
  "/images/customer/packages-pics.png",
  "/images/customer/hero-explore-events.png",
  "/images/customer/ready-1.png",
  "/images/customer/needhelp.png",
];

function pickImage(categoryId: string, index: number, offset: number) {
  if (index === 0 && offset === 0) return CATEGORY_HERO_IMAGE[categoryId];
  return EVENT_SCENE_IMAGES[(index + offset) % EVENT_SCENE_IMAGES.length];
}

const FESTIVE_OFFER: FestiveOffer = {
  id: "festive-offer",
  image: "/images/customer/haldi.jpg",
  title: "Exclusive Festive Packages",
  subtitle: "Book now for upcoming Diwali & Wedding season events",
  discountLabel: "Up to 30%",
  discountCaption: "DISCOUNT",
  ctaLabel: "Get started - It's Free",
  // Not tied to a single category — routes to the general vendor listing.
  ctaHref: "/vendors",
};

const FESTIVE_OFFER_SECOND: FestiveOffer = {
  ...FESTIVE_OFFER,
  id: "festive-offer-second",
  image: "/images/customer/hero-explore-events.png",
};

const MAGICAL_MOMENTS_CAMPAIGN_IMAGE = "/images/customer/packages-pics.png";

function buildCategoryBlocks(
  categoryId: string,
  subcategories: string[],
  packages: { title: string; price: number }[],
  morePackages: { title: string; price: number }[]
): PackagesPageBlock[] {
  const magicalMoments: MagicalMomentsBlock = {
    id: `${categoryId}-magical-moments`,
    eyebrow: "Celebrate Joy",
    title: "Magical Moments",
    campaignImage: MAGICAL_MOMENTS_CAMPAIGN_IMAGE,
    packages: morePackages.map((pkg, i) => ({
      id: `${categoryId}-magical-${i}`,
      title: pkg.title,
      priceFrom: pkg.price,
      image: pickImage(categoryId, i, 6),
      href: `/vendors?category=${categoryId}`,
    })),
  };

  return [
    {
      type: "packageCategorySection",
      data: {
        id: `${categoryId}-subcategories`,
        heading: "Popular Package Categories",
        badgeLabel: "SPECIAL DISCOUNT",
        variant: "chip",
        items: subcategories.map((title, i) => ({
          id: `${categoryId}-sub-${i}`,
          title,
          image: pickImage(categoryId, i, 0),
          href: `/vendors?category=${categoryId}`,
        })),
      },
    },
    {
      type: "packageCategorySection",
      data: {
        id: `${categoryId}-packages`,
        heading: "Trending Packages",
        badgeLabel: "SPECIAL DISCOUNT",
        variant: "product",
        items: packages.map((pkg, i) => ({
          id: `${categoryId}-pkg-${i}`,
          title: pkg.title,
          priceFrom: pkg.price,
          image: pickImage(categoryId, i, 4),
          href: `/vendors?category=${categoryId}`,
        })),
      },
    },
    { type: "festiveOffer", data: FESTIVE_OFFER },
    {
      type: "packageCategorySection",
      data: {
        id: `${categoryId}-more-packages`,
        heading: "Handpicked For You",
        badgeLabel: "SPECIAL DISCOUNT",
        variant: "product",
        items: morePackages.map((pkg, i) => ({
          id: `${categoryId}-more-${i}`,
          title: pkg.title,
          priceFrom: pkg.price,
          image: pickImage(categoryId, i, 2),
          href: `/vendors?category=${categoryId}`,
        })),
      },
    },
    { type: "magicalMoments", data: magicalMoments },
    { type: "festiveOffer", data: FESTIVE_OFFER_SECOND },
  ];
}

export const mockPackagesPageData: PackagesPageData = {
  heroBanners: [
    {
      id: "hero-birthday",
      image: "/images/customer/packages-pics.png",
      title: "Birthday Aesthetics,\nDelivered Flawlessly.",
      subtitle: "Book top-tier decorators & curated party packages",
      ctaLabel: "Explore Packages",
      ctaHref: "/vendors?category=decorator",
    },
    {
      id: "hero-dj",
      image: "/images/customer/dj.png",
      title: "Every Beat,\nPerfectly Curated.",
      subtitle: "Book professional DJs & live sound artists",
      ctaLabel: "Explore Packages",
      ctaHref: "/vendors?category=dj-artist",
    },
    {
      id: "hero-anniversary",
      image: "/images/customer/hero-explore-events.png",
      title: "Marriage Anniversary,\nDelivered Flawlessly.",
      subtitle: "Book top-tier decorators & curated celebration packages",
      ctaLabel: "Explore Packages",
      ctaHref: "/vendors?category=decorator",
    },
  ],

  vendorCategories: [
    { id: "decorator", label: "Decorator", icon: "🎈" },
    { id: "caterer", label: "Caterer", icon: "🍱" },
    { id: "venue-provider", label: "Venue Provider", icon: "🏛️" },
    { id: "dj-artist", label: "Dj Artist", icon: "💿" },
    { id: "makeup-artist", label: "Makeup Artist", icon: "💄" },
    { id: "photographer", label: "Photographer", icon: "📷" },
  ],
  defaultVendorCategoryId: "decorator",

  blocksByCategory: {
    decorator: buildCategoryBlocks(
      "decorator",
      [
        "Balloons",
        "Table Decoration",
        "Lights Decoration",
        "Backdrop Setup",
        "Floral Decor",
        "Theme Decor",
        "Entrance Decor",
        "Ceiling Decor",
      ],
      [
        { title: "Birthday Balloon Arch", price: 5000 },
        { title: "Fairy-lit Backdrop", price: 6500 },
        { title: "Welcome Baby Setup", price: 7000 },
        { title: "Anniversary Surprise Setup", price: 8000 },
        { title: "Floral Mandap Setup", price: 12000 },
        { title: "Terrace Fairy-light Setup", price: 9000 },
      ],
      [
        { title: "Swimming Pool Decoration", price: 8500 },
        { title: "Mickey Mouse Theme Decoration", price: 6000 },
        { title: "Entrance Arch Decoration", price: 4500 },
        { title: "Ceiling Balloon Decor", price: 5500 },
      ]
    ),
    caterer: buildCategoryBlocks(
      "caterer",
      [
        "Live Counters",
        "Buffet Setup",
        "Dessert Table",
        "Beverage Counter",
        "Chaat Counter",
        "BBQ Station",
        "Regional Cuisine",
        "Tea/Coffee Station",
      ],
      [
        { title: "Veg Buffet Package", price: 499 },
        { title: "Live Pasta Counter", price: 299 },
        { title: "Dessert & Mocktail Combo", price: 399 },
        { title: "Premium Non-Veg Spread", price: 799 },
        { title: "South Indian Special", price: 549 },
        { title: "Continental Buffet", price: 699 },
      ],
      [
        { title: "Chaat Counter Combo", price: 349 },
        { title: "BBQ Live Grill Station", price: 649 },
        { title: "Tea & Coffee Station", price: 199 },
        { title: "Regional Thali Spread", price: 449 },
      ]
    ),
    "venue-provider": buildCategoryBlocks(
      "venue-provider",
      [
        "Banquet Hall",
        "Rooftop Venue",
        "Garden Lawn",
        "Poolside Venue",
        "Farmhouse",
        "Conference Hall",
        "Beachside Venue",
        "Heritage Property",
      ],
      [
        { title: "City Banquet Hall", price: 45000 },
        { title: "Rooftop Party Venue", price: 35000 },
        { title: "Garden Lawn Setup", price: 50000 },
        { title: "Poolside Venue", price: 60000 },
        { title: "Farmhouse Getaway", price: 40000 },
        { title: "Heritage Palace Venue", price: 75000 },
      ],
      [
        { title: "Conference Hall Package", price: 30000 },
        { title: "Beachside Venue Package", price: 65000 },
        { title: "Poolside Sundowner Venue", price: 48000 },
        { title: "Garden Lawn Wedding Venue", price: 55000 },
      ]
    ),
    "dj-artist": buildCategoryBlocks(
      "dj-artist",
      [
        "Sound & Lighting",
        "Live DJ Console",
        "Dance Floor Setup",
        "Karaoke Setup",
        "LED Screens",
        "Fog & Special FX",
        "Live Band",
        "Anchor & Host",
      ],
      [
        { title: "Wedding Sangeet DJ", price: 15000 },
        { title: "Birthday Party DJ", price: 8000 },
        { title: "Corporate Event DJ", price: 20000 },
        { title: "Sound & Light Combo", price: 12000 },
        { title: "Live Band Performance", price: 25000 },
        { title: "Anchor + DJ Combo", price: 18000 },
      ],
      [
        { title: "LED Screen Setup", price: 14000 },
        { title: "Fog & Special FX Package", price: 9000 },
        { title: "Karaoke Party Setup", price: 7000 },
        { title: "Dance Floor Lighting Rig", price: 11000 },
      ]
    ),
    "makeup-artist": buildCategoryBlocks(
      "makeup-artist",
      [
        "Bridal Makeup",
        "Party Makeup",
        "HD Makeup",
        "Airbrush Makeup",
        "Hairstyling",
        "Mehendi Artist",
        "Saree Draping",
        "Groom Grooming",
      ],
      [
        { title: "Bridal Makeup Package", price: 10000 },
        { title: "Party Makeup Package", price: 3000 },
        { title: "HD Makeup + Hairstyle", price: 6000 },
        { title: "Airbrush Makeup", price: 8000 },
        { title: "Mehendi + Makeup Combo", price: 9000 },
        { title: "Groom Grooming Package", price: 5000 },
      ],
      [
        { title: "Hairstyling & Draping Combo", price: 3500 },
        { title: "Mehendi Artist Package", price: 4000 },
        { title: "Saree Draping Service", price: 1500 },
        { title: "Groom Grooming Special", price: 4500 },
      ]
    ),
    photographer: buildCategoryBlocks(
      "photographer",
      [
        "Candid Photography",
        "Cinematic Videography",
        "Drone Coverage",
        "Pre-Wedding Shoot",
        "Album Design",
        "Live Streaming",
        "Traditional Photography",
        "Same-Day Edit",
      ],
      [
        { title: "Wedding Candid Package", price: 25000 },
        { title: "Pre-Wedding Shoot", price: 15000 },
        { title: "Drone Coverage Add-on", price: 8000 },
        { title: "Full Event Cinematic Film", price: 35000 },
        { title: "Album Design & Print", price: 6000 },
        { title: "Live Streaming Setup", price: 10000 },
      ],
      [
        { title: "Traditional Photography Package", price: 12000 },
        { title: "Same-Day Edit Package", price: 18000 },
        { title: "Live Streaming Add-on", price: 7000 },
        { title: "Drone + Album Combo", price: 16000 },
      ]
    ),
  },
};
