import { formatPrice } from "@/features/customer-package-detail/utils/formatPrice";
import type { HelpPageContext } from "../helpContext";

// Answers to common questions (Figma "05 — Learner", node 2369:11258).
// Package-page answers come from that package's own data — token, balance
// milestones, cancellation policy, variant inclusions, vendor name;
// elsewhere they reuse copy the site already shows rather than inventing
// policy numbers. Anything only the vendor can confirm hands off.

export type HelpAnswer = {
  text: string;
  /** Secondary button shown instead of "Done" (Figma 5.3). */
  action?: "customise";
  /** Skip the buttons and open the brief straight away (Figma 5.4). */
  handoff?: boolean;
};

type Rule = { re: RegExp; answer: (ctx: HelpPageContext | null) => HelpAnswer };

/** "Sharma Decorators" → "Sharma Decorators’", "Priya" → "Priya’s". */
const possessive = (name: string) =>
  /s$/i.test(name) ? `${name}’` : `${name}’s`;

const joinList = (items: string[]) =>
  items.length <= 1
    ? (items[0] ?? "")
    : `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;

function balanceLine(ctx: HelpPageContext | null) {
  const ms = ctx?.milestones ?? [];
  if (ms.length === 1) return `The balance is due ${ms[0].dueLabel}.`;
  if (ms.length > 1)
    return `The balance is paid in ${ms.length} parts: ${joinList(ms.map((m) => `${m.percentage}% ${m.dueLabel}`))}.`;
  return "The balance is due as per the payment milestones shown at checkout.";
}

const RULES: Rule[] = [
  {
    re: /\bcancel|refund/,
    answer: (ctx) => ({
      text: ctx?.cancellationPolicy
        ? `Here’s ${possessive(ctx.vendorName)} cancellation policy for this package: ${ctx.cancellationPolicy}`
        : "Each package has its own cancellation terms, set by the vendor. You’ll find them in the Policies section of the package page before you pay.",
    }),
  },
  {
    re: /\bbalance\b|remaining (amount|payment)|when do i pay/,
    answer: (ctx) => ({
      text: `${balanceLine(ctx)} Eventory holds your money until ${ctx ? "setup is complete" : "your event is delivered"}.`,
    }),
  },
  {
    re: /\btoken\b|\badvance\b|how (does|do) (booking|i book)|booking work/,
    answer: (ctx) => ({
      text:
        ctx && ctx.tokenAmount > 0
          ? `You pay ${formatPrice(ctx.tokenAmount)} now to hold your date on ${possessive(ctx.vendorName)} calendar. ${balanceLine(ctx)} Eventory holds your money until setup is complete.`
          : ctx
            ? `You don’t pay a token to book this package. ${balanceLine(ctx)} Eventory holds your money until setup is complete.`
            : "You book by paying a token, which holds your date and starts planning with the vendor. The token amount is shown on each package before you pay, the rest is paid in milestones shown at checkout, and Eventory holds your money until your event is delivered.",
    }),
  },
  {
    re: /\bheld\b|\bhold\b|block (my|the) date/,
    answer: () => ({
      text: "Your date is held once the token is paid. Until then the date isn’t reserved, so book soon if you’re sure.",
    }),
  },
  {
    re: /\bverif|genuine|trust|reliable/,
    answer: () => ({
      text: "Vendors are checked by Eventory before they can list, and ratings only come from customers who booked through Eventory. Look for the Verified badge on the vendor’s profile.",
    }),
  },
  {
    re: /\bchange (the )?(flower |)colou?rs?|customi[sz]|personali[sz]|change .*flowers?/,
    answer: (ctx) =>
      ctx
        ? {
            text: `Yes. Change the colours in the customise editor, and ${ctx.vendorName} sends you a revised proposal with the price before you pay anything extra.`,
            action: ctx.included.length ? "customise" : undefined,
          }
        : {
            text: "Most packages can be customised. Open the package and use Customise to request changes; the vendor sends a revised price before you pay anything extra.",
          },
  },
  {
    re: /serve my area|which (areas|cities)|do you (serve|cover)|available in my (city|area)/,
    answer: () => ({
      text: "We serve Delhi NCR: Delhi, Gurugram, Noida, Ghaziabad and Faridabad. Tell me your area and I’ll show packages whose vendors cover it.",
    }),
  },
  {
    re: /\bincluded\b|\binclude\b|what do i get|what'?s in it/,
    answer: (ctx) => {
      if (!ctx)
        return {
          text: "Every package lists what’s included on its page. Open one and I can walk you through it.",
        };
      // Nothing is invented: no inclusion data means an Event Manager asks.
      if (!ctx.included.length)
        return {
          text: `${possessive(ctx.vendorName)} inclusions aren’t listed for this package yet. An Event Manager can check them for you.`,
        };
      const v = ctx.variant;
      const counts = v
        ? `The ${v.label} package has ${v.setupsCount} setup${v.setupsCount === 1 ? "" : "s"} and ${v.itemsCount} item${v.itemsCount === 1 ? "" : "s"}`
        : "This package includes";
      return { text: `${counts}: ${joinList(ctx.included)}.` };
    },
  },
  {
    re: /\bavailab|\bfree on\b|on my date|\bbooked on\b/,
    answer: (ctx) =>
      ctx
        ? {
            text: `Availability has to come from the vendor, so I’ll pass this to an Event Manager. They’ll check with ${ctx.vendorName} for you.`,
            handoff: true,
          }
        : {
            text: "Availability is per vendor. Open a package and ask there, or tell me your event and date and I’ll suggest options.",
          },
  },
  {
    re: /shortlist/,
    answer: () => ({
      text: "Happy to. Tell me the occasion, rough guest count and budget and I’ll pull options now. Or an Event Manager can put a shortlist together for you.",
    }),
  },
];

export function answerQuestion(
  text: string,
  ctx: HelpPageContext | null,
): HelpAnswer | null {
  const s = text.toLowerCase().replace(/[’]/g, "'");
  const rule = RULES.find((r) => r.re.test(s));
  return rule ? rule.answer(ctx) : null;
}

export const FALLBACK_ANSWER =
  "I can help you find packages. Tell me the occasion, guest count, budget and area in one line. For anything else, an Event Manager can help.";
