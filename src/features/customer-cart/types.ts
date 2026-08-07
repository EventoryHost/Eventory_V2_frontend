// Domain types for the customer-facing Cart page.
// Shaped to mirror what the backend "cart" endpoint is expected to return, so
// `services/getCartPageData.ts` can swap its mock data for a real `fetch`
// without any component needing to change.

export interface EventDetails {
  date: string | null;
  timeRange: string | null;
  guestCount: number | null;
  location: string | null;
}

export interface CartPackage {
  id: string;
  categoryLabel: string;
  title: string;
  image: string;
  price: number;
  discountPercent?: number;
  /** Existing package-detail route, once one exists. Falls back to /packages today. */
  href: string;
}

export interface CartVendor {
  id: string;
  vendorName: string;
  avatarInitial: string;
  package: CartPackage;
  selected: boolean;
  eventDetails: EventDetails;
}

export interface CartAddon {
  id: string;
  title: string;
  category: string;
  image: string;
  price: number;
  unitLabel: string;
  added: boolean;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface CartPageData {
  breadcrumb: BreadcrumbItem[];
  vendors: CartVendor[];
  addons: CartAddon[];
}

export interface AppliedCoupon {
  code: string;
  discountLabel: string;
  discountPercent?: number;
  discountFlat?: number;
}
