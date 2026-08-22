import Link from "next/link";

import { isLegalConfigReady, legalConfig } from "@/lib/legal";

export const metadata = {
  title: "Политика обработки персональных данных — Цифровой капитал",
  description: "Политика обработки персональных данных сайта конференции «Цифровой капитал».",
};

export default function PrivacyPage() {
  const ready = isLegalConfigReady();

  return (
    <main className="min-h-screen bg-ink-900 px-5 py-12 text-white sm:px-8">
      <article className="mx-auto max-w-3xl rounded-[32px] border border-white/10 bg-white/[0.045] p-6 shadow-soft sm:p-9">
        <Link href="/ekb" className="text-sm text-violet-200 hover:text-violet-100">
          ← Вернуться на сайт
        </Link>

        <h1 className="mt-6 font-display text-4xl leading-tight sm:text-5xl">
          Политика обработки персональных данных
        </h1>

        {!ready ? (
          <div className="mt-6 rounded-[22px] border border-amber-300/20 bg-amber-200/[0.06] p-4 text-sm leading-7 text-amber-100/90">
            Регистрация на мероприятия закрыта до публикации полных реквизитов оператора
            персональных данных. Эта страница уже подключена технически, но не должна считаться
            финальной юридической редакцией до заполнения реквизитов организатора.
          </div>
        ) : null}

        <div className="mt-8 space-y-7 text-[15px] leading-7 text-white/72">
          <section>
            <h2 className="text-xl font-semibold text-white">1. Оператор</h2>
            <p className="mt-2">
              Оператор: {legalConfig.operatorName || "не указан"}. ИНН:{" "}
              {legalConfig.operatorInn || "не указан"}. Адрес:{" "}
              {legalConfig.operatorAddress || "не указан"}. Контакт по вопросам персональных
              данных: {legalConfig.privacyEmail || "не указан"}.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">2. Какие данные обрабатываются</h2>
            <p className="mt-2">
              При регистрации могут обрабатываться имя, телефон, email, компания или должность,
              сведения о выбранном мероприятии, технические идентификаторы заявки и рекламные UTM
              метки. Мы не запрашиваем специальные категории персональных данных.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">3. Цели обработки</h2>
            <p className="mt-2">
              Данные используются для обработки заявки, связи с участником, организации участия,
              ведения учета заявок и исполнения обязательств по мероприятию. Информационные и
              рекламные сообщения направляются только при отдельном согласии пользователя.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">4. Сроки и прекращение обработки</h2>
            <p className="mt-2">
              Данные хранятся только в объеме и в течение срока, необходимого для заявленных целей
              и выполнения требований законодательства. Пользователь может обратиться к оператору
              по указанному выше адресу электронной почты для реализации своих прав.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">5. Передача и защита данных</h2>
            <p className="mt-2">
              Доступ к данным получают только лица и подрядчики, которым он необходим для работы
              мероприятия и которые обязаны соблюдать требования к конфиденциальности и защите
              данных. До открытия регистрации организатор обязан утвердить фактическую схему
              хранения и передачи данных и привести ее в соответствие с применимым законодательством.
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
