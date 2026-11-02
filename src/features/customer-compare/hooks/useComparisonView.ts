import { useCallback, useEffect, useState } from "react";
import { removeCompareItem } from "@/lib/customerCompareApi";
import { getComparison } from "../services/getComparison";
import type { ComparisonView } from "../types";

/**
 * Loads GET /customer/compare's current session (getComparison) and exposes
 * the remove-column action — shared by the full `/compare` page
 * (ComparePageContent) and the in-page CompareModal opened from the package
 * listing, so both chrome variants stay driven by the exact same data/logic.
 */
export function useComparisonView(enabled = true) {
  const [view, setView] = useState<ComparisonView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasSettled, setHasSettled] = useState(false);

  const load = useCallback(() => {
    return getComparison()
      .then((next) => {
        setView(next);
        setError(null);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Could not load your comparison");
      })
      .finally(() => setHasSettled(true));
  }, []);

  useEffect(() => {
    // `enabled` lets a caller (ComparePageContent) hold off until it has
    // decided the customer is even allowed to see this — e.g. not loading
    // (and never even briefly calling) the compare session before an
    // unauthenticated visitor has been redirected away.
    if (enabled) load();
  }, [enabled, load]);

  const handleRemove = useCallback(
    async (packageId: string) => {
      // Optimistic — the column goes immediately, and the reload below puts
      // it back if the delete was rejected.
      setView((current) =>
        current
          ? { ...current, columns: current.columns.filter((column) => column.packageId !== packageId) }
          : current
      );
      try {
        await removeCompareItem(packageId);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Could not update your comparison");
      }
      // Rebuilds the rows (and their winner badges) around what's left.
      await load();
    },
    [load]
  );

  return { view, error, hasSettled, handleRemove, packageCount: view?.columns.length ?? 0 };
}
