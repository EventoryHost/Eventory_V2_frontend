"use client";

import { useRegisterSupportContext } from "../hooks/useSupport";
import type { SupportContext } from "../types";

/** Drop-in for server-rendered pages that can't call the hook themselves. */
export default function SupportPageContext(props: SupportContext) {
  useRegisterSupportContext(props);
  return null;
}
