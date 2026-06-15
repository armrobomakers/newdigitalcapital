# Описание проекта «Цифровой капитал»

Постоянный landing-проект для конференций «Цифровой капитал». Сделан под связку **GitHub + Vercel** без отдельного сервера и тяжелой CMS.

## Главная задача

Человек заходит с телефона, быстро понимает ценность мероприятия, видит дату, город, место, нажимает регистрацию и оставляет заявку.

## Что реализовано

- Next.js App Router + TypeScript
- Tailwind CSS
- Mobile-first верстка
- Sticky CTA-кнопка регистрации на мобильной версии
- Переиспользуемая структура под разные города через `data/events.ts`
- Форма регистрации через `/api/register`
- Telegram-уведомления о заявках
- Опциональная отправка заявок в Google Sheets через Apps Script webhook
- Поддержка VK Pixel и Яндекс.Метрики через env-переменные
- SEO, robots и sitemap
- Docker-запуск на локальном порту `7485`

## Архитектура

```text
GitHub → Vercel → Next.js landing
                 ↓
              /api/register
                 ↓
      Telegram + Google Sheets webhook
```

## Локальный запуск

```bash
cp .env.local.example .env.local
docker compose up --build
```

Открыть:

```text
http://localhost:7485/ekb
```

## Как добавлять новые города

Все данные конференций лежат в `data/events.ts`.

Добавляется новый объект, например:

```ts
novosibirsk: {
  slug: 'novosibirsk',
  city: 'Новосибирск',
  date: '...',
  speakers: [...],
  program: [...]
}
```

После этого страница будет доступна по адресу `/novosibirsk`.
