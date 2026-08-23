# Next Event Activation

Этот процесс предназначен для проверки следующей конференции до добавления ее в runtime-каталог Digital Capital.

## 1. Создать рабочий manifest

Скопируйте `config/event-activation.template.json` в отдельный рабочий файл и замените все значения `__REQUIRED_*` подтвержденными данными. Установите `template: false`.

Не используйте предположительные дату, площадку, цену, контакты или юридические реквизиты. Если факт еще не подтвержден, оставьте соответствующий readiness-флаг `false` и используйте режим `config`.

## 2. Проверить структуру и lifecycle

```bash
npm ci
npm run event:check -- path/to/event.json config
```

Режим `config` проверяет:
- отсутствие template placeholders;
- lifecycle-инварианты (`draft`, `scheduled`, `sales`, `sold_out`, `past`);
- корректность startsAt и lead-capture windows;
- фактическое состояние attendee capture на момент `checkAt`;
- полный readiness snapshot с blockers и warnings.

Он завершится успешно при валидной конфигурации, даже если запуск еще не готов.

## 3. Проверить открытие регистрации

```bash
npm run event:check -- path/to/event.json registration
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

## 4. Проверить paid traffic

```bash
npm run event:check -- path/to/event.json paid-traffic
```

Кроме registration readiness, требуются:
- structured data;
- analytics backend;
- брендовый production-домен;
- включенная production-индексация.

Пустые partners/socials остаются warnings и сами по себе не блокируют запуск.

## 5. Только после зеленой проверки переносить данные в runtime

Manifest не публикуется автоматически и не меняет сайт. После подтверждения фактов данные переносятся в:
- `data/event-registry.ts` — lifecycle и lead windows;
- `data/events.ts` — публичный контент;
- `data/event-seo.ts` — structured data readiness;
- production environment — legal, lead storage, analytics, site URL и indexing.

После этого обязательны обычный PR, полный GitHub CI и отдельное решение о production deployment.

## Exit codes

- `0` — выбранный режим готов;
- `2` — template, placeholders, invalid manifest или lifecycle;
- `3` — режим `registration` не готов;
- `4` — режим `paid-traffic` не готов;
- `64` — неверные аргументы CLI.
