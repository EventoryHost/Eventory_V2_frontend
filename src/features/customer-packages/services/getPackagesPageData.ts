import type { PackagesPageData } from "../types";
import { mockPackagesPageData } from "../data/mockPackagesPageData";

/**
 * Data source for the Packages page. Swap the body for a real call —
 * e.g. `fetch(apiUrl(\`/packages/landing?category=${categoryId}\`))` (see src/lib/api.ts)
 * — once the backend endpoint exists. Every component below this consumes
 * the `PackagesPageData` shape only, so that swap is the only change needed.
 */
export async function getPackagesPageData(): Promise<PackagesPageData> {
  return mockPackagesPageData;
}
