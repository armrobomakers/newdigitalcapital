# DC-01 — Local Runner Task

Цель: закрыть dependency/build gate для PR #1 без merge и без production deployment.

## Ветка

`stage/dc-01-prelaunch-hardening`

## Ограничения

- Не работать в `main`.
- Не merge PR #1.
- Не запускать production deploy.
- Не менять дизайн и контент вне исправления ошибок build/lint/typecheck.
- Не редактировать `package-lock.json` вручную.
- При любом неожиданном breaking change остановить upgrade и зафиксировать лог ошибки вместо обхода проверки.

## Шаг 1 — синхронизация

```bash
git fetch origin
git checkout stage/dc-01-prelaunch-hardening
git pull --ff-only origin stage/dc-01-prelaunch-hardening
git status
```

Рабочее дерево должно быть чистым.

## Шаг 2 — security patch Next.js

Остаемся в ветке 16.2 Active LTS и ставим последний stable patch этой ветки:

```bash
npm install --save-exact next@16.2.12
npm install --save-dev --save-exact eslint-config-next@16.2.12
```

Ожидаемые изменения: `package.json`, `package-lock.json` и только связанные dependency metadata.

## Шаг 3 — чистая установка

```bash
rm -rf node_modules .next
npm ci
```

На Windows PowerShell вместо `rm -rf`:

```powershell
Remove-Item -Recurse -Force node_modules,.next -ErrorAction SilentlyContinue
npm ci
```

## Шаг 4 — quality gate

```bash
npm run lint
npm run typecheck
npm run build
```

Все три команды должны завершиться с exit code 0.

Если lint покажет проблемы, исправлять только реальные замечания в текущей ветке. Не отключать правила глобально ради зеленого статуса.

## Шаг 5 — smoke test API

Запустить локально:

```bash
npm run dev
```

Проверить прямой POST на архивное событие:

```bash
curl -i -X POST http://localhost:7485/api/register \
  -H "Content-Type: application/json" \
  -d '{"event_id":"ekb-2026-06-13","lead_type":"attendee","name":"Test User","phone":"+79990000000","privacy_consent":true}'
```

Ожидание: HTTP `409` и `registration_closed`.

Проверить:

- `/ekb` открывается;
- `/legal/privacy` открывается;
- `/legal/offer` открывается;
- `/robots.txt` при default env запрещает индексацию;
- `/sitemap.xml` не публикует event URL при выключенном indexing flag;
- архивный лендинг не показывает активную форму регистрации;
- неверифицированный маршрут скрыт;
- favicon `/icon.svg` отдается без 404.

## Шаг 6 — commit

Если все проверки зеленые:

```bash
git add package.json package-lock.json
# Добавить другие файлы только если они были необходимы для устранения реальных lint/build ошибок.
git commit -m "security: update Next.js to 16.2.12"
git push origin stage/dc-01-prelaunch-hardening
```

После push не merge. PR #1 должен остаться Draft до финального ревью.

## Что прислать в отчет

1. `git rev-parse HEAD`
2. `git status --short`
3. версии:
   - `node -v`
   - `npm -v`
   - `npm ls next eslint-config-next react react-dom`
4. результат `npm run lint`
5. результат `npm run typecheck`
6. результат `npm run build`
7. HTTP status/body smoke-test `/api/register`
8. список измененных файлов `git diff --name-only origin/main...HEAD`
