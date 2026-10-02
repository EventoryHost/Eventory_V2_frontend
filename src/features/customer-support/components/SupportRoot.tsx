"use client";

import SupportLauncher from "./SupportLauncher";
import SupportPanel from "./SupportPanel";

/**
 * Mount once per layout. `launcher={false}` on checkout layouts keeps the
 * panel available for inline entries without the floating button.
 */
export default function SupportRoot({ launcher = true }: { launcher?: boolean }) {
  return (
    <>
      {launcher && <SupportLauncher />}
      <SupportPanel />
    </>
  );
}
