import { apiFetch } from "./apiClient";

// Raw shapes returned by /api/customer/compare/*, verified against
// Eventory_V2_backend/src/controllers/customerCompareController.js.
// Every route requires a logged-in customer (401 otherwise).
//
// The comparison is a server-side session holding AT MOST 3 packages, all of
// one vendorType — both rules are enforced by the backend (409 with a
// human-readable message), not here, so callers should surface that message.
//
// Only the fields the wishlist's "Compare Packages" action and the /compare
// page need are typed. The rest of the payload (pricing/capacity/policy/media
// per package) stays untyped on purpose: the comparison table is filled from
// the package-detail endpoint, which carries far more of what it shows — see
// customer-compare/services/getComparison.ts.

/** The backend caps a comparison at three packages (409 beyond that). */
export const MAX_COMPARE_PACKAGES = 3;

export interface CompareItemSummary {
  packageId: string;
  packageName: string | null;
  variantType?: string;
  vendorType: string;
}

export interface CompareResponse {
  status: "SUCCESS";
  message?: string;
  /** The single vendorType the comparison is locked to, or null when empty. */
  vendorType: string | null;
  count: number;
  items: CompareItemSummary[];
}

export async function getCompare() {
  return apiFetch<CompareResponse>("/customer/compare", { auth: true });
}

export async function addCompareItem(packageId: string) {
  return apiFetch<CompareResponse>("/customer/compare/items", {
    method: "POST",
    auth: true,
    body: { packageId },
  });
}

export async function removeCompareItem(packageId: string) {
  return apiFetch<CompareResponse>(`/customer/compare/items/${packageId}`, {
    method: "DELETE",
    auth: true,
  });
}

export async function clearCompare() {
  return apiFetch<{ status: "SUCCESS"; message: string }>("/customer/compare", {
    method: "DELETE",
    auth: true,
  });
}
