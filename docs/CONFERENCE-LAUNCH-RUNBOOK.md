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

### Временные окна lead capture

По умолчанию любой lead capture автоматически закрывается не позднее `startsAt`. Это серверный fail-safe: даже если после начала события забыть сменить `status="sales"`, новые заявки не должны попасть в primary storage.

При необходимости для каждого типа заявки можно задать отдельное окно:

```ts
leadCaptureWindows: {
  attendee: {
    opensAt: "2026-10-01T10:00:00+03:00",
    closesAt: "2026-11-14T09:00:00+03:00",
  },
  speaker: {
    closesAt: "2026-10-20T23:59:00+03:00",
  },
}
```

Правила:
- timestamps только ISO 8601 с явным часовым поясом;
- `opensAt < closesAt`;
- `closesAt` не может быть позже `startsAt`;
- отсутствие `closesAt` означает hard close в `startsAt`;
- невалидное время закрывает lead capture fail-closed;
- attendee lead capture дополнительно требует `status="sales"`;
- partner / speaker / media могут работать в `scheduled`, `sales` или `sold_out`, если соответствующий flag включен.

Conference catalog валидирует временную конфигурацию при build и останавливает сборку при ошибках.

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

Обязательные production значения:
- `LEAD_STORAGE_WEBHOOK_URL`;
- `LEAD_STORAGE_WEBHOOK_SECRET` — сильный server-only secret, минимум 32 символа.

Регистрация работает fail-closed: если primary storage не подтверждает сохранение точным ACK с тем же `request_id`, пользователь не получает ложный success.

Backend должен:
- проверять HMAC-SHA256 по raw JSON body и timestamp;
- проверять freshness timestamp;
- дедуплицировать по `Idempotency-Key` / `request_id`;
- на безопасный повтор возвращать `duplicate:true`;
- не перезаписывать существующую заявку другим payload с тем же idempotency key.

Полный контракт: `docs/LEAD-STORAGE-CONTRACT.md`.

Перед запуском выполнить реальную тестовую заявку и проверить:
1. primary storage;
2. request ID и подпись;
3. повтор того же request ID без дубля;
4. Telegram / Sheets mirrors, если используются;
5. `/thanks`;
6. UTM attribution.

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
- `leadCapture.attendee=true`;
- при необходимости задать `leadCaptureWindows.attendee.opensAt/closesAt`.

Партнерские, speaker и media заявки можно открывать независимо.

Проверить `/api/health`: `events[].attendee_capture.open` должен быть `true`, а `reason` — `open`. После достижения `closesAt` или `startsAt` значение должно автоматически стать `false` без ручного изменения status.

## 11. Проверить `/api/health`

Перед рекламой endpoint должен показывать:
- `ready_for_registration=true`;
- `ready_for_paid_traffic=true`.

`blockers.registration` и `blockers.paid_traffic` должны быть пустыми.

Warnings требуют ручной проверки, но не всегда блокируют запуск.

Если lifecycle формально остается `sales`, но регистрационное окно уже закрыто, health должен показывать temporal blocker (`registration_window_closed`, `sales_event_started` или другой конкретный код), а не `ready`.

## 12. Release path

Рекомендуемый порядок:
1. feature/stage branch;
2. strict `npm ci` + production/full audit;
3. lint + typecheck + build;
4. Vercel Preview;
5. mobile/desktop smoke;
6. test lead;
7. review PR;
8. merge в `main`;
9. production smoke;
10. только после этого запуск рекламы.

Прямые push в `main` использовать нельзя. GitHub branch protection/ruleset должен быть включен в настройках репозитория, когда доступен административный action.
