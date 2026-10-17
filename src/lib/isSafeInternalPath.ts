/**
 * Guards a user-controlled redirect target (e.g. a `returnTo` query param)
 * against sending the customer somewhere other than this site — must start
 * with a single `/` (a relative, internal path) and not `//` (a
 * protocol-relative URL, which browsers treat as external — e.g.
 * `//evil.com` would otherwise redirect off-site despite "starting with /").
 */
export function isSafeInternalPath(path: string | null | undefined): path is string {
  return typeof path === "string" && path.startsWith("/") && !path.startsWith("//");
}
