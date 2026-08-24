import type { MetadataRoute } from "next";

import { assertConferenceCatalog, listPageReadyConferences } from "@/data/conferences";
import { isBrandedPublicUrl } from "@/lib/config-values";

export default function sitemap(): MetadataRoute.Sitemap {
  const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() ?? "";
  const indexingEnabled = process.env.NEXT_PUBLIC_INDEXING_ENABLED === "true";

  if (!indexingEnabled || !isBrandedPublicUrl(configuredSiteUrl)) {
    return [];
  }

  const siteUrl = configuredSiteUrl.replace(/\/$/, "");
  assertConferenceCatalog();

  return listPageReadyConferences()
    .filter(({ lifecycle }) => lifecycle.status !== "draft")
    .map(({ lifecycle }) => ({
      url: `${siteUrl}/${lifecycle.slug}`,
      lastModified: new Date(),
    }));
}
