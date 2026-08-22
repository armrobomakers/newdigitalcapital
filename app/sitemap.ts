import type { MetadataRoute } from "next";

import { assertConferenceCatalog, listPageReadyConferences } from "@/data/conferences";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://digitalcapital.vercel.app").replace(
    /\/$/,
    ""
  );
  const indexingEnabled = process.env.NEXT_PUBLIC_INDEXING_ENABLED === "true";

  if (!indexingEnabled) {
    return [];
  }

  assertConferenceCatalog();

  return listPageReadyConferences()
    .filter(({ lifecycle }) => lifecycle.status !== "draft")
    .map(({ lifecycle }) => ({
      url: `${siteUrl}/${lifecycle.slug}`,
      lastModified: new Date(),
    }));
}
