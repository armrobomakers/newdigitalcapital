# Next Event Activation

Этот процесс предназначен для проверки конференции до финального production release Digital Capital.

## 1. Рабочие manifest

Для новых событий используйте `config/event-activation.template.json`.

Для текущего события 26 сентября 2026 уже подготовлен рабочий файл:

`config/event-activation.september-draft.json`

Он содержит подтвержденные данные и явные безопасные TODO там, где факт еще не известен. Секреты в manifest не записываются.

Для каждого текущего сентябрьского TODO существует каноническая карточка в:

`config/september-placeholder-registry.json`

Registry фиксирует:
- технический `TODO_*` token;
- что именно нужно подтвердить;
- куда потом внести реальное значение;
- какой launch-этап зависит от значения;
- какой нормальный public fallback использовать до подтверждения.

Допустимые маркеры незавершенных данных:
- `TODO_*`;
- `TBD_*`;
- `PLACEHOLDER_*`;
- `REPLACE_ME_*` / `CHANGE_ME_*`;
- `[... ]` / `<...>`;
- legacy `__REQUIRED_*`.

Manifest с `draft: true`, `template: true` или любым таким placeholder не может считаться release-ready.

## 2. Посмотреть, что осталось заполнить

Самый удобный операторский вывод для сентябрьского события:

```bash
npm run launch:fill-map
```

Он группирует TODO по этапам `registration`, `paid_traffic`, `event_ops` и `content_polish` и для каждого показывает точный `fillTarget` и public fallback.

Машиночитаемый вариант:

```bash
npm run launch:fill-map:json
```

Низкоуровневый список placeholders внутри activation manifest:

```bash
npm run launch:todo
```

Команда возвращает JSON со списком `unresolved`: путь внутри manifest и текущее placeholder-значение. Это информационный режим и он не ломает обычную разработку.

CI дополнительно выполняет:

```bash
npm run placeholder:registry:test
```

Проверка падает, если новый unresolved TODO появился без записи в registry, если registry содержит лишний TODO, если отсутствует `fillTarget`/public fallback или технический placeholder может утечь в публичный event-ops UI.

Строгий release-gate:

```bash
npm run launch:check
```

Он завершится ненулевым кодом, пока manifest остается draft/template или содержит TODO.

Важно: просто удалить поле из `unresolved` недостаточно. Подтвержденное значение должно быть внесено в реальный runtime-контур — `data/events.ts`, `data/event-operational-details.ts`, `data/event-seo.ts` или production environment — и соответствующий readiness-флаг должен стать `true` только после фактической проверки.

## 3. Public-safe placeholders

Технические токены можно хранить в source/config, но нельзя показывать посетителю как `TODO_*`.

Например, для 26 сентября:
- `TODO_EVENT_HALL` хранится в `data/event-operational-details.ts`, пока номер зала неизвестен;
- `TODO_ENTRY_INSTRUCTIONS` там же хранит незавершенную инструкцию по входу;
- публичный trust bar проверяет эти значения через `isResolvedConfigValue()`;
- пока они не подтверждены, человек видит «Зал: будет указан дополнительно» и «Вход: схема прохода появится ближе к событию».

Тот же принцип применяется к телефону, legal/privacy contact, домену, аналитике, партнерам и social links: незаполненное значение остается явным для команды, но не маскируется под выдуманный факт для посетителя.

## 4. Проверить структуру и lifecycle

После создания отдельного **resolved manifest** без placeholders:

```bash
npm ci
npm run event:check -- path/to/resolved-event.json config
```

Режим `config` проверяет:
- отсутствие draft/template/placeholders;
- lifecycle-инварианты (`draft`, `scheduled`, `sales`, `sold_out`, `past`);
- корректность `startsAt` и lead-capture windows;
- фактическое состояние attendee capture на момент `checkAt`;
- полный readiness snapshot с blockers и warnings.

Он завершится успешно при валидной конфигурации, даже если регистрация или paid traffic еще не готовы.

## 5. Проверить открытие регистрации

```bash
npm run event:check -- path/to/resolved-event.json registration
```

Команда завершится с кодом 0 только когда `registration_ready=true`.

Минимально должны быть готовы:
- page-ready sales lifecycle;
- открытое attendee lead window;
- подтвержденная площадка;
- рабочие email и телефон;
- спикеры и программа;
- юридический контур персональных данных;
- primary lead storage и сильная webhook signature.

## 6. Проверить paid traffic

```bash
npm run event:check -- path/to/resolved-event.json paid-traffic
```

Кроме registration readiness, требуются:
- подтвержденный Event JSON-LD;
- production analytics backend;
- реальный брендовый HTTPS production-домен;
- включенная production-индексация.

Пустые partners/socials остаются warnings и сами по себе не блокируют запуск.

SEO дополнительно работает fail-closed: одного `NEXT_PUBLIC_INDEXING_ENABLED=true` недостаточно. Без валидного branded HTTPS `NEXT_PUBLIC_SITE_URL` сайт не должен публиковать индексируемые robots/sitemap/canonical на техническом `vercel.app` домене.

## 7. Перенос подтвержденных значений

Manifest не публикуется автоматически и не меняет сайт. После подтверждения фактов данные переносятся в:
- `data/event-registry.ts` — lifecycle и lead windows;
- `data/events.ts` — публичный контент и organizer contacts;
- `data/event-operational-details.ts` — точный зал и инструкции по входу;
- `data/event-seo.ts` — structured data readiness;
- production environment — privacy email, lead storage, analytics, branded site URL и indexing.

Не записывайте реальные webhook secrets, Telegram token или другие секреты в activation manifest или placeholder registry.

## 8. Release sequence

Перед production release:

```bash
npm run launch:fill-map
npm run launch:todo
npm run launch:check
npm run check
npm run event:check -- path/to/resolved-event.json registration
npm run event:check -- path/to/resolved-event.json paid-traffic
```

Затем проверить `/api/health`. Production deployment выполнять отдельной осознанной пачкой; Vercel Git auto-deploy остается выключенным во время промежуточной разработки.

## Exit codes

### `launch:check`
- `0` — draft/template/placeholders отсутствуют;
- `3` — manifest еще содержит незавершенные данные или помечен draft/template.

### `event:check`
- `0` — выбранный режим готов;
- `2` — draft/template/placeholders, invalid manifest или lifecycle;
- `3` — режим `registration` не готов;
- `4` — режим `paid-traffic` не готов;
- `64` — неверные аргументы CLI.
