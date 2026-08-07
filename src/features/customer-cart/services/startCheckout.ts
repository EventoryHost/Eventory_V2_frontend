export interface CheckoutPayload {
  vendorIds: string[];
  addonIds: string[];
  couponCode?: string;
}

export interface CheckoutResult {
  /** Route to redirect to for the next checkout step. */
  redirectHref: string | null;
}

/**
 * Kicks off checkout for the currently selected cart items. Swap the body
 * for a real call — e.g. `fetch(apiUrl("/checkout/session"), { method:
 * "POST", body: JSON.stringify(payload) })` — once the backend endpoint
 * exists.
 */
export async function startCheckout(
  payload: CheckoutPayload
): Promise<CheckoutResult> {
  void payload;
  await new Promise((resolve) => setTimeout(resolve, 900));

  return { redirectHref: "/booking-summary" };
}
