// step2_productsAndPricing.included is a real array — most of the time a
// single vendor-authored string, but sometimes several distinct entries
// (each already its own bullet) or one string containing its own bullet/
// numbered list written with \n. Backend guidance (verbatim):
//   - included.length > 1 -> each entry is already a distinct bullet, render
//     as-is, one <li> per entry.
//   - included.length === 1 -> split on \n, trim, drop empties; if 2+ lines
//     look like list markers (•, -, *, "1)", "1.", "(1)"), strip the marker
//     and render as a list, with any line(s) before the first marker kept as
//     a plain intro paragraph.
//   - otherwise: not a list — display as-is but preserve real line breaks
//     (blank-line-separated paragraphs) instead of collapsing them.
const BULLET_MARKER = /^\s*(?:[•\-*]|\(?\d+[).])\s+/;

export type ParsedAboutText =
  | { kind: "bullets"; intro: string | null; items: string[] }
  | { kind: "text"; text: string };

export function parseAboutText(included: string[]): ParsedAboutText {
  const entries = included.map((entry) => entry.trim()).filter(Boolean);

  if (entries.length > 1) {
    return { kind: "bullets", intro: null, items: entries };
  }

  const raw = entries[0] ?? "";
  const lines = raw.split("\n").map((line) => line.trim()).filter(Boolean);
  const firstMarkerIndex = lines.findIndex((line) => BULLET_MARKER.test(line));
  const markerLineCount = lines.filter((line) => BULLET_MARKER.test(line)).length;

  if (firstMarkerIndex !== -1 && markerLineCount >= 2) {
    const introLines = lines.slice(0, firstMarkerIndex);
    const items = lines.slice(firstMarkerIndex).map((line) => line.replace(BULLET_MARKER, ""));
    return {
      kind: "bullets",
      intro: introLines.length > 0 ? introLines.join(" ") : null,
      items,
    };
  }

  // Not a list — keep the vendor's own paragraph breaks (blank-line-separated
  // paragraphs, or single \n within one) instead of collapsing to one line.
  return { kind: "text", text: raw };
}
