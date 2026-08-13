export interface CustomerAccessTokenPayload {
  id: string;
  email: string;
  role: string;
}

/** Decodes a JWT payload client-side without verifying the signature — only safe for reading non-sensitive claims (id/email/role) already trusted because the token came straight from our own backend over HTTPS/cookies. */
export function decodeJwtPayload(token: string): CustomerAccessTokenPayload | null {
  try {
    const [, payload] = token.split(".");
    if (!payload) return null;
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const json = typeof window === "undefined" ? Buffer.from(padded, "base64").toString("utf-8") : atob(padded);
    return JSON.parse(json) as CustomerAccessTokenPayload;
  } catch {
    return null;
  }
}
