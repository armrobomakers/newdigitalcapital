# Digital Capital Conference Launch Runbook

Этот документ описывает безопасный путь добавления и запуска новой конференции без копирования сайта и без ручного обхода launch-gates.

## 1. Создать lifecycle события

Добавить запись в `data/event-registry.ts`.

Минимальные поля:
- уникальный `id`, например `msk-2026-11-14`;
- уникальный `slug`;
- `startsAt` в ISO 8601 с часовым поясом города;
- `status`;
- `pageReady`;
- независимые `leadCapture` для attendee / partner / speaker / media.

Рекомендуемый lifecycle:

`draft → scheduled → sales → sold_out → past`

Нельзя включать `pageReady=true`, пока страница не готова к публичному Preview.

## 2. Добавить content события

Добавить `EventData` в `data/events.ts` с тем же `eventId` и `slug`.

Проверить:
- название и subtitle;
- дата и время;
- город;
- программа;
- спикеры;
- цена / описание участия;
- verified assets;
- контакты;
- FAQ;
- партнеры и social links, если подтверждены.

Conference Engine автоматически остановит приложение, если lifecycle и content расходятся по `eventId` или `slug`.

## 3. Подтвердить площадку

До подтверждения реального адреса:
- `location.verified=false`;
- не публиковать маршрут;
- не включать Event JSON-LD;
- не открывать attendee sales.

После подтверждения заполнить:
- venue;
- address;
- route URL;
- venue description;
- advantages;
- `location.verified=true`.

## 4. Подтвердить SEO event data

В `data/event-seo.ts` перевести событие в `structuredDataReady=true` только после подтверждения:
- startDate / endDate;
- venue name;
- полный адрес;
- страна / город;
- цена и валюта;
- organizer name;
- organizer URL.

Нельзя копировать данные старой конференции как placeholder.

## 5. Заполнить legal configuration

Production env должны содержать:
- `NEXT_PUBLIC_LEGAL_OPERATOR_NAME`;
- `NEXT_PUBLIC_LEGAL_OPERATOR_INN`;
- `NEXT_PUBLIC_LEGAL_OPERATOR_ADDRESS`;
- `NEXT_PUBLIC_LEGAL_PRIVACY_EMAIL`.

Перед запуском вручную проверить тексты privacy / consent / offer и актуальность реквизитов.

## 6. Подключить primary lead storage

Обязательное production значение:
- `LEAD_STORAGE_WEBHOOK_URL`.

Регистрация работает fail-closed: если primary storage не подтверждает сохранение, пользователь не получает ложный success.

Перед запуском выполнить реальную тестовую заявку и проверить:
1. primary storage;
2. request ID;
3. Telegram / Sheets mirrors, если используются;
4. `/thanks`;
5. UTM attribution.

## 7. Подключить analytics

Для paid traffic требуется:
- `ANALYTICS_WEBHOOK_URL`.

Проверить цепочку:
`page_view → cta_click → form_start → lead_submit → lead_saved`.

Third-party pixels подключать только после отдельного решения по consent и privacy.

## 8. Подключить branded domain

`NEXT_PUBLIC_SITE_URL` должен указывать на production branded domain, а не `vercel.app` и не localhost.

После подключения проверить:
- canonical;
- OG/Twitter cards;
- robots.txt;
- sitemap.xml;
- HTTPS;
- redirects;
- CSP Report-Only violations.

## 9. Включить indexing последним

Только после выполнения предыдущих шагов установить:

`NEXT_PUBLIC_INDEXING_ENABLED=true`

До этого robots/sitemap остаются fail-closed.

## 10. Открыть attendee sales

После успешной технической и контентной проверки:
- `status="sales"`;
- `pageReady=true`;
- `leadCapture.attendee=true`.

Партнерские, speaker и media заявки можно открывать независимо.

## 11. Проверить `/api/health`

Перед рекламой endpoint должен показывать:
- `ready_for_registration=true`;
- `ready_for_paid_traffic=true`.

`blockers.registration` и `blockers.paid_traffic` должны быть пустыми.

Warnings требуют ручной проверки, но не всегда блокируют запуск.

## 12. Release path

Рекомендуемый порядок:
1. feature/stage branch;
2. lint + typecheck + build + audit;
3. Vercel Preview;
4. mobile/desktop smoke;
5. test lead;
6. review PR;
7. merge в `main`;
8. production smoke;
9. только после этого запуск рекламы.

Прямые push в `main` использовать нельзя. GitHub branch protection/ruleset должен быть включен в настройках репозитория, когда доступен административный action.
