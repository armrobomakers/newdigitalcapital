"use client";

import type { FormEvent } from "react";
import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { BriefcaseIcon, MailIcon, PhoneIcon, UserIcon } from "@/components/icons";
import {
  ChoiceCard,
  ConsentRow,
  IconField,
  StatusLine,
} from "@/components/ui/form-controls";
import type { LeadCaptureAvailability, LeadType } from "@/data/event-registry";
import { getEventContent } from "@/data/events";
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
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const { availability, refresh: refreshAvailability } = useLeadCaptureAvailability(
    eventId,
    leadType
  );
  const formStarted = useRef(false);
  const idempotencyKeyRef = useRef<string | null>(null);
  const leadCaptureOpen = availability?.open === true;
  const ticketOptions =
    leadType === "attendee" ? (getEventContent(eventId)?.registration.tickets ?? []) : [];

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
    const payload: Record<string, FormDataEntryValue | string> = Object.fromEntries(formData.entries());
    const query = new URLSearchParams(window.location.search);
    for (const key of utmKeys) {
      payload[key] = query.get(key) ?? "";
    }

    const idempotencyKey = getIdempotencyKey();
    const selectedTicket = formData.get("ticket")?.toString() ?? "";

    trackConversionEvent("lead_submit", eventId, {
      lead_type: leadType,
      ...(selectedTicket ? { ticket: selectedTicket } : {}),
    });

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
        ...(selectedTicket ? { ticket: selectedTicket } : {}),
      });

      const params = new URLSearchParams({
        event_id: eventId,
        request_id: result.request_id,
        lead_type: leadType,
      });
      if (selectedTicket) {
        params.set("ticket", selectedTicket);
      }
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

  const statusTone = status === "success" ? "success" : status === "error" ? "error" : "neutral";

  return (
    <form className="space-y-3.5" onSubmit={handleSubmit} onFocusCapture={handleFormFocus}>
      <input type="hidden" name="event_id" value={eventId} />
      <input type="hidden" name="lead_type" value={leadType} />

      <div className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
        <label>
          Не заполняйте это поле
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {ticketOptions.length > 0 ? (
        <fieldset
          data-ui="ticket-selector"
          className="rounded-[26px] border border-white/[0.08] bg-white/[0.018] p-3.5"
        >
          <legend className="px-2 text-[13px] font-semibold text-white/78">Выберите билет</legend>
          <div className="mt-2.5 grid gap-2.5 md:grid-cols-3">
            {ticketOptions.map((ticket, index) => (
              <ChoiceCard
                key={ticket.id}
                highlighted={ticket.highlighted}
                inputProps={{
                  name: "ticket",
                  value: ticket.id,
                  required: true,
                  defaultChecked: index === 0,
                }}
                title={ticket.name}
                valueLabel={ticket.price}
                description={ticket.description}
                benefits={ticket.benefits}
              />
            ))}
          </div>
          <p className="mt-3 rounded-[16px] border border-amber-200/10 bg-amber-200/[0.025] px-3 py-2 text-xs leading-5 text-amber-100/58">
            Наполнение тарифов пока предварительное и будет уточняться.
          </p>
        </fieldset>
      ) : null}

      <IconField
        label="Имя"
        icon={<UserIcon className="h-4 w-4" />}
        inputProps={{
          name: "name",
          required: true,
          minLength: 2,
          maxLength: 100,
          autoComplete: "name",
          placeholder: "Ваше имя",
        }}
      />

      <IconField
        label="Телефон"
        icon={<PhoneIcon className="h-4 w-4" />}
        inputProps={{
          name: "phone",
          type: "tel",
          required: true,
          minLength: 7,
          maxLength: 32,
          autoComplete: "tel",
          inputMode: "tel",
          placeholder: "Телефон",
        }}
      />

      <IconField
        label="Email"
        icon={<MailIcon className="h-4 w-4" />}
        inputProps={{
          name: "email",
          type: "email",
          maxLength: 160,
          autoComplete: "email",
          placeholder: "Email",
        }}
      />

      <IconField
        label="Компания / должность"
        icon={<BriefcaseIcon className="h-4 w-4" />}
        inputProps={{
          name: "company",
          maxLength: 160,
          autoComplete: "organization",
          placeholder: "Компания / должность",
        }}
      />

      <ConsentRow inputProps={{ name: "privacy_consent", required: true }}>
        Согласен на обработку персональных данных в соответствии с{" "}
        <Link href="/legal/privacy" className="text-violet-200 underline underline-offset-4">
          политикой обработки персональных данных
        </Link>
        .
      </ConsentRow>

      <ConsentRow inputProps={{ name: "marketing_consent" }}>
        Хочу получать новости и информационные сообщения о следующих мероприятиях.
      </ConsentRow>

      <button
        type="submit"
        className="btn-primary min-h-[58px] w-full justify-center text-[15px] disabled:cursor-not-allowed disabled:opacity-70"
        disabled={status === "loading" || status === "success"}
      >
        {status === "loading" ? "Отправляем..." : status === "success" ? "Заявка сохранена" : "Отправить заявку"}
      </button>

      <StatusLine tone={statusTone}>
        {message || "Мы не считаем заявку принятой, пока сервер не подтвердит ее сохранение."}
      </StatusLine>
    </form>
  );
}
