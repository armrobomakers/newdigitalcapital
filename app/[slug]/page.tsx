import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LandingPage } from "@/components/landing";

const EVENT_SLUG = "ekb";

export function generateStaticParams() {
  return [{ slug: EVENT_SLUG }];
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string } | Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  if (slug !== EVENT_SLUG) {
    return {};
  }

  return {
    title: "Конференция «Цифровой капитал»",
    description:
      "Премиальный лендинг конференции о бизнесе, инвестициях и искусственном интеллекте в Екатеринбурге.",
  };
}

export default async function EventPage({
  params,
}: {
  params: { slug: string } | Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  if (slug !== EVENT_SLUG) {
    notFound();
  }

  return <LandingPage />;
}
