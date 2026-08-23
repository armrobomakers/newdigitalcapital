import Link from "next/link";

import { isLegalConfigReady, legalConfig } from "@/lib/legal";

export const metadata = {
  title: "Публичная оферта — Цифровой капитал",
  description: "Условия участия в мероприятиях «Цифровой капитал».",
};

export default function OfferPage() {
  const ready = isLegalConfigReady();

  return (
    <main className="min-h-screen bg-ink-900 px-5 py-12 text-white sm:px-8">
      <article className="mx-auto max-w-3xl rounded-[32px] border border-white/10 bg-white/[0.045] p-6 shadow-soft sm:p-9">
        <Link href="/ekb" className="text-sm text-violet-200 hover:text-violet-100">
          ← Вернуться на сайт
        </Link>

        <h1 className="mt-6 font-display text-4xl leading-tight sm:text-5xl">Публичная оферта</h1>

        {!ready ? (
          <div className="mt-6 rounded-[22px] border border-amber-300/20 bg-amber-200/[0.06] p-4 text-sm leading-7 text-amber-100/90">
            Продажа билетов и прием оплаты должны оставаться закрытыми до заполнения реквизитов
            организатора и утверждения финальной редакции оферты.
          </div>
        ) : null}

        <div className="mt-8 space-y-7 text-[15px] leading-7 text-white/72">
          <section>
            <h2 className="text-xl font-semibold text-white">1. Организатор</h2>
            <p className="mt-2">
              {legalConfig.operatorName || "Реквизиты организатора не опубликованы"}. ИНН:{" "}
              {legalConfig.operatorInn || "не указан"}. Адрес:{" "}
              {legalConfig.operatorAddress || "не указан"}.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">2. Предмет</h2>
            <p className="mt-2">
              Организатор предоставляет участнику право участия в выбранном мероприятии на условиях,
              опубликованных на странице конкретной конференции. Дата, площадка, программа, состав
              спикеров, стоимость и состав пакета участия фиксируются на странице события до оплаты.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">3. Оплата и подтверждение</h2>
            <p className="mt-2">
              Обязательство по предоставлению платного участия возникает после подтверждения оплаты.
              До подключения платежного контура сайт не должен отображать заявку как оплаченный билет.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">4. Возвраты и изменения</h2>
            <p className="mt-2">
              Финальные правила возврата, замены участника, переноса или отмены мероприятия должны
              быть утверждены организатором до открытия продаж и опубликованы в этой оферте.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">5. Контакты</h2>
            <p className="mt-2">
              По вопросам участия и документов: {legalConfig.privacyEmail || "контакт будет указан до открытия продаж"}.
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
