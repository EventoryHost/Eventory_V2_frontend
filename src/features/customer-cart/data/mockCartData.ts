import type { CartPageData } from "../types";

// Reuse the same vendor-category photography already shipped for the
// packages/vendors pages instead of introducing new assets.
export const mockCartPageData: CartPageData = {
  breadcrumb: [
    { label: "Home", href: "/" },
    { label: "Packages", href: "/packages" },
    { label: "Makeup Artists" },
  ],
  vendors: [
    {
      id: "vendor-1",
      vendorName: "Glamour & Grace Studio",
      avatarInitial: "G",
      selected: true,
      package: {
        id: "package-1",
        categoryLabel: "Makeup Artist",
        title: "Glamour & Grace - Silver Package",
        image: "/images/customer/makeup.png",
        price: 14399,
        discountPercent: 20,
        href: "/packages",
      },
      eventDetails: {
        date: "12 March, 2026",
        timeRange: "01:00 PM - 05:00 PM",
        guestCount: 150,
        location: "Guwahati, Assam",
      },
    },
    {
      id: "vendor-2",
      vendorName: "Bloom & Petal Florists",
      avatarInitial: "B",
      selected: false,
      package: {
        id: "package-2",
        categoryLabel: "Decorator",
        title: "Bloom & Petal - Signature Floral Package",
        image: "/images/customer/decorator.png",
        price: 24100,
        discountPercent: 15,
        href: "/packages",
      },
      eventDetails: {
        date: null,
        timeRange: null,
        guestCount: null,
        location: null,
      },
    },
  ],
  addons: [
    {
      id: "addon-1",
      title: "Hair Extension",
      category: "Hair Styling",
      image: "/images/customer/haldi.jpg",
      price: 14399,
      unitLabel: "/Person",
      added: false,
    },
    {
      id: "addon-2",
      title: "Nail Art",
      category: "Nail Design",
      image: "/images/customer/holi.jpg",
      price: 4399,
      unitLabel: "/Person",
      added: false,
    },
    {
      id: "addon-3",
      title: "Facial Treatment",
      category: "Skin Care",
      image: "/images/customer/expo.jpg",
      price: 6399,
      unitLabel: "/Person",
      added: false,
    },
    {
      id: "addon-4",
      title: "Makeup Service",
      category: "Event Makeup",
      image: "/images/customer/tech.jpg",
      price: 9399,
      unitLabel: "/Person",
      added: false,
    },
  ],
};

export interface CouponDefinition {
  code: string;
  discountLabel: string;
  discountPercent?: number;
  discountFlat?: number;
}

// Mock coupon catalogue — swap for a real `/cart/coupons/validate` call once
// the endpoint exists (see services/applyCouponCode.ts).
export const mockCoupons: CouponDefinition[] = [
  { code: "EVENTORY10", discountLabel: "10% off", discountPercent: 10 },
  { code: "WELCOME500", discountLabel: "₹500 off", discountFlat: 500 },
];
