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
 * Must match whatever the BACKEND's own IS_DEV env var currently resolves to
 * for THIS deployment — Cashfree's SDK rejects a sandbox paymentSessionId
 * when initialized in production mode (and vice versa), so a mismatch here
 * is a hard payment failure, not a cosmetic issue. This used to be derived
 * from NEXT_PUBLIC_IS_LOCAL, which only happened to agree with the backend
 * on localhost — on v2dev.eventory.in, NEXT_PUBLIC_IS_LOCAL was unset while
 * the backend's IS_DEV=true, so the SDK loaded in "production" against a
 * sandbox session id, producing exactly "payment_session_id_invalid"
 * (2026-09-23 incident). Fixed by making this its own explicit,
 * per-deployment variable instead of reusing one meant for something else —
 * set NEXT_PUBLIC_CASHFREE_MODE=sandbox|production directly in each
 * deployment's env, matching that deployment's backend IS_DEV value exactly.
 * Defaults to "sandbox" (fails safe — a wrongly-sandboxed prod deploy is a
 * blocked payment, not a real charge going through in the wrong mode) if the
 * var is missing entirely.
 */
function resolveCashfreeMode(): "sandbox" | "production" {
  return process.env.NEXT_PUBLIC_CASHFREE_MODE === "production" ? "production" : "sandbox";
}

let cashfreePromise: Promise<CashfreeInstance> | null = null;

/** Loads the Cashfree JS SDK once and caches the promise — cashfree.checkout() navigates the browser away entirely, so there's no real "reuse across many checkouts" concern, just avoiding a duplicate <script> load if this is called twice in one page lifetime. */
export function loadCashfree(): Promise<CashfreeInstance> {
  if (!cashfreePromise) {
    cashfreePromise = load({ mode: resolveCashfreeMode() }) as Promise<CashfreeInstance>;
  }
  return cashfreePromise;
}
