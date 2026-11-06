import type { MetadataRoute } from "next";
import { browsePackages, browseVendors } from "@/lib/customerDiscoveryApi";
import { SITE_URL } from "@/lib/siteConfig";

// Regenerated at most once a day.
export const revalidate = 86400;

const PAGE_SIZE = 50; // the discovery API caps `limit` at 50
const MAX_PAGES = 40; // safety cap per list (2,000 items)

const STATIC_PATHS = ["/", "/packages", "/packages/browse", "/vendors", "/events", "/about-us", "/become-a-vendor", "/blogs"];

// Add new blog posts here (one entry per folder under src/app/(customer)/blogs/).
const BLOG_SLUGS = [
  "baby-shower-welcome-baby-decoration",
  "decoration-cost-delhi-ncr-2026",
  "decorator-questions-checklist",
  "diwali-office-decoration-ideas-2026",
  "surprise-decoration-for-partner",
];

function toDate(value?: string) {
  const date = value ? new Date(value) : undefined;
  return date && !isNaN(date.getTime()) ? date : undefined;
}

// Pages through a list endpoint until a short page or the last page.
async function collect<T>(fetchPage: (page: number) => Promise<{ items: T[]; totalPages: number }>): Promise<T[]> {
  const all: T[] = [];
  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const { items, totalPages } = await fetchPage(page);
    all.push(...items);
    if (items.length < PAGE_SIZE || page >= totalPages) break;
  }
  return all;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [
    ...STATIC_PATHS.map((path) => ({ url: `${SITE_URL}${path === "/" ? "" : path}`, lastModified: new Date() })),
    ...BLOG_SLUGS.map((slug) => ({ url: `${SITE_URL}/blogs/${slug}` })),
  ];

  // The backend being down must never make the sitemap 500 — fall back to the static entries.
  try {
    const packages = await collect(async (page) => {
      const res = await browsePackages({ page, limit: PAGE_SIZE });
      return { items: res.packages, totalPages: res.totalPages };
    });
    entries.push(
      ...packages.map((pkg) => ({ url: `${SITE_URL}/packages/${pkg._id}`, lastModified: toDate(pkg.createdAt) }))
    );
  } catch (error) {
    console.error("[sitemap] could not load packages", error);
  }

  try {
    const vendors = await collect(async (page) => {
      const res = await browseVendors({ page, limit: PAGE_SIZE });
      return { items: res.vendors, totalPages: res.totalPages };
    });
    entries.push(
      ...vendors.map((vendor) => ({ url: `${SITE_URL}/vendors/${vendor.id}`, lastModified: toDate(vendor.createdAt) }))
    );
  } catch (error) {
    console.error("[sitemap] could not load vendors", error);
  }

  return entries;
}
