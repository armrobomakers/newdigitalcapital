"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { BriefcaseIcon, MailIcon, PhoneIcon, UserIcon } from "@/components/icons";

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
  leadType?: "attendee" | "partner" | "speaker" | "media";
};

export function RegistrationForm({
  eventId = "ekb-2026-06-13",
  leadType = "attendee",
}: RegistrationFormProps) {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = (await response.json().catch(() => null)) as
        | { ok?: boolean; error?: string }
        | null;

      if (!response.ok || !result?.ok) {
        throw new Error(result?.error ?? "registration_failed");
      }

      setStatus("success");
      setMessage("Заявка принята. Мы свяжемся с вами по указанному контакту.");
      form.reset();
    } catch {
      setStatus("error");
      setMessage(
        "Не удалось подтвердить сохранение заявки. Проверьте соединение и попробуйте еще раз."
      );
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit} noValidate={false}>
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
        disabled={status === "loading"}
      >
        {status === "loading" ? "Отправляем..." : "Отправить заявку"}
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
