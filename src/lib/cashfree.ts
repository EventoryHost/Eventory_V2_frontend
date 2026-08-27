// @cashfreepayments/cashfree-js ships no TypeScript types at all (checked
// node_modules directly — dist/script.js + script.esm.js, no .d.ts) so its
// shape is declared locally here from the README/API reference rather than
// imported.
import { load } from "@cashfreepayments/cashfree-js";

export interface CashfreeCheckoutOptions {
  paymentSessionId: string;
  /** "_self" navigates the current tab to Cashfree's hosted page (what pay-integrate.txt calls for) — "_blank"/"_modal" are the SDK's other options, not used here. */
  redirectTarget: "_self" | "_blank" | "_modal";
}

export interface CashfreeInstance {
  checkout: (options: CashfreeCheckoutOptions) => Promise<unknown>;
}

/**
 * Must match whatever the BACKEND's own IS_DEV env var currently resolves
 * to (it picks sandbox vs production off that, independently of anything
 * here) — per pay-integrate.txt Step 4, this is an "ask the backend team
 * which environment is live" question, not something this app can derive
 * with certainty. NEXT_PUBLIC_IS_LOCAL is already set in .env for local dev
 * against the same backend, so it's reused as the best available proxy;
 * confirm with the backend team before relying on this for anything
 * customer-facing in a deployed environment.
 */
function resolveCashfreeMode(): "sandbox" | "production" {
  return process.env.NEXT_PUBLIC_IS_LOCAL === "true" ? "sandbox" : "production";
}

let cashfreePromise: Promise<CashfreeInstance> | null = null;

/** Loads the Cashfree JS SDK once and caches the promise — cashfree.checkout() navigates the browser away entirely, so there's no real "reuse across many checkouts" concern, just avoiding a duplicate <script> load if this is called twice in one page lifetime. */
export function loadCashfree(): Promise<CashfreeInstance> {
  if (!cashfreePromise) {
    cashfreePromise = load({ mode: resolveCashfreeMode() }) as Promise<CashfreeInstance>;
  }
  return cashfreePromise;
}
