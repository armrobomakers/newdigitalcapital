# Digital Capital Landing

Готовый mobile-first лендинг конференции **«Цифровой капитал»** под связку **GitHub + Vercel**.

Проект рассчитан на постоянное использование: один код, разные города, даты, программы, спикеры и партнеры через `data/events.ts`.

## Что внутри

- Next.js App Router + TypeScript
- Tailwind CSS
- Mobile-first дизайн в стиле «Цифровой капитал»
- Закрепленная CTA-кнопка регистрации на мобильной версии
- Переиспользуемые страницы под разные города через `data/events.ts`
- Форма регистрации через `/api/register`
- Сохранение UTM, referrer и landing page
- Уведомления в Telegram
- Опциональная отправка заявок в Google Sheets через Apps Script webhook
- Яндекс.Метрика и VK Pixel
- SEO, Open Graph, sitemap и robots
- Docker-запуск локально на порту `7485`

---

## Быстрый запуск через Docker

Локальный порт: **7485**.

### 1. Скопировать env-файл

```bash
cp .env.local.example .env.local
```

На Windows PowerShell:

```powershell
Copy-Item .env.local.example .env.local
```

### 2. Запустить проект

```bash
docker compose up --build
```

Открыть в браузере:

```text
http://localhost:7485/ekb
```

Главная страница автоматически перенаправляет на `/ekb`.

### 3. Остановить проект

```bash
docker compose down
```

---

## Запуск без Docker

```bash
npm install
npm run dev:local
```

Открыть:

```text
http://localhost:7485/ekb
```

---

## Деплой на Vercel

1. Создайте репозиторий на GitHub.
2. Загрузите проект в репозиторий.
3. Подключите репозиторий в Vercel.
4. Добавьте Environment Variables из `.env.example` или `.env.local.example`.
5. Нажмите Deploy.

Для Vercel Docker не нужен. Vercel сам определит Next.js и соберет проект.

---

## Environment Variables

Для локального Docker-запуска создайте `.env.local`.

Для Vercel добавьте эти переменные в:

```text
Project Settings → Environment Variables
```

Основные переменные:

```text
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
TELEGRAM_THREAD_ID=
GOOGLE_SHEETS_WEBHOOK_URL=
NEXT_PUBLIC_YANDEX_METRIKA_ID=
NEXT_PUBLIC_VK_PIXEL_ID=
NEXT_PUBLIC_SITE_URL=
```

На локалке:

```text
NEXT_PUBLIC_SITE_URL=http://localhost:7485
```

На Vercel:

```text
NEXT_PUBLIC_SITE_URL=https://ваш-домен.ru
```

---

## Как изменить конференцию

Все основные данные лежат в:

```text
data/events.ts
```

Там можно менять:

- город;
- дату;
- время;
- место;
- программу;
- спикеров;
- партнеров;
- FAQ;
- адрес;
- карту;
- блоки преимуществ.

Для нового города добавьте новый объект:

```ts
export const events = {
  ekb: { ... },
  moscow: { ... }
}
```

Страница автоматически будет доступна по адресу:

```text
/moscow
```

---

## Telegram уведомления

Создайте Telegram-бота через `@BotFather`, добавьте его в чат организаторов и укажите:

```text
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
```

Если уведомления должны идти в топик супергруппы:

```text
TELEGRAM_THREAD_ID=
```

После каждой регистрации в чат будет прилетать заявка с UTM-метками.

---

## Google Sheets через Apps Script

Создайте Google Sheet с листом `Registrations`.

В Google Apps Script вставьте код:

```javascript
function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Registrations');
  const data = JSON.parse(e.postData.contents);
  sheet.appendRow([
    new Date(),
    data.eventTitle || '',
    data.eventSlug || '',
    data.name || '',
    data.phone || '',
    data.telegram || '',
    data.email || '',
    data.role || '',
    data.interest || '',
    data.utm_source || '',
    data.utm_medium || '',
    data.utm_campaign || '',
    data.utm_content || '',
    data.utm_term || '',
    data.referrer || '',
    data.landing_page || '',
    data.comment || ''
  ]);
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

Опубликуйте Apps Script как Web App и вставьте URL в переменную:

```text
GOOGLE_SHEETS_WEBHOOK_URL=
```

---

## UTM-аналитика

Форма сохраняет:

```text
utm_source
utm_medium
utm_campaign
utm_content
utm_term
referrer
landing_page
```

Это позволяет понимать, какие источники дают регистрации: VK Ads, Telegram, партнеры, прямые заходы.

---

## Локальная структура

```text
app/                  страницы и API
components/           UI-блоки лендинга
data/events.ts        контент конференций
lib/                  аналитика, типы, форматирование
public/               публичные изображения и иконки
Dockerfile            Docker-сборка
docker-compose.yml    локальный запуск на 7485
```
