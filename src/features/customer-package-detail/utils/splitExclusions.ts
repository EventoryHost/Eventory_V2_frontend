// A short capitalised label ("Car Entry:", "Magic:") that starts right after
// the end of the previous sentence or label. Some vendors' exclusion text
// reaches us with its line breaks already gone ("...price:Car Entry: ...host. Magic: ..."),
// so a break before each such label is the only signal left to rebuild the lines from.
const RUN_TOGETHER_LABEL = /(?<=[.:!?])\s*(?=[A-Z][A-Za-z0-9&'/-]*(?: [A-Za-z0-9&'/-]+){0,3}:(?:\s|$))/;

/**
 * Turns the vendor's notIncluded entries into display lines: splits on real
 * newlines, strips a leading "•", and also re-breaks text whose newlines were
 * lost before it was saved (see RUN_TOGETHER_LABEL).
 */
export function splitExclusions(notIncluded: string[]): string[] {
  return notIncluded.flatMap((entry) =>
    entry
      .split("\n")
      .flatMap((line) => line.split(RUN_TOGETHER_LABEL))
      .map((line) => line.trim().replace(/^•\s*/, ""))
      .filter(Boolean)
  );
}
