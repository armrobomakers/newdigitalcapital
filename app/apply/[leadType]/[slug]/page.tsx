import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { RegistrationForm } from "@/components/registration-form";
import { getConferenceBySlug } from "@/data/conferences";
import type { LeadType } from "@/data/event-registry";

type ParamsValue =
  | { leadType: string; slug: string }
  | Promise<{ leadType: string; slug: string }>;

const applicationLeadTypes = new Set<LeadType>(["partner", "speaker", "media"]);

const leadPageCopy: Record<Exclude<LeadType, "attendee">, { title: string; description: string }> = {
  partner: {
    title: "Партнерство с «Цифровым капиталом»",
    description:
      "Оставьте отдельную партнерскую заявку. Она будет сохранена как partner lead и не смешается с регистрациями участников.",
  },
  speaker: {
    title: "Заявка спикера",
    description:
      "Оставьте контакт для участия в программе. Заявка будет обработана отдельно от билетов и партнерских обращений.",
  },
  media: {
    title: "Медиа-аккредитация",
    description:
      "Оставьте заявку редакции или автора. Медиа-обращения ведутся отдельным потоком.",
  },
};

function isApplicationLeadType(value: string): value is Exclude<LeadType, "attendee"> {
  return applicationLeadTypes.has(value as LeadType);
}

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function ApplyPage({ params }: { params: ParamsValue }) {
  const { leadType, slug } = await params;
  if (!isApplicationLeadType(leadType)) {
    notFound();
  }

  const conference = getConferenceBySlug(slug);
  if (!conference || !conference.lifecycle.pageReady) {
    notFound();
  }

  const { lifecycle, content } = conference;
  const copy = leadPageCopy[leadType];

  return (
    <main className="section-shell flex min-h-screen items-center py-16">
      <section className="mx-auto grid w-full max-w-5xl gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-6 shadow-soft backdrop-blur-2xl md:p-8">
          <p className="text-sm uppercase tracking-[0.22em] text-violet-300">{content.name}</p>
          <h1 className="mt-4 font-display text-5xl leading-[0.94] text-white md:text-7xl">
            {copy.title}
          </h1>
          <p className="mt-5 text-base leading-8 text-white/65">{copy.description}</p>
          <div className="mt-6 rounded-[22px] border border-white/10 bg-black/20 p-4 text-sm leading-7 text-white/60">
            <p>{content.dateLabel}</p>
            <p>{content.cityLabel}</p>
            <p>Статус: {lifecycle.status}</p>
          </div>
          <Link href={`/${lifecycle.slug}`} className="btn-secondary mt-6 inline-flex">
            Вернуться к событию
          </Link>
        </div>

        <div className="rounded-[32px] border border-violet-400/25 bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))] p-5 shadow-soft backdrop-blur-2xl md:p-6">
          <Suspense fallback={<p className="text-sm text-white/55">Загрузка формы…</p>}>
            <RegistrationForm eventId={lifecycle.id} leadType={leadType} />
          </Suspense>
        </div>
      </section>
    </main>
  );
}
