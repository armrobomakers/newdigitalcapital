import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ConversionTracker } from "@/components/conversion-tracker";
import { EventStructuredData } from "@/components/event-structured-data";
import { LandingPage } from "@/components/landing";
import {
  assertConferenceCatalog,
  getConferenceBySlug,
  listPageReadyConferences,
} from "@/data/conferences";

type ParamsValue = { slug: string } | Promise<{ slug: string }>;

export function generateStaticParams() {
  assertConferenceCatalog();
  return listPageReadyConferences().map(({ lifecycle }) => ({ slug: lifecycle.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: ParamsValue;
}): Promise<Metadata> {
  const { slug } = await params;
  const conference = getConferenceBySlug(slug);

  if (!conference || !conference.lifecycle.pageReady) {
    return {
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const { lifecycle, content: eventData } = conference;
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://digitalcapital.vercel.app").replace(
    /\/$/,
    ""
  );
  const indexingEnabled = process.env.NEXT_PUBLIC_INDEXING_ENABLED === "true";
  const indexPage = Boolean(indexingEnabled && lifecycle.status !== "draft");
  const canonical = `${siteUrl}/${slug}`;
  const title = `${eventData.name} — конференция о бизнесе, инвестициях и AI`;
  const socialImage = `${siteUrl}${eventData.assets.heroImage}`;

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
          url: socialImage,
          width: 1200,
          height: 630,
          alt: eventData.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: eventData.subtitle,
      images: [socialImage],
    },
  };
}

export default async function EventPage({
  params,
}: {
  params: ParamsValue;
}) {
  const { slug } = await params;
  const conference = getConferenceBySlug(slug);

  if (!conference || !conference.lifecycle.pageReady) {
    notFound();
  }

  const { lifecycle, content: eventData } = conference;

  return (
    <>
      <EventStructuredData eventData={eventData} />
      <ConversionTracker eventId={lifecycle.id} />
      <LandingPage eventData={eventData} />
    </>
  );
}
