/**
 * Display formatting for the two stats on the vendor listing card.
 *
 * Both deliberately avoid the design's "N+" styling where it would
 * misstate the data — see each function.
 */

/**
 * Vendor.experience and Vendor.bookingsPerYear are both bucketed RANGE
 * STRINGS chosen during onboarding ("8 - 12 years", "100 - 140", "1-5"),
 * never numbers — see RawVendorPublic. Compacted to fit a stat column:
 *
 *   "8 - 12 years" → "8-12"     "100 - 140" → "100-140"
 *   "15+ years"    → "15+"      "3"         → "3+"
 *
 * Returns null when there is no number to show at all, so a card can drop
 * the stat instead of rendering an empty slot.
 *
 * NOT reusing setup-profile/StepSummary.tsx's formatNumberVal: it splits on
 * the first space, which turns "8 - 12 years" into the value "8" and the
 * label "- 12 years".
 */
export function formatRangeStat(value?: string): string | null {
  if (!value) return null;

  const numbers = value.match(/\d+/g);
  if (!numbers || numbers.length === 0) return null;

  if (numbers.length >= 2) return `${numbers[0]}-${numbers[1]}`;
  // A lone number is an open-ended "at least this many" either way, whether
  // the source wrote "15+ years" or just "3".
  return `${numbers[0]}+`;
}

/**
 * Wishlist saves. Shown EXACTLY, unlike the design's "400+" — a "+" on a
 * real count claims more saves than there are, which matters most at the
 * small numbers a new vendor actually has ("2+" when exactly two people
 * saved them). Large counts still read fine unabbreviated.
 *
 * ALWAYS returns a string, including "0": the stat is a fixed part of the
 * card, not something that appears once a vendor is popular enough, so a
 * brand-new vendor reads "0 Wishlisted" rather than dropping the slot and
 * reflowing the row.
 *
 * A missing value is also rendered as 0 rather than hidden. Vendor
 * .wishlistCount is a real, always-present counter now (every vendor
 * document was backfilled), so `undefined` here means an older backend
 * build that predates the field — not a vendor whose count is unknown.
 */
export function formatWishlistCount(count?: number): string {
  return (count ?? 0).toLocaleString("en-IN");
}
