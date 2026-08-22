import type { Metadata } from "next";
import Link from "next/link";

import { getEventLifecycle } from "@/data/event-registry";

export const metadata: Metadata = {
  title: "Заявка принята — Цифровой капитал",
  robots: {
    index: false,
    follow: false,
  },
};

type SearchParamsValue =
  | { event_id?: string; request_id?: string }
  | Promise<{ event_id?: string; request_id?: string }>;

export default async function ThanksPage({ searchParams }: { searchParams: SearchParamsValue }) {
  const params = await searchParams;
  const eventId = (params.event_id ?? "").slice(0, 80);
  const requestId = (params.request_id ?? "").slice(0, 80);
  const event = getEventLifecycle(eventId);
  const returnHref = event ? `/${event.slug}` : "/";

  return (
    <main className="section-shell flex min-h-screen items-center py-16">
      <section className="mx-auto w-full max-w-3xl rounded-[36px] border border-violet-400/30 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-6 shadow-soft backdrop-blur-2xl md:p-10">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-violet-300/40 bg-violet-500/15 text-2xl text-violet-100">
          ✓
        </div>
        <p className="mt-6 text-sm uppercase tracking-[0.24em] text-violet-300">Цифровой капитал</p>
        <h1 className="mt-3 font-display text-5xl leading-[0.95] text-white md:text-7xl">
          Заявка принята
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-white/68">
          Сервер подтвердил сохранение заявки. Следующий шаг — подтверждение участия и организационные детали по указанному вами контакту.
        </p>

        {requestId ? (
          <div className="mt-6 rounded-[22px] border border-white/10 bg-black/20 px-4 py-4">
            <p className="text-xs uppercase tracking-[0.18em] text-white/40">Номер заявки</p>
            <p className="mt-2 break-all font-mono text-sm text-white/82">{requestId}</p>
          </div>
        ) : null}

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4">
            <p className="text-sm font-medium text-white">1. Заявка сохранена</p>
            <p className="mt-2 text-sm leading-6 text-white/55">Мы получили подтверждение от основного хранилища.</p>
          </div>
          <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4">
            <p className="text-sm font-medium text-white">2. Связь с участником</p>
            <p className="mt-2 text-sm leading-6 text-white/55">Организатор уточнит формат и дальнейшие действия.</p>
          </div>
          <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4">
            <p className="text-sm font-medium text-white">3. Подтверждение участия</p>
            <p className="mt-2 text-sm leading-6 text-white/55">Оплата и билет появятся в следующем этапе платформы.</p>
          </div>
        </div>

        <Link href={returnHref} className="btn-secondary mt-8 inline-flex">
          Вернуться к конференции
        </Link>
      </section>
    </main>
  );
}
