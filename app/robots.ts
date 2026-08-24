import type { MetadataRoute } from "next";

import { isBrandedPublicUrl } from "@/lib/config-values";

export default function robots(): MetadataRoute.Robots {
  const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() ?? "";
  const indexingEnabled = process.env.NEXT_PUBLIC_INDEXING_ENABLED === "true";
  const publicIndexingReady = indexingEnabled && isBrandedPublicUrl(configuredSiteUrl);

  if (!publicIndexingReady) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    };
  }

  const siteUrl = configuredSiteUrl.replace(/\/$/, "");
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
