import { apiFetch } from "./apiClient";
import { getGuestCartId, setGuestCartId, clearGuestCartId } from "./guestCart";

// Raw shapes returned by the /api/customer/cart/* routes, verified directly
// against Eventory_V2_backend/src/controllers/customerCartController.js and
// src/services/cartPricingService.js — every cart route is "soft auth"
// (identifyCartOwner): a logged-in customer's own cart, or an anonymous
// guest cart keyed by an X-Guest-Cart-Id header, except /move-to-wishlist
// and /merge which require a real account.

export interface RawCartAddOn {
  addOnId?: string;
  name: string;
  price: number;
  quantity: number;
}

export interface RawCartSelectedItem {
  groupKey: string;
  itemId?: string;
  itemName: string;
  price: number;
  isChargeable: boolean;
}

export interface RawCartEventDetails {
  date: string | null;
  timeSlot: string | null;
  guestCount: number | null;
  location: string | null;
}

export interface RawCartAvailability {
  guests?: number;
  withinCapacity?: boolean;
  date?: string;
  calendarStatus?: "Available" | "Blocked" | "Booked" | "Unknown";
  matchesWeeklyAvailability?: boolean;
  activeBookingsOnDate?: number;
  dailyCapacity?: number;
  capacityAvailable?: boolean;
  time?: string;
  matchesDeclaredTimeSlot?: boolean;
  overall: boolean | null;
}

export interface RawCartItem {
  _id: string;
  cartId: string;
  vendorId: string;
  packageId: string;
  packageSnapshot: {
    name?: string;
    price?: number | null;
    billingUnit?: string | null;
    image?: string;
    vendorType?: string;
    variantType?: string;
  };
  eventDetails: RawCartEventDetails;
  selectedAddOns: RawCartAddOn[];
  selectedItems: RawCartSelectedItem[];
  specialRequest: string;
  quantity: number;
  selectedForCheckout: boolean;
  createdAt: string;
  updatedAt: string;
  packageStillAvailable: boolean;
  currentPrice: number | null;
  priceChanged: boolean;
  availability: RawCartAvailability | null;
  lineTotal: number;
}

export interface RawCartVendorGroup {
  vendorId: string;
  items: RawCartItem[];
  vendorSubtotal: number;
}

export interface RawCartCoupon {
  code: string;
  discountAmount: number;
  appliedAt: string;
}

export interface RawCartPayload {
  status: "SUCCESS";
  message?: string;
  cartId: string | null;
  itemCount: number;
  vendorCount: number;
  vendors: RawCartVendorGroup[];
  coupon: RawCartCoupon | null;
  bookingNote: string;
  subtotal: number;
  discount: number;
  total: number;
  conflicts: { inconsistentEventDates: boolean; dates: string[] };
}

export interface RawAddCartItemResponse extends RawCartPayload {
  itemId: string;
  guestCartId: string | null;
}

export interface RawCartQuoteToken {
  tokenConfigured: boolean;
  paymentType: "Free" | "Token" | null;
  tokenType?: "Percentage" | "Fixed";
  tokenValue?: number;
  tokenAmount: number | null;
  remaining: number | null;
}

export interface RawCartQuoteMilestone {
  title: string;
  percentage: number | null;
  amount: number | null;
  dueDaysRaw: string | null;
  dueDate: string | null;
}

export interface RawCartQuoteLine {
  cartItemId: string;
  vendorId: string;
  packageId: string;
  available: boolean;
  note?: string;
  snapshotPrice?: number | null;
  currentPrice?: number;
  priceChanged?: boolean;
  packagePriceTotal?: number;
  addonsTotal?: number;
  chargeableItemsTotal?: number;
  lineSubtotal?: number;
  gstInclusive?: boolean;
  gstRatePercent?: number | null;
  gstAmount?: number | null;
  lineTotalInclGst?: number;
  token?: RawCartQuoteToken;
  milestones?: RawCartQuoteMilestone[];
}

export interface RawCartQuote {
  lines: RawCartQuoteLine[];
  subtotal: number;
  gstTotal: number;
  convenienceFeePercent: number | null;
  convenienceFeeConfigured: boolean;
  convenienceFee: number;
  discount: number;
  grandTotal: number;
  tokenAmountTotal: number | null;
  remainingTotal: number | null;
  allTokensConfigured: boolean;
  note: string | null;
}

export interface AddCartItemParams {
  packageId: string;
  eventType?: string;
  guests?: number;
  date?: string;
  timeSlot?: string;
  location?: string;
  selectedAddOns?: RawCartAddOn[];
  selectedItems?: RawCartSelectedItem[];
  specialRequest?: string;
  quantity?: number;
}

export interface UpdateCartItemParams {
  eventType?: string;
  guests?: number;
  date?: string;
  timeSlot?: string;
  location?: string;
  selectedAddOns?: RawCartAddOn[];
  selectedItems?: RawCartSelectedItem[];
  specialRequest?: string;
  quantity?: number;
  selectedForCheckout?: boolean;
}

/** Every cart request carries the stored guest id — harmless to send even when logged in, since the backend's soft-auth always prefers a valid customer token over it. */
function guestHeaders(): HeadersInit {
  const guestId = getGuestCartId();
  return guestId ? { "X-Guest-Cart-Id": guestId } : {};
}

export async function getCart() {
  return apiFetch<RawCartPayload>("/customer/cart", { auth: true, headers: guestHeaders() });
}

export async function getCartQuote() {
  return apiFetch<{ status: "SUCCESS"; quote: RawCartQuote | null; message?: string }>("/customer/cart/quote", {
    auth: true,
    headers: guestHeaders(),
  });
}

export async function addCartItem(params: AddCartItemParams) {
  const data = await apiFetch<RawAddCartItemResponse>("/customer/cart/items", {
    method: "POST",
    auth: true,
    headers: guestHeaders(),
    body: params,
  });
  if (data.guestCartId) setGuestCartId(data.guestCartId);
  return data;
}

export async function updateCartItem(itemId: string, params: UpdateCartItemParams) {
  return apiFetch<RawCartPayload>(`/customer/cart/items/${itemId}`, {
    method: "PATCH",
    auth: true,
    headers: guestHeaders(),
    body: params,
  });
}

export async function removeCartItem(itemId: string) {
  return apiFetch<RawCartPayload>(`/customer/cart/items/${itemId}`, {
    method: "DELETE",
    auth: true,
    headers: guestHeaders(),
  });
}

export async function clearCart() {
  return apiFetch<{ status: "SUCCESS"; message: string; count?: number }>("/customer/cart", {
    method: "DELETE",
    auth: true,
    headers: guestHeaders(),
  });
}

/** Customer-only — a guest has nowhere to save a wishlist item. */
export async function moveCartItemToWishlist(itemId: string) {
  return apiFetch<RawCartPayload>(`/customer/cart/items/${itemId}/move-to-wishlist`, {
    method: "POST",
    auth: true,
  });
}

export async function applyCoupon(code: string) {
  return apiFetch<RawCartPayload>("/customer/cart/coupon", {
    method: "POST",
    auth: true,
    headers: guestHeaders(),
    body: { code },
  });
}

export async function removeCoupon() {
  return apiFetch<RawCartPayload>("/customer/cart/coupon", {
    method: "DELETE",
    auth: true,
    headers: guestHeaders(),
  });
}

export async function setBookingNote(note: string) {
  return apiFetch<RawCartPayload>("/customer/cart/note", {
    method: "PUT",
    auth: true,
    headers: guestHeaders(),
    body: { note },
  });
}

/** Customer-only. Deliberately explicit — call once right after login, never speculatively on every page load. */
export async function mergeGuestCart(guestId: string) {
  return apiFetch<RawCartPayload>("/customer/cart/merge", {
    method: "POST",
    auth: true,
    body: { guestId },
  });
}

/**
 * Call once right after a login/signup succeeds. No-op if there's no stored
 * guest cart id; safe to call against an already-merged/unknown id (the
 * backend responds 200 "nothing to merge" rather than erroring). Never
 * throws — callers fire this without awaiting, so a real failure (network
 * blip, unexpected 4xx/5xx) is swallowed rather than surfacing as an
 * unhandled promise rejection.
 */
export async function mergeGuestCartIfAny(): Promise<void> {
  const guestId = getGuestCartId();
  if (!guestId) return;
  try {
    await mergeGuestCart(guestId);
  } catch {
    // Best-effort — the customer's own cart still loads fine without the merge.
  } finally {
    clearGuestCartId();
  }
}
