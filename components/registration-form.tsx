"use client";

import type { FormEvent } from "react";
import { useState } from "react";
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

export function RegistrationForm() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("registration_failed");
      }

      setStatus("success");
      setMessage("Заявка отправлена. Мы свяжемся с вами в ближайшее время.");
      event.currentTarget.reset();
    } catch {
      setStatus("error");
      setMessage("Не удалось отправить заявку. Попробуйте еще раз.");
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <label className="block">
        <span className="sr-only">Имя</span>
        <div className="relative">
          <UserIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/55" />
          <input
            name="name"
            required
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
            required
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
            className="field-input h-14 pl-12 text-base placeholder:text-white/35"
            placeholder="Компания / должность"
          />
        </div>
      </label>

      <label className="flex items-start gap-3 rounded-[22px] border border-white/10 bg-black/15 px-4 py-3 text-sm leading-6 text-white/70">
        <input
          name="consent"
          type="checkbox"
          defaultChecked
          required
          className="mt-1 h-4 w-4 rounded border-white/20 bg-white/10 text-violet-500 accent-violet-500"
        />
        <span>
          Согласен на обработку персональных данных и получение информационных сообщений.
        </span>
      </label>

      {utmKeys.map((key) => (
        <input key={key} type="hidden" name={key} value={searchParams.get(key) ?? ""} />
      ))}

      <button
        type="submit"
        className="btn-primary w-full justify-center disabled:opacity-70"
        disabled={status === "loading"}
      >
        {status === "loading" ? "Отправляем..." : "Отправить заявку"}
      </button>

      <p
        className={`text-sm leading-6 ${
          status === "success"
            ? "text-emerald-300"
            : status === "error"
              ? "text-rose-300"
              : "text-white/55"
        }`}
      >
        {message || "Нажимая кнопку, вы подтверждаете участие по регистрации."}
      </p>
    </form>
  );
}
