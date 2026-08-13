import { apiFetch } from "./apiClient";

// Raw shapes returned by /api/customer/wishlist/*, verified against
// Eventory_V2_backend/src/controllers/customerWishlistController.js.
// Every route here requires a logged-in customer — callers must gate on
// isLoggedIn before calling (a 401 otherwise).

export interface RawWishlistItem {
  _id: string;
  customerId: string;
  itemType: "Package" | "Vendor";
  packageId: string | null;
  vendorId: string | null;
  note: string;
  priceSnapshot: number | null;
  createdAt: string;
  packageStillAvailable?: boolean;
  currentPrice?: number | null;
  priceChanged?: boolean;
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
  return apiFetch<{ status: "SUCCESS"; message: string; item: RawWishlistItem }>("/customer/wishlist", {
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
