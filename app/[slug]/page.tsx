import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ConversionTracker } from "@/components/conversion-tracker";
import { EventStructuredData } from "@/components/event-structured-data";
import { EventTrustBar } from "@/components/event-trust-bar";
import { LandingPage } from "@/components/landing";
import {
  assertConferenceCatalog,
  getConferenceBySlug,
  listPageReadyConferences,
} from "@/data/conferences";
import type { EventData } from "@/data/events";
import { isBrandedPublicUrl } from "@/lib/config-values";

type ParamsValue = { slug: string } | Promise<{ slug: string }>;
type SearchParamsValue =
  | Record<string, string | string[] | undefined>
  | Promise<Record<string, string | string[] | undefined>>;

function getBattleReadyEventData(eventData: EventData, salesPreview: boolean): EventData {
  if (eventData.eventId !== "ekb-2026-09-26") {
    return eventData;
  }

  const registrationFaqAnswer = salesPreview
    ? "Да. Выберите подходящий тариф в блоке регистрации и оставьте контактные данные. После отправки команда подтвердит получение заявки."
    : "Регистрация откроется на этой странице. Программа, площадка и тарифы уже опубликованы — после запуска продаж здесь появится форма заявки.";

  return {
    ...eventData,
    subtitle:
      "Один день о бизнесе, инвестициях и AI — практические идеи, сильные знакомства и решения для роста капитала и компаний.",
    registration: {
      ...eventData.registration,
      lead: salesPreview
        ? "26 сентября · Екатеринбург · БЦ «Саммит». Выберите один из трех форматов участия — от 1 000 ₽."
        : "26 сентября · Екатеринбург · БЦ «Саммит». Программа и три формата участия уже опубликованы — регистрация откроется в ближайшее время.",
      note: salesPreview
        ? "Количество мест ограничено. После заявки команда подтвердит участие и отправит организационные детали."
        : "Тарифы уже опубликованы. Открытие регистрации будет отражено на этой странице без изменения программы и стоимости.",
      formLead:
        "Выберите билет, оставьте контакты и получите подтверждение участия от команды мероприятия.",
    },
    partnersLead:
      "Партнерские форматы для компаний и сообществ готовятся к публикации. Подтвержденные партнеры появятся здесь по мере согласования.",
    location: {
      ...eventData.location,
      venueDescription:
        "БЦ «Саммит» расположен в центре Екатеринбурга и подходит для деловой программы, встреч и офлайн-нетворкинга.",
      note: "Точный зал и схема входа будут опубликованы ближе к событию.",
    },
    footer: {
      ...eventData.footer,
      ctaCopy: "Екатеринбург · БЦ «Саммит» · 12:00–17:00. Один день практической программы и нетворкинга.",
    },
    faq: eventData.faq.map((item) => {
      if (item.question === "Какие есть билеты?") {
        return {
          ...item,
          answer:
            "Доступны три формата участия: Стандарт — 1 000 ₽, Бизнес — 3 000 ₽ и VIP — 5 000 ₽. Состав каждого тарифа указан в блоке регистрации.",
        };
      }

      if (item.question === "Можно ли уже зарегистрироваться?") {
        return { ...item, answer: registrationFaqAnswer };
      }

      if (item.question === "Можно ли стать партнером?") {
        return {
          ...item,
          answer:
            "Да. Партнерские форматы готовятся к публикации; условия и пакеты появятся на странице после финального согласования.",
        };
      }

      return item;
    }),
  };
}

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
  const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() ?? "";
  const brandedSiteReady = isBrandedPublicUrl(configuredSiteUrl);
  const indexingEnabled = process.env.NEXT_PUBLIC_INDEXING_ENABLED === "true";
  const indexPage = Boolean(indexingEnabled && brandedSiteReady && lifecycle.status !== "draft");
  const title = `${eventData.name} — конференция о бизнесе, инвестициях и AI`;

  const baseMetadata: Metadata = {
    title,
    description: eventData.subtitle,
    robots: {
      index: indexPage,
      follow: indexPage,
    },
  };

  if (!brandedSiteReady) {
    return baseMetadata;
  }

  const siteUrl = configuredSiteUrl.replace(/\/$/, "");
  const canonical = `${siteUrl}/${slug}`;
  const socialImage = `${siteUrl}${eventData.assets.heroImage}`;

  return {
    ...baseMetadata,
    alternates: {
      canonical,
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
  searchParams,
}: {
  params: ParamsValue;
  searchParams?: SearchParamsValue;
}) {
  const { slug } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const previewValue = resolvedSearchParams.preview;
  const salesPreview = Array.isArray(previewValue)
    ? previewValue.includes("sales")
    : previewValue === "sales";
  const conference = getConferenceBySlug(slug);

  if (!conference || !conference.lifecycle.pageReady) {
    notFound();
  }

  const { lifecycle, content: sourceEventData } = conference;
  const eventData = getBattleReadyEventData(sourceEventData, salesPreview);

  return (
    <>
      <EventStructuredData eventData={eventData} />
      {salesPreview ? null : <ConversionTracker eventId={lifecycle.id} />}
      <EventTrustBar eventData={eventData} />
      <LandingPage eventData={eventData} />
    </>
  );
}
