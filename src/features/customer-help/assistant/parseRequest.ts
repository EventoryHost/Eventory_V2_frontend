// Rule-based reading of a customer's free-text event request, e.g.
// "Mom turning 60 next month, around 50 guests, budget 30k, at home in GK".
// Pulls out only what was actually said; nothing is guessed.

export type Occasion = { key: string; label: string };
export type Guests = { label: string; count: number };
export type Budget = { label: string; max: number };
export type Area = { label: string; city: string; fromLocation?: boolean };

export type ParsedRequest = {
  occasion?: Occasion;
  guests?: Guests;
  budget?: Budget;
  area?: Area;
};

// Order matters: specific events before the generic birthday fallbacks.
const OCCASIONS: { key: string; label: string; re: RegExp }[] = [
  { key: "haldi", label: "Haldi", re: /\bhaldi\b/ },
  { key: "mehendi", label: "Mehendi", re: /\bmeh[ae]?n?di\b|\bmehndi\b/ },
  { key: "sangeet", label: "Sangeet", re: /\bsangeet\b/ },
  { key: "anniversary", label: "Anniversary", re: /\banniversary\b/ },
  {
    key: "baby shower",
    label: "Baby shower",
    re: /\bbaby ?shower\b|\bgodh ?bharai\b/,
  },
  { key: "engagement", label: "Engagement", re: /\bengagement\b|\broka\b/ },
  { key: "wedding", label: "Wedding", re: /\bwedding\b|\bshaadi\b/ },
  {
    key: "corporate",
    label: "Corporate",
    re: /\bcorporate\b|\boffice (party|event)\b|\boffsite\b/,
  },
  {
    key: "birthday",
    label: "Birthday",
    re: /\bbirthday\b|\bb'?day\b|\bturning \d{1,3}\b|\b\d{1,3}(st|nd|rd|th) (birthday|bday)\b/,
  },
];

// Delhi NCR areas → the city the package search filters on.
const AREAS: { re: RegExp; label: string; city: string }[] = [
  {
    re: /\bgk\b|greater kailash/,
    label: "Greater Kailash, South Delhi",
    city: "Delhi",
  },
  { re: /\bsaket\b/, label: "Saket, South Delhi", city: "Delhi" },
  {
    re: /\bvasant (kunj|vihar)\b/,
    label: "Vasant Kunj, South Delhi",
    city: "Delhi",
  },
  { re: /\bdwarka\b/, label: "Dwarka, Delhi", city: "Delhi" },
  { re: /\brohini\b/, label: "Rohini, Delhi", city: "Delhi" },
  { re: /south delhi/, label: "South Delhi", city: "Delhi" },
  { re: /\bgurgaon\b|\bgurugram\b/, label: "Gurugram", city: "Gurugram" },
  { re: /\bnoida\b/, label: "Noida", city: "Noida" },
  { re: /\bindirapuram\b/, label: "Indirapuram, Ghaziabad", city: "Ghaziabad" },
  { re: /\bghaziabad\b/, label: "Ghaziabad", city: "Ghaziabad" },
  { re: /\bfaridabad\b/, label: "Faridabad", city: "Faridabad" },
  { re: /\bdelhi\b/, label: "Delhi", city: "Delhi" },
];

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

function parseAmount(num: string, unit?: string) {
  const n = Number(num.replace(/,/g, ""));
  if (!unit) return n;
  if (/^k$/i.test(unit)) return n * 1000;
  return n * 100000; // lakh / lac / l
}

export function parseRequest(text: string): ParsedRequest {
  const s = ` ${text.toLowerCase().replace(/[’]/g, "'")} `;
  const out: ParsedRequest = {};

  const occ = OCCASIONS.find((o) => o.re.test(s));
  if (occ) out.occasion = { key: occ.key, label: occ.label };

  const g = s.match(
    // "80 log" / "80 logon" is Hinglish for 80 people (Figma 9.4).
    /(\d{1,4})\s*(?:-|–|to)?\s*(\d{1,4})?\s*(guests|people|pax|persons|kids|adults|log|logon|members)\b/,
  );
  if (g) {
    const count = Number(g[2] ?? g[1]);
    out.guests = {
      count,
      label: g[2] ? `${g[1]}–${g[2]} guests` : `${count} guests`,
    };
  }

  const b =
    s.match(/(?:₹|rs\.?|inr)\s*([\d,]+(?:\.\d+)?)\s*(k|lakh|lac|l)?\b/) ??
    s.match(/\b(\d+(?:\.\d+)?)\s*(k|lakh|lac)\b/) ??
    s.match(
      /(?:budget|under|within|upto|up to|below|max)\s*(?:of|is|:)?\s*([\d,]{4,})\b/,
    );
  if (b) {
    const max = parseAmount(b[1], b[2]);
    if (max >= 1000) out.budget = { max, label: inr(max) };
  }

  const area = AREAS.find((a) => a.re.test(s));
  if (area) out.area = { label: area.label, city: area.city };

  return out;
}

export function hasExplorerSignal(p: ParsedRequest, text: string) {
  return Boolean(
    p.occasion ||
    p.guests ||
    p.budget ||
    /\b(decor|setup|package|options|ideas|party|celebrat|plan)/i.test(text),
  );
}

// Follow-up chips (Figma 4.2). Guest buckets match the brief card's.
export const GUEST_OPTIONS: Guests[] = [
  { label: "Up to 25", count: 25 },
  { label: "25–50", count: 50 },
  { label: "50–100", count: 100 },
  { label: "100–200", count: 200 },
  { label: "200+", count: 250 },
];

export const BUDGET_OPTIONS: Budget[] = [
  { label: "Under ₹25K", max: 25000 },
  { label: "₹25–50K", max: 50000 },
  { label: "₹50K–1L", max: 100000 },
  { label: "₹1–2L", max: 200000 },
  { label: "₹2L+", max: 1000000 },
];

export const OCCASION_OPTIONS: Occasion[] = OCCASIONS.filter((o) =>
  [
    "birthday",
    "haldi",
    "mehendi",
    "sangeet",
    "anniversary",
    "baby shower",
  ].includes(o.key),
).map(({ key, label }) => ({ key, label }));

// Words that follow "in"/"at" but aren't places.
const NOT_PLACES =
  /^(my|our|the|a|an|home|house|budget|total|mind|person|advance|cash|hand|hindi|english|jan(uary)?|feb(ruary)?|mar(ch)?|apr(il)?|may|june?|july?|aug(ust)?|sep(tember)?|oct(ober)?|nov(ember)?|dec(ember)?|next|this|the evening|the morning|night|evening|morning|winter|summer)\b/;

/**
 * The place the customer named, as written, for the location check (Figma
 * "09 — Location"): a pincode, "sector 15", a known NCR area, or whatever
 * follows "in / at / near / from" ("I live in Rohini, need…" → "Rohini").
 * The backend decides whether it's served; nothing here guesses that.
 */
export function areaPhrase(text: string): string | undefined {
  const pin = text.match(/(?<!\d)(\d{6})(?!\d)/);
  if (pin) return pin[1];
  const sector = text.match(/\bsec(?:tor)?\s?(\d{1,3})\b(\s*,?\s*(noida|gurugram|gurgaon|faridabad|greater noida|delhi|dwarka|rohini))?/i);
  if (sector) return sector[0].trim();
  const s = ` ${text.toLowerCase().replace(/[’]/g, "'")} `;
  const known = AREAS.find((a) => a.re.test(s));
  // Short forms ("GK") go out as their full name, which the backend knows.
  if (known) return known.label;
  const m = text.match(
    /\b(?:live in|living in|based in|in|at|near|around|from|serve|cover)\s+([A-Za-z][A-Za-z .'-]{2,40}?)(?=\s*(?:[,.;!?]|\band\b|\bneed\b|\bfor\b|\bwith\b|\bon\b|\bnext\b|\bthis\b|\bunder\b|\bbudget\b|\bwithin\b|\d|$))/i,
  );
  const place = m?.[1].trim();
  return place && !NOT_PLACES.test(place.toLowerCase()) ? place : undefined;
}
