# New Digital Capital

Premium event landing for the "Цифровой капитал" conference.

## Local run

```bash
npm install
npm run dev
```

Open `http://localhost:7485/ekb`.

## Docker

```bash
docker compose up --build
```

## Structure

- `data/events.ts` contains all editable event content.
- `/api/register` accepts registration submissions with UTM fields.
- The landing is rendered at `/ekb`.
