import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ConversionTracker } from "@/components/conversion-tracker";
import { LandingPage } from "@/components/landing";
import { getEventLifecycleBySlug, listEventLifecycles } from "@/data/event-registry";
import { getEventContentBySlug } from "@/data/events";

type ParamsValue = { slug: string } | Promise<{ slug: string }>;

export function generateStaticParams() {
  return listEventLifecycles()
    .filter((event) => event.pageReady && Boolean(getEventContentBySlug(event.slug)))
    .map((event) => ({ slug: event.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: ParamsValue;
}): Promise<Metadata> {
  const { slug } = await params;
  const lifecycle = getEventLifecycleBySlug(slug);
  const eventData = getEventContentBySlug(slug);

  if (!lifecycle || !lifecycle.pageReady || !eventData || eventData.eventId !== lifecycle.id) {
    return {
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://digitalcapital.vercel.app").replace(
    /\/$/,
    ""
  );
  const indexingEnabled = process.env.NEXT_PUBLIC_INDEXING_ENABLED === "true";
  const indexPage = Boolean(indexingEnabled && lifecycle.status !== "draft");
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
          url: `${siteUrl}${eventData.assets.heroImage}`,
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
  const lifecycle = getEventLifecycleBySlug(slug);
  const eventData = getEventContentBySlug(slug);

  if (!lifecycle || !lifecycle.pageReady || !eventData || eventData.eventId !== lifecycle.id) {
    notFound();
  }

  return (
    <>
      <ConversionTracker eventId={lifecycle.id} />
      <LandingPage eventData={eventData} />
    </>
  );
}
