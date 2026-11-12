"use client";

import { useEffect } from "react";
import { isHeicFile, normalizeImageFile } from "@/lib/imageFile";

const HANDLED = "__heicHandled";

/**
 * Site-wide fix for iPhone HEIC photos, which browsers cannot preview.
 * Listens (capture phase, before React) to every file input's change event.
 * If any picked file is HEIC/HEIF it holds the event back, swaps the files for
 * JPEG copies, then re-fires the change so each component's own handler,
 * preview and upload run on JPEGs without per-component changes.
 * If conversion fails the original file is passed through unchanged.
 */
export default function HeicInputConverter() {
  useEffect(() => {
    async function onChange(event: Event) {
      const input = event.target;
      if (!(input instanceof HTMLInputElement) || input.type !== "file") return;
      if ((event as unknown as Record<string, unknown>)[HANDLED]) return;
      const files = Array.from(input.files ?? []);
      if (!files.some(isHeicFile)) return;

      event.stopImmediatePropagation();
      try {
        const converted = await Promise.all(files.map((file) => normalizeImageFile(file).catch(() => file)));
        const transfer = new DataTransfer();
        converted.forEach((file) => transfer.items.add(file));
        input.files = transfer.files;
      } catch {
        // Leave the original selection in place.
      }
      const replay = new Event("change", { bubbles: true });
      (replay as unknown as Record<string, unknown>)[HANDLED] = true;
      input.dispatchEvent(replay);
    }

    document.addEventListener("change", onChange, true);
    return () => document.removeEventListener("change", onChange, true);
  }, []);

  return null;
}
