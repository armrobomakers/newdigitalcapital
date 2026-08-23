# DC-01 — PRE-LAUNCH HARDENING

Этот документ фиксирует обязательные условия перед merge в `main` и открытием рекламного трафика.

## Уже закрыто в ветке

- [x] Старая конференция 2026-06-13 имеет lifecycle `past`.
- [x] UI не принимает заявки на архивное событие.
- [x] API отклоняет прямой POST на закрытое событие.
- [x] Заявка считается успешной только после подтвержденной доставки в отдельное primary storage.
- [x] Google Sheets и Telegram переведены в режим необязательного mirror/notification.
- [x] API требует `LEAD_STORAGE_WEBHOOK_URL`; вспомогательные каналы не могут подтвердить лид.
- [x] `event_id`, `lead_type`, UTM и `request_id` передаются вместе с лидом.
- [x] Согласие на ПД отделено от необязательного согласия на информационные сообщения.
- [x] Honeypot, payload limits, server validation и базовый rate limit добавлены.
- [x] Telegram HTML экранируется.
- [x] `/legal/privacy` и `/legal/offer` существуют как реальные маршруты.
- [x] Регистрация блокируется, пока legal config не заполнен.
- [x] Индексация по умолчанию отключена до явного launch flag.
- [x] Canonical и OpenGraph metadata подготовлены.
- [x] Favicon добавлен через `app/icon.svg`.
- [x] Security headers добавлены; `X-Powered-By` отключен.
- [x] ESLint 9 flat config, `typecheck` и общий `check` добавлены.
- [x] Vercel quality gate выполняет `npm ci` и `npm run check`.
- [x] Неверифицированная площадка и маршрут скрыты.
- [x] Неподтвержденные `500+ / 40+ / 20+` и placeholder-партнеры удалены из архивных данных.
- [x] Placeholder контакты, пустые соцсети и нерабочая newsletter-форма скрыты.
- [x] Next.js обновлен с 16.2.9 до 16.2.12.
- [x] `eslint-config-next` обновлен до 16.2.12.
- [x] `package-lock.json` регенерирован штатным npm на GitHub-hosted runner.
- [x] Dependency runner выполнил `npm ci`, lint, typecheck и build перед commit dependency-файлов.
- [x] Одноразовый workflow с write-permission удален после выполнения задачи.
- [x] Vercel Preview на кодовом head прошел полный quality gate и получил статус `READY`.
- [x] Draft PR #1 mergeable; production не изменен.
- [x] Для дальнейшей технической реализации Codex/local runner не требуется: GitHub + Vercel используются как основной execution path.

## Что еще нужно перед публикацией следующего события

- [ ] Подтвердить новую дату, город, площадку, полный адрес и маршрут следующего события.
- [ ] Создать новое событие с отдельным `event_id` и lifecycle `sales` только после подтверждения данных.
- [ ] Заполнить реальные реквизиты оператора ПД и утвердить финальные юридические тексты.
- [ ] Подключить утвержденный production backend к `LEAD_STORAGE_WEBHOOK_URL`.
- [ ] Выполнить тестовую регистрацию будущего события end-to-end и проверить запись именно в primary storage.
- [ ] Подключить брендовый production domain и установить `NEXT_PUBLIC_SITE_URL`.
- [ ] Включать `NEXT_PUBLIC_INDEXING_ENABLED=true` только после проверки production domain/canonical.
- [ ] Провести mobile/desktop visual regression финального события.
- [ ] Включить branch protection / required review для `main`, если это требуется политикой репозитория.

## Решение по текущему production

Технически PR можно использовать в двух режимах:

1. **Safe archive now** — смержить hardening и заменить устаревший продающий лендинг прошедшего события на безопасный архив.
2. **Hold until next event** — оставить PR Draft и дополнить его данными следующей конференции перед публикацией.

Ни один из этих вариантов не требует Codex. Выбор относится не к технической возможности, а к продуктовой стратегии публикации.
