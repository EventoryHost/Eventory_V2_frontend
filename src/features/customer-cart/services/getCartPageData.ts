import type { CartPageData } from "../types";
import { mockCartPageData } from "../data/mockCartData";

/**
 * Data source for the Cart page. Swap the body for a real call — e.g.
 * `fetch(apiUrl("/cart"))` (see src/lib/api.ts) — once the backend endpoint
 * exists. Every component below this consumes the `CartPageData` shape only,
 * so that swap is the only change needed.
 */
export async function getCartPageData(): Promise<CartPageData> {
  return mockCartPageData;
}
