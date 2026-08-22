import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://digitalcapital.vercel.app";
  const indexingEnabled = process.env.NEXT_PUBLIC_INDEXING_ENABLED === "true";

  if (!indexingEnabled) {
    return [];
  }

  return [
    {
      url: `${siteUrl.replace(/\/$/, "")}/ekb`,
      lastModified: new Date(),
    },
  ];
}
