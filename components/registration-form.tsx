"use client";

import type { FormEvent } from "react";
import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { BriefcaseIcon, MailIcon, PhoneIcon, UserIcon } from "@/components/icons";
import type { LeadCaptureAvailability, LeadType } from "@/data/event-registry";
import { useLeadCaptureAvailability } from "@/hooks/use-lead-capture-availability";
import { trackConversionEvent } from "@/lib/analytics-client";

const utmKeys = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
] as const;


type Status = "idle" | "loading" | "success" | "error";

type RegistrationFormProps = {
  eventId?: string;
  leadType?: LeadType;
};

type RegistrationResult = {
  ok?: boolean;
  error?: string;
  request_id?: string;
};

const closedLeadCopy: Record<LeadType, { title: string; description: string }> = {
  attendee: {
    title: "Регистрация на эту конференцию закрыта",
    description:
      "Прием новых заявок сейчас недоступен. Актуальный статус следующего события будет опубликован на его странице.",
  },
  partner: {
    title: "Прием партнерских заявок закрыт",
    description: "Партнерские форматы будут доступны только в подтвержденном окне следующего события.",
  },
  speaker: {
    title: "Прием заявок от спикеров закрыт",
    description: "Call for speakers будет доступен только в подтвержденном окне следующего события.",
  },
  media: {
    title: "Медиа-аккредитация закрыта",
    description: "Аккредитация будет доступна только в подтвержденном окне следующего события.",
  },
};

function getAvailabilityCopy(leadType: LeadType, availability: LeadCaptureAvailability | null) {
  if (availability?.reason === "window_not_open") {
    return {
      title: leadType === "attendee" ? "Регистрация еще не открыта" : "Прием заявок еще не открыт",
      description:
        "Временное окно приема заявок еще не началось. Страница автоматически обновит доступность после открытия окна.",
    };
  }

  if (availability?.reason === "event_started") {
    return {
      title: leadType === "attendee" ? "Регистрация завершена" : "Прием заявок завершен",
      description: "Событие уже началось, поэтому новые заявки автоматически закрыты.",
    };
  }

  if (availability?.reason === "window_closed") {
    return {
      title: leadType === "attendee" ? "Регистрация завершена" : "Прием заявок завершен",
      description: "Установленное окно приема заявок уже закрыто.",
    };
  }

  return closedLeadCopy[leadType];
}

export function RegistrationForm({
  eventId = "ekb-2026-06-13",
  leadType = "attendee",
}: RegistrationFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const { availability, refresh: refreshAvailability } = useLeadCaptureAvailability(
    eventId,
    leadType
  );
  const formStarted = useRef(false);
  const idempotencyKeyRef = useRef<string | null>(null);
  const leadCaptureOpen = availability?.open === true;


  function getIdempotencyKey() {
    if (!idempotencyKeyRef.current) {
      idempotencyKeyRef.current = crypto.randomUUID();
    }

    return idempotencyKeyRef.current;
  }

  function handleFormFocus() {
    if (formStarted.current) {
      return;
    }

    formStarted.current = true;
    trackConversionEvent("form_start", eventId, { lead_type: leadType });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const currentAvailability = refreshAvailability();
    if (!currentAvailability?.open) {
      setStatus("idle");
      setMessage("");
      return;
    }

    setStatus("loading");
    setMessage("");

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());
    const idempotencyKey = getIdempotencyKey();

    trackConversionEvent("lead_submit", eventId, { lead_type: leadType });

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": idempotencyKey,
        },
        body: JSON.stringify(payload),
      });

      const result = (await response.json().catch(() => null)) as RegistrationResult | null;

      if (!response.ok || !result?.ok || !result.request_id) {
        const errorCode = result?.error ?? "registration_failed";
        trackConversionEvent("form_error", eventId, {
          lead_type: leadType,
          error_code: errorCode,
          http_status: response.status,
        });

        if (response.status === 409) {
          refreshAvailability();
        }

        throw new Error(errorCode);
      }

      setStatus("success");
      trackConversionEvent("lead_saved", eventId, {
        lead_type: leadType,
        request_id: result.request_id,
      });

      const params = new URLSearchParams({
        event_id: eventId,
        request_id: result.request_id,
        lead_type: leadType,
      });
      router.push(`/thanks?${params.toString()}`);
    } catch (error) {
      setStatus("error");
      setMessage(
        "Не удалось подтвердить сохранение заявки. Проверьте соединение и попробуйте еще раз."
      );

      if (error instanceof TypeError) {
        trackConversionEvent("form_error", eventId, {
          lead_type: leadType,
          error_code: "network_error",
        });
      }
    }
  }

  if (!leadCaptureOpen) {
    const copy = getAvailabilityCopy(leadType, availability);
    return (
      <div className="rounded-[24px] border border-violet-300/20 bg-white/[0.035] p-5">
        <p className="text-lg font-semibold text-white">{copy.title}</p>
        <p className="mt-2 text-sm leading-7 text-white/65">{copy.description}</p>
        {leadType === "attendee" ? (
          <Link href="#program" className="btn-secondary mt-4 inline-flex" data-analytics-cta="archive_program">
            Смотреть программу
          </Link>
        ) : null}
      </div>
    );
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit} onFocusCapture={handleFormFocus}>
      <input type="hidden" name="event_id" value={eventId} />
      <input type="hidden" name="lead_type" value={leadType} />

      <div className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
        <label>
          Не заполняйте это поле
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <label className="block">
        <span className="sr-only">Имя</span>
        <div className="relative">
          <UserIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/55" />
          <input
            name="name"
            required
            minLength={2}
            maxLength={100}
            autoComplete="name"
            className="field-input h-14 pl-12 text-base placeholder:text-white/35"
            placeholder="Ваше имя"
          />
        </div>
      </label>

      <label className="block">
        <span className="sr-only">Телефон</span>
        <div className="relative">
          <PhoneIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/55" />
          <input
            name="phone"
            type="tel"
            required
            minLength={7}
            maxLength={32}
            autoComplete="tel"
            inputMode="tel"
            className="field-input h-14 pl-12 text-base placeholder:text-white/35"
            placeholder="Телефон"
          />
        </div>
      </label>

      <label className="block">
        <span className="sr-only">Email</span>
        <div className="relative">
          <MailIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/55" />
          <input
            name="email"
            type="email"
            maxLength={160}
            autoComplete="email"
            className="field-input h-14 pl-12 text-base placeholder:text-white/35"
            placeholder="Email"
          />
        </div>
      </label>

      <label className="block">
        <span className="sr-only">Компания / должность</span>
        <div className="relative">
          <BriefcaseIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/55" />
          <input
            name="company"
            maxLength={160}
            autoComplete="organization"
            className="field-input h-14 pl-12 text-base placeholder:text-white/35"
            placeholder="Компания / должность"
          />
        </div>
      </label>

      <label className="flex items-start gap-3 rounded-[22px] border border-white/10 bg-black/15 px-4 py-3 text-sm leading-6 text-white/70">
        <input
          name="privacy_consent"
          type="checkbox"
          required
          className="mt-1 h-4 w-4 rounded border-white/20 bg-white/10 text-violet-500 accent-violet-500"
        />
        <span>
          Согласен на обработку персональных данных в соответствии с{" "}
          <Link href="/legal/privacy" className="text-violet-200 underline underline-offset-4">
            политикой обработки персональных данных
          </Link>
          .
        </span>
      </label>

      <label className="flex items-start gap-3 rounded-[22px] border border-white/10 bg-black/15 px-4 py-3 text-sm leading-6 text-white/70">
        <input
          name="marketing_consent"
          type="checkbox"
          className="mt-1 h-4 w-4 rounded border-white/20 bg-white/10 text-violet-500 accent-violet-500"
        />
        <span>Хочу получать новости и информационные сообщения о следующих мероприятиях.</span>
      </label>

      {utmKeys.map((key) => (
        <input key={key} type="hidden" name={key} value={searchParams.get(key) ?? ""} />
      ))}

      <button
        type="submit"
        className="btn-primary w-full justify-center disabled:cursor-not-allowed disabled:opacity-70"
        disabled={status === "loading" || status === "success"}
      >
        {status === "loading" ? "Отправляем..." : status === "success" ? "Заявка сохранена" : "Отправить заявку"}
      </button>

      <p
        role="status"
        aria-live="polite"
        className={`text-sm leading-6 ${
          status === "success"
            ? "text-emerald-300"
            : status === "error"
              ? "text-rose-300"
              : "text-white/55"
        }`}
      >
        {message || "Мы не считаем заявку принятой, пока сервер не подтвердит ее сохранение."}
      </p>
    </form>
  );
}
