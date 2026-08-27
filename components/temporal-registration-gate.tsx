"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { useLeadCaptureAvailability } from "@/hooks/use-lead-capture-availability";

export function TemporalRegistrationGate({
  eventId,
  openContent,
  closedContent,
}: {
  eventId: string;
  openContent: ReactNode;
  closedContent: ReactNode;
}) {
  const searchParams = useSearchParams();
  const { availability } = useLeadCaptureAvailability(eventId, "attendee");
  const salesPreview = searchParams.get("preview") === "sales";
  const lifecycleContent = availability?.open === true ? openContent : closedContent;

  if (salesPreview || availability?.open === true) {
    return openContent;
  }

  if (availability?.reason === "event_started" || availability?.reason === "window_closed") {
    return lifecycleContent;
  }

  return (
    <div
      data-ui="registration-pending-card"
      className="relative min-h-[420px] overflow-hidden rounded-[32px] border border-violet-400/30 bg-[linear-gradient(180deg,rgba(124,60,255,0.12),rgba(255,255,255,0.03))] p-6 shadow-soft"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_28%_20%,rgba(124,60,255,0.25),transparent_34%)]" />
      <div className="relative flex h-full flex-col justify-between">
        <div>
          <span className="inline-flex rounded-full border border-violet-300/20 bg-violet-400/[0.07] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-violet-100/72">
            Продажи скоро откроются
          </span>
          <h3 className="mt-5 max-w-lg font-display text-5xl leading-[0.95] text-white">
            Регистрация готовится к запуску
          </h3>
          <p className="mt-5 max-w-md text-base leading-7 text-white/68">
            Программа, площадка и тарифы уже опубликованы. Как только откроется прием заявок, здесь появится форма регистрации.
          </p>
        </div>
        <Link href="#program" className="btn-secondary mt-8 inline-flex w-fit">
          Смотреть программу
        </Link>
      </div>
    </div>
  );
}
