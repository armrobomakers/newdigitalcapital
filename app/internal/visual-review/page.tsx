import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { MailIcon, PhoneIcon, UserIcon } from "@/components/icons";
import {
  ChoiceCard,
  ConsentRow,
  IconField,
  StatusLine,
} from "@/components/ui/form-controls";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Visual review",
  robots: {
    index: false,
    follow: false,
  },
};

const previewEnabled = process.env.VISUAL_REVIEW_ENABLED === "true";

export default function VisualReviewPage() {
  if (!previewEnabled) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#05040f] px-4 py-10 text-white sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-[28px] border border-violet-300/15 bg-[radial-gradient(circle_at_10%_0%,rgba(124,60,255,0.16),transparent_34%),rgba(255,255,255,0.025)] p-5 shadow-soft sm:p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-200/60">
            CI visual review · internal only
          </p>
          <h1 className="mt-3 font-display text-4xl leading-none sm:text-6xl">
            Digital Capital UI primitives
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-white/58">
            Эта страница доступна только при VISUAL_REVIEW_ENABLED=true. Значения ниже — безопасные
            плейсхолдеры для визуальной проверки и не являются фактическими данными события.
          </p>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <section className="rounded-[28px] border border-white/[0.08] bg-white/[0.025] p-4 sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-200/60">
              Source-owned fields
            </p>
            <div className="mt-4 space-y-3.5">
              <IconField
                label="Имя"
                icon={<UserIcon className="h-4 w-4" />}
                inputProps={{ name: "visual_name", placeholder: "TODO_ATTENDEE_NAME" }}
              />
              <IconField
                label="Телефон"
                icon={<PhoneIcon className="h-4 w-4" />}
                inputProps={{ name: "visual_phone", type: "tel", placeholder: "TODO_ORGANIZER_PHONE" }}
              />
              <IconField
                label="Email"
                icon={<MailIcon className="h-4 w-4" />}
                inputProps={{ name: "visual_email", type: "email", placeholder: "TODO_PRIVACY_EMAIL" }}
              />

              <ConsentRow inputProps={{ name: "visual_privacy" }}>
                Согласен с TODO_PRIVACY_POLICY и обработкой тестовых данных visual-review.
              </ConsentRow>
              <ConsentRow inputProps={{ name: "visual_marketing" }}>
                Хочу получать тестовые анонсы visual-review.
              </ConsentRow>

              <button type="button" className="btn-primary min-h-[58px] w-full justify-center">
                Отправить заявку
              </button>

              <StatusLine tone="neutral">
                TODO_FORM_STATUS — серверное подтверждение ещё не выполнялось.
              </StatusLine>
              <StatusLine tone="success">Visual success state</StatusLine>
              <StatusLine tone="error">Visual error state</StatusLine>
            </div>
          </section>

          <section className="rounded-[28px] border border-white/[0.08] bg-white/[0.025] p-4 sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-200/60">
              Ticket choices
            </p>
            <div className="mt-4 grid gap-3 md:grid-cols-3 xl:grid-cols-1 2xl:grid-cols-3">
              <ChoiceCard
                title="Standard"
                valueLabel="1 000 ₽"
                description="Visual fixture"
                benefits={["TODO_STANDARD_BENEFIT_1", "TODO_STANDARD_BENEFIT_2"]}
                inputProps={{ name: "visual_ticket", value: "standard", defaultChecked: true }}
              />
              <ChoiceCard
                title="Business"
                valueLabel="3 000 ₽"
                description="Visual fixture"
                benefits={["TODO_BUSINESS_BENEFIT_1", "TODO_BUSINESS_BENEFIT_2"]}
                inputProps={{ name: "visual_ticket", value: "business" }}
              />
              <ChoiceCard
                highlighted
                title="VIP"
                valueLabel="5 000 ₽"
                description="Visual fixture"
                benefits={["TODO_VIP_BENEFIT_1", "TODO_VIP_BENEFIT_2"]}
                inputProps={{ name: "visual_ticket", value: "vip" }}
              />
            </div>

            <div className="mt-6 rounded-[24px] border border-white/[0.08] bg-black/20 p-4">
              <p className="text-sm font-semibold text-white/80">Placeholder contract</p>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-white/52">
                <li>TODO_ORGANIZER_PHONE</li>
                <li>TODO_PRIVACY_EMAIL</li>
                <li>TODO_BRANDED_SITE_URL</li>
                <li>TODO_EVENT_HALL</li>
                <li>TODO_ENTRY_INSTRUCTIONS</li>
              </ul>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
