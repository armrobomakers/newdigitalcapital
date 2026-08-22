# DC-01 — PRE-LAUNCH HARDENING

Этот документ фиксирует обязательные условия перед merge в `main` и открытием рекламного трафика.

## Уже закрыто в ветке

- [x] Старая конференция 2026-06-13 имеет lifecycle `past`.
- [x] UI не принимает заявки на архивное событие.
- [x] API отклоняет прямой POST на закрытое событие.
- [x] Заявка считается успешной только после подтвержденной доставки в основное хранилище.
- [x] `event_id`, `lead_type`, UTM и `request_id` передаются вместе с лидом.
- [x] Согласие на ПД отделено от необязательного согласия на информационные сообщения.
- [x] Honeypot, payload limits, server validation и базовый rate limit добавлены.
- [x] Telegram HTML экранируется.
- [x] `/legal/privacy` и `/legal/offer` существуют как реальные маршруты.
- [x] Регистрация блокируется, пока legal config не заполнен.
- [x] Индексация по умолчанию отключена до явного launch flag.
- [x] Canonical и OpenGraph metadata подготовлены.
- [x] Security headers добавлены; `X-Powered-By` отключен.
- [x] `next lint` заменен на ESLint 9 flat config; добавлены `typecheck` и `check`.
- [x] Неверифицированная площадка и маршрут скрыты.
- [x] Placeholder контакты, пустые соцсети и нерабочая newsletter-форма скрыты.

## Обязательные блокеры до merge / запуска

- [ ] Обновить Next.js и `eslint-config-next` с 16.2.9 минимум до 16.2.11 и регенерировать `package-lock.json` штатным npm.
- [ ] Выполнить `npm ci` и `npm run check` на машине с доступом к npm registry.
- [ ] Подтвердить новую дату, город, площадку, полный адрес и маршрут.
- [ ] Создать новое событие с отдельным `event_id` и lifecycle `sales` только после подтверждения данных.
- [ ] Заполнить реальные реквизиты оператора ПД и утвердить финальные юридические тексты.
- [ ] Подключить основное допустимое хранилище лидов; Telegram оставить уведомлением.
- [ ] Выполнить тестовую регистрацию end-to-end и проверить запись лида.
- [ ] Подключить брендовый production domain и установить `NEXT_PUBLIC_SITE_URL`.
- [ ] Включать `NEXT_PUBLIC_INDEXING_ENABLED=true` только после проверки production domain/canonical.
- [ ] Провести mobile/desktop visual regression и проверить все CTA/links.

## Команды для dependency/security gate

На локальной машине или выделенном runner с доступом к npm registry:

```bash
git checkout stage/dc-01-prelaunch-hardening
git pull
npm install next@^16.2.11 eslint-config-next@^16.2.11
npm ci
npm run check
git add package.json package-lock.json
git commit -m "security: update Next.js to patched 16.2 release"
git push
```

Не редактировать integrity hashes в `package-lock.json` вручную.

## Merge policy

PR DC-01 остается Draft, пока каждый обязательный блокер выше не закрыт или не перенесен в отдельный явно утвержденный launch gate.
