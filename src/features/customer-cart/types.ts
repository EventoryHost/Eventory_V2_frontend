// Domain types for the customer-facing Cart page — shaped around the real
// GET /api/customer/cart response (Eventory_V2_backend), which is
// item-centric (a vendor can have several items; add-ons live per item, not
// in a shared catalog) rather than the old one-vendor-one-package mock.
// `CartVendor` below is kept as the name for minimal component churn, but
// represents one real cart ITEM now, not a vendor.

export interface EventDetails {
  date: string | null;
  timeRange: string | null;
  guestCount: number | null;
  location: string | null;
}

export interface CartPackage {
  /** The package's own id — used for `href` and for looking up recommended add-ons. */
  id: string;
  categoryLabel: string;
  title: string;
  image?: string;
  price: number;
  /** Package-detail route, e.g. `/packages/${id}` — see src/features/customer-package-detail. */
  href: string;
}

export interface CartAddon {
  /** The vendor's add-on subdocument id when known, else a synthesized id. */
  id: string;
  title: string;
  category: string;
  image?: string;
  price: number;
  unitLabel: string;
  added: boolean;
  quantity: number;
  variant?: string;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface CartVendor {
  /** Real CartItem._id — every mutation (update/remove/move-to-wishlist) targets this. */
  id: string;
  vendorId: string;
  vendorName: string;
  avatarInitial: string;
  package: CartPackage;
  selected: boolean;
  eventDetails: EventDetails;
  packageStillAvailable: boolean;
  priceChanged: boolean;
  addons: CartAddon[];
}

export interface CartPageData {
  breadcrumb: BreadcrumbItem[];
  vendors: CartVendor[];
  itemCount: number;
  vendorCount: number;
  subtotal: number;
  discount: number;
  total: number;
}

export interface AppliedCoupon {
  code: string;
  discountLabel: string;
}

/**
 * "People also buy this" — sourced from each in-cart package's own add-on
 * catalog (Decorator packages only; no add-on catalog exists for any other
 * vendorType), not a fabricated shared list. `itemId` is the cart item this
 * add-on would attach to if picked.
 */
export interface RecommendedAddon {
  id: string;
  itemId: string;
  title: string;
  category: string;
  image?: string;
  price: number;
  unitLabel: string;
}
