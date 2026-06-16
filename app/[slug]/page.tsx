import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LandingPage } from "@/components/landing";
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

  return {
    title: eventData.name,
    description: eventData.subtitle,
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

  return <LandingPage />;
}
