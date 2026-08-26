import type { CartPageData, CartVendor, CartAddon } from "../types";
import { getCart, type RawCartItem, type RawCartPayload } from "@/lib/customerCartApi";
import { getVendorPublic } from "@/lib/vendorPublicApi";
import { mockCartPageData } from "../data/mockCartData";

const BREADCRUMB = [
  { label: "Home", href: "/" },
  { label: "Packages", href: "/packages" },
  { label: "Cart" },
];

function mapAddon(raw: RawCartItem["selectedAddOns"][number], itemId: string, index: number): CartAddon {
  return {
    id: raw.addOnId ?? `${itemId}-addon-${index}`,
    title: raw.name,
    // The cart's own SelectedAddOnSchema only stores addOnId/name/price/quantity —
    // no category/image is persisted once an add-on is in the cart.
    category: "",
    image: undefined,
    price: raw.price,
    unitLabel: "",
    added: true,
    quantity: raw.quantity,
  };
}

function mapItem(item: RawCartItem, vendorNames: Map<string, { name: string; initial: string }>): CartVendor {
  const vendor = vendorNames.get(item.vendorId);
  const vendorName = vendor?.name ?? item.packageSnapshot.vendorType ?? "Vendor";
  return {
    id: item._id,
    vendorId: item.vendorId,
    vendorName,
    avatarInitial: vendor?.initial ?? vendorName[0]?.toUpperCase() ?? "V",
    package: {
      id: item.packageId,
      categoryLabel: item.packageSnapshot.vendorType ?? "",
      title: item.packageSnapshot.name ?? "Package",
      image: item.packageSnapshot.image,
      price: item.currentPrice ?? item.packageSnapshot.price ?? 0,
      href: `/packages/${item.packageId}`,
    },
    selected: item.selectedForCheckout,
    eventDetails: {
      eventType: item.eventDetails.eventType,
      date: item.eventDetails.date,
      timeRange: item.eventDetails.timeSlot,
      guestCount: item.eventDetails.guestCount,
      location: item.eventDetails.location,
    },
    specialRequest: item.specialRequest,
    packageStillAvailable: item.packageStillAvailable,
    priceChanged: item.priceChanged,
    addons: item.selectedAddOns.map((addon, i) => mapAddon(addon, item._id, i)),
  };
}

async function resolveVendorNames(vendorIds: string[]): Promise<Map<string, { name: string; initial: string }>> {
  const unique = [...new Set(vendorIds)];
  const map = new Map<string, { name: string; initial: string }>();
  await Promise.all(
    unique.map(async (id) => {
      try {
        const { vendor } = await getVendorPublic(id);
        const name = vendor.businessName ?? "Vendor";
        map.set(id, { name, initial: name[0]?.toUpperCase() ?? "V" });
      } catch {
        // Best-effort — a card just falls back to its package's vendorType label.
      }
    })
  );
  return map;
}

export function mapCartPayload(payload: RawCartPayload, vendorNames: Map<string, { name: string; initial: string }>): CartPageData {
  const items = payload.vendors.flatMap((group) => group.items);
  return {
    breadcrumb: BREADCRUMB,
    vendors: items.map((item) => mapItem(item, vendorNames)),
    itemCount: payload.itemCount,
    vendorCount: payload.vendorCount,
    subtotal: payload.subtotal,
    discount: payload.discount,
    total: payload.total,
  };
}

/**
 * Data source for the Cart page — calls the real GET /api/customer/cart
 * (Eventory_V2_backend), soft-authed for a logged-in customer or an
 * anonymous guest (see src/lib/customerCartApi.ts / guestCart.ts). Client-side
 * only: cart identity only exists in the browser (bearer token from the
 * session store, or a guest id from localStorage), so this can't be
 * server-rendered the way the packages/vendors pages are.
 *
 * Falls back to static example data (`mockCartPageData`, same object
 * reference — callers can detect the fallback with `=== mockCartPageData`)
 * when the request itself fails (network error / backend down / 5xx), so the
 * page still renders something instead of a blank error state.
 */
export async function getCartPageData(): Promise<CartPageData> {
  let payload: RawCartPayload;
  try {
    payload = await getCart();
  } catch {
    return mockCartPageData;
  }
  const vendorIds = payload.vendors.map((group) => group.vendorId);
  const vendorNames = await resolveVendorNames(vendorIds);
  return mapCartPayload(payload, vendorNames);
}
