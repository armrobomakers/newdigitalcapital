import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ConversionTracker } from "@/components/conversion-tracker";
import { LandingPage } from "@/components/landing";
import { getEventLifecycleBySlug } from "@/data/event-registry";
import { eventData } from "@/data/events";

type ParamsValue = { slug: string } | Promise<{ slug: string }>;

export function generateStaticParams() {
  return [{ slug: eventData.slug }];
}

export async function generateMetadata({
  params,
}: {
  params: ParamsValue;
}): Promise<Metadata> {
  const { slug } = await params;

  if (slug !== eventData.slug) {
    return {};
  }

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://digitalcapital.vercel.app").replace(
    /\/$/,
    ""
  );
  const indexingEnabled = process.env.NEXT_PUBLIC_INDEXING_ENABLED === "true";
  const lifecycle = getEventLifecycleBySlug(slug);
  const indexPage = Boolean(indexingEnabled && lifecycle && lifecycle.status !== "draft");
  const canonical = `${siteUrl}/${slug}`;
  const title = `${eventData.name} — конференция о бизнесе, инвестициях и AI`;

  return {
    title,
    description: eventData.subtitle,
    alternates: {
      canonical,
    },
    robots: {
      index: indexPage,
      follow: indexPage,
    },
    openGraph: {
      type: "website",
      locale: "ru_RU",
      url: canonical,
      siteName: eventData.name,
      title,
      description: eventData.subtitle,
      images: [
        {
          url: `${siteUrl}/hero-stage-3.png`,
          width: 1200,
          height: 630,
          alt: eventData.name,
        },
      ],
    },
  };
}

export default async function EventPage({
  params,
}: {
  params: ParamsValue;
}) {
  const { slug } = await params;

  if (slug !== eventData.slug) {
    notFound();
  }

  const lifecycle = getEventLifecycleBySlug(slug);
  if (!lifecycle) {
    notFound();
  }

  return (
    <>
      <ConversionTracker eventId={lifecycle.id} />
      <LandingPage />
    </>
  );
}
