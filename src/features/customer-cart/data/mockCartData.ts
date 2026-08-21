import type { CartPageData } from "../types";

// Fallback display data for when GET /api/customer/cart can't be reached
// (network/5xx) — see services/getCartPageData.ts. Shaped to match the real
// cart response exactly (CartVendor is one real cart ITEM, not a vendor),
// so components never need to branch on live-vs-fallback data.
export const mockCartPageData: CartPageData = {
  breadcrumb: [
    { label: "Home", href: "/" },
    { label: "Packages", href: "/packages" },
    { label: "Cart" },
  ],
  vendors: [
    {
      id: "mock-item-1",
      vendorId: "mock-vendor-1",
      vendorName: "Glamour & Grace Studio",
      avatarInitial: "G",
      package: {
        id: "mock-package-1",
        categoryLabel: "Makeup Artist",
        title: "Glamour & Grace - Silver Package",
        image: "/images/customer/makeup.png",
        price: 14399,
        href: "/packages/mock-package-1",
      },
      selected: true,
      eventDetails: {
        date: "2026-03-12",
        timeRange: "01:00 PM - 05:00 PM",
        guestCount: 150,
        location: "Guwahati, Assam",
      },
      packageStillAvailable: true,
      priceChanged: false,
      addons: [
        {
          id: "mock-addon-1",
          title: "Hair Extension",
          category: "Hair Styling",
          image: "/images/customer/expo.jpg",
          price: 14399,
          unitLabel: "/Person",
          added: true,
          quantity: 1,
          variant: "Shade: Natural Black",
        },
        {
          id: "mock-addon-2",
          title: "Nail Art",
          category: "Nail Design",
          image: "/images/customer/tech.jpg",
          price: 4399,
          unitLabel: "/Person",
          added: true,
          quantity: 2,
          variant: "Style: French Tip",
        },
      ],
    },
    {
      id: "mock-item-2",
      vendorId: "mock-vendor-2",
      vendorName: "Bloom & Petal Florists",
      avatarInitial: "B",
      package: {
        id: "mock-package-2",
        categoryLabel: "Decorator",
        title: "Bloom & Petal - Signature Floral Package",
        image: "/images/customer/decorator.png",
        price: 24100,
        href: "/packages/mock-package-2",
      },
      selected: false,
      eventDetails: {
        date: null,
        timeRange: null,
        guestCount: null,
        location: null,
      },
      packageStillAvailable: true,
      priceChanged: false,
      addons: [],
    },
  ],
  itemCount: 2,
  vendorCount: 2,
  subtotal: 61696,
  discount: 0,
  total: 61696,
};
