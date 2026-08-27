// @cashfreepayments/cashfree-js ships no TypeScript declarations at all
// (verified against node_modules directly — dist/script.js + script.esm.js
// only) — this ambient module lets TS accept the `import { load } from
// "@cashfreepayments/cashfree-js"` in src/lib/cashfree.ts without a TS7016
// error under this project's `strict: true`. Kept intentionally minimal
// (just the one export actually used); the real shape of what `load`
// resolves to is declared locally in cashfree.ts's CashfreeInstance instead
// of here, since that's the single call site that needs it typed precisely.
declare module "@cashfreepayments/cashfree-js" {
  export function load(options: { mode: "sandbox" | "production" }): Promise<unknown>;
}
