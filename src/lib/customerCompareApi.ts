import { apiFetch } from "./apiClient";
import { getAccessToken } from "./customerSession";
import { getPackageDetail as fetchRawPackage } from "./customerPackageDetailApi";

// Raw shapes returned by /api/customer/compare/*, verified against
// Eventory_V2_backend/src/controllers/customerCompareController.js.
// The server routes require a logged-in customer (401 otherwise), so a visitor
// who isn't logged in gets the same behaviour from a comparison kept in this
// browser's localStorage (same idea as the guest cart) — see the guest*
// helpers below. Logging in later simply starts using the server session.
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

const GUEST_KEY = "eventory_guest_compare";

function isGuest(): boolean {
  return !getAccessToken();
}

function readGuest(): CompareItemSummary[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(GUEST_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeGuest(items: CompareItemSummary[]) {
  try {
    window.localStorage.setItem(GUEST_KEY, JSON.stringify(items));
  } catch {
    // Storage unavailable: the comparison just won't persist.
  }
}

function guestResponse(items: CompareItemSummary[]): CompareResponse {
  return { status: "SUCCESS", vendorType: items[0]?.vendorType ?? null, count: items.length, items };
}

// Same two rules the server enforces: one vendorType, at most three packages.
async function addGuestItem(packageId: string): Promise<CompareResponse> {
  const items = readGuest();
  if (items.some((item) => item.packageId === packageId)) return guestResponse(items);
  if (items.length >= MAX_COMPARE_PACKAGES) {
    throw new Error(`You can compare up to ${MAX_COMPARE_PACKAGES} packages at a time.`);
  }
  const { package: pkg } = await fetchRawPackage(packageId);
  if (items[0] && items[0].vendorType !== pkg.vendorType) {
    throw new Error("You can only compare packages from the same category.");
  }
  const next = [
    ...items,
    { packageId, packageName: pkg.step1_eventAndCrew?.packageName ?? null, variantType: pkg.variantType, vendorType: pkg.vendorType },
  ];
  writeGuest(next);
  return guestResponse(next);
}

export async function getCompare() {
  if (isGuest()) return guestResponse(readGuest());
  return apiFetch<CompareResponse>("/customer/compare", { auth: true });
}

export async function addCompareItem(packageId: string) {
  if (isGuest()) return addGuestItem(packageId);
  return apiFetch<CompareResponse>("/customer/compare/items", {
    method: "POST",
    auth: true,
    body: { packageId },
  });
}

export async function removeCompareItem(packageId: string) {
  if (isGuest()) {
    const next = readGuest().filter((item) => item.packageId !== packageId);
    writeGuest(next);
    return guestResponse(next);
  }
  return apiFetch<CompareResponse>(`/customer/compare/items/${packageId}`, {
    method: "DELETE",
    auth: true,
  });
}

export async function clearCompare() {
  if (isGuest()) {
    writeGuest([]);
    return { status: "SUCCESS" as const, message: "Comparison cleared" };
  }
  return apiFetch<{ status: "SUCCESS"; message: string }>("/customer/compare", {
    method: "DELETE",
    auth: true,
  });
}
