import { apiFetch } from "./apiClient";

// Raw shapes returned by /api/customer/wishlist/*, verified against
// Eventory_V2_backend/src/controllers/customerWishlistController.js.
// Every route here requires a logged-in customer — callers must gate on
// isLoggedIn before calling (a 401 otherwise).

/**
 * The package's own vendor. The controller does NOT populate it (every seeded
 * Package.vendorId fails that cast — see resolveVendor.js); it resolves the
 * vendor manually and assigns the resulting PUBLIC_VENDOR_FIELDS object onto
 * packageId.vendorId, so this is an OBJECT here, never an id string. It is
 * null when no vendor could be resolved.
 */
export interface RawWishlistPackageVendor {
  _id?: string;
  id?: string;
  businessName?: string;
  city?: string;
  state?: string;
  serviceAreas?: string[];
  rating?: number;
  reviewsCount?: number;
}

/** Package fields GET /customer/wishlist populates into a row (PACKAGE_CARD_FIELDS). */
export interface RawWishlistPackage {
  _id: string;
  vendorId?: RawWishlistPackageVendor | null;
  /** Backend enum ("Caterer", "MakeupArtist", …) — map with VENDOR_TYPE_TO_CATEGORY. */
  vendorType?: string;
  variantType?: string;
  packageStatus?: string;
  step1_eventAndCrew?: { packageName?: string; eventCategories?: string[] };
  step4_sampleMedia?: { media?: { url?: string }[] };
}

/** Vendor fields populated into a row (PUBLIC_VENDOR_FIELDS). */
export interface RawWishlistVendor {
  _id: string;
  id?: string;
  businessName?: string;
  vendorType?: string;
  profilePicture?: string;
  city?: string;
  serviceAreas?: string[];
  eventCategories?: string[];
  rating?: number;
  reviewsCount?: number;
}

/**
 * A row from GET /customer/wishlist.
 *
 * packageId and vendorId arrive POPULATED here — the controller runs
 * .populate() on both, so they are objects, not id strings. POST to the same
 * resource returns the raw created document instead, where they ARE strings;
 * that shape is RawCreatedWishlistItem below. Conflating the two is what made
 * `item.packageId === somePackageId` silently always false.
 */
export interface RawWishlistItem {
  _id: string;
  customerId: string;
  itemType: "Package" | "Vendor";
  packageId: RawWishlistPackage | null;
  vendorId: RawWishlistVendor | null;
  note: string;
  priceSnapshot: number | null;
  createdAt: string;
  packageStillAvailable?: boolean;
  currentPrice?: number | null;
  priceChanged?: boolean;
}

/** POST /customer/wishlist returns the raw created doc — ids are plain strings, not populated. */
export interface RawCreatedWishlistItem {
  _id: string;
  customerId: string;
  itemType: "Package" | "Vendor";
  packageId: string | null;
  vendorId: string | null;
  note: string;
  priceSnapshot: number | null;
  createdAt: string;
}

export interface AddWishlistItemParams {
  itemType: "Package" | "Vendor";
  packageId?: string;
  vendorId?: string;
  note?: string;
}

export async function getWishlist() {
  return apiFetch<{ status: "SUCCESS"; count: number; items: RawWishlistItem[] }>("/customer/wishlist", {
    auth: true,
  });
}

export async function addWishlistItem(params: AddWishlistItemParams) {
  return apiFetch<{ status: "SUCCESS"; message: string; item: RawCreatedWishlistItem }>("/customer/wishlist", {
    method: "POST",
    auth: true,
    body: params,
  });
}

export async function removeWishlistItem(itemId: string) {
  return apiFetch<{ status: "SUCCESS"; message: string }>(`/customer/wishlist/${itemId}`, {
    method: "DELETE",
    auth: true,
  });
}
