/**
 * Some vendor profile pictures come back from the backend as bare filenames
 * or otherwise malformed strings (not an absolute URL and not a root-relative
 * path) — next/image's loader calls `new URL(src)` on anything that isn't
 * root-relative and throws "Failed to construct 'URL': Invalid URL" instead
 * of just failing to load the image. Use this to gate `<Image src={...}>`
 * and fall back to an initials avatar instead of crashing the page.
 */
export function isValidImageSrc(src?: string | null): src is string {
  if (!src) return false;
  if (src.startsWith("/")) return true;
  try {
    new URL(src);
    return true;
  } catch {
    return false;
  }
}
