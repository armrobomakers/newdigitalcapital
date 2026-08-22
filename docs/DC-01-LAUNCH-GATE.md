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
- [x] `next lint` заменен на ESLint 9 flat config; добавлены `typecheck` и `check`.
- [x] Неверифицированная площадка и маршрут скрыты.
- [x] Placeholder контакты, пустые соцсети и нерабочая newsletter-форма скрыты.
- [x] Draft PR #1 создан; production не изменен.

## Обязательные блокеры до merge / запуска

- [ ] Обновить `next` и `eslint-config-next` с 16.2.9 до 16.2.12 и регенерировать `package-lock.json` штатным npm.
- [ ] Выполнить `npm ci` и `npm run check` на машине с доступом к npm registry.
- [ ] Подтвердить новую дату, город, площадку, полный адрес и маршрут.
- [ ] Создать новое событие с отдельным `event_id` и lifecycle `sales` только после подтверждения данных.
- [ ] Заполнить реальные реквизиты оператора ПД и утвердить финальные юридические тексты.
- [ ] Подключить утвержденный production backend к `LEAD_STORAGE_WEBHOOK_URL`.
- [ ] Выполнить тестовую регистрацию end-to-end и проверить запись именно в primary storage.
- [ ] Подключить брендовый production domain и установить `NEXT_PUBLIC_SITE_URL`.
- [ ] Включать `NEXT_PUBLIC_INDEXING_ENABLED=true` только после проверки production domain/canonical.
- [ ] Провести mobile/desktop visual regression и проверить все CTA/links.
- [ ] Включить branch protection / required review для `main` в настройках GitHub (текущий коннектор не предоставляет mutation для branch protection).

## Dependency/security gate

Полное задание находится в `docs/DC-01-LOCAL-RUNNER-TASK.md`.

Ключевые команды:

```bash
git checkout stage/dc-01-prelaunch-hardening
git pull --ff-only origin stage/dc-01-prelaunch-hardening
npm install --save-exact next@16.2.12
npm install --save-dev --save-exact eslint-config-next@16.2.12
rm -rf node_modules .next
npm ci
npm run lint
npm run typecheck
npm run build
```

Не редактировать integrity hashes в `package-lock.json` вручную.

## Merge policy

PR DC-01 остается Draft, пока каждый обязательный блокер выше не закрыт или не перенесен в отдельный явно утвержденный launch gate.
