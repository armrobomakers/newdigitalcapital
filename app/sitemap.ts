import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://digitalcapital.vercel.app";

  return [
    {
      url: `${siteUrl.replace(/\/$/, "")}/ekb`,
      lastModified: new Date(),
    },
  ];
}
