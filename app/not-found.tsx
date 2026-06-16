import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-ink-900 px-6 text-white">
      <div className="max-w-md rounded-[28px] border border-white/10 bg-white/6 p-8 text-center shadow-soft backdrop-blur-xl">
        <p className="text-xs uppercase tracking-[0.35em] text-white/45">404</p>
        <h1 className="mt-4 text-3xl font-semibold">Страница не найдена</h1>
        <p className="mt-3 text-sm leading-6 text-white/65">
          Запрошенный маршрут отсутствует. Вернитесь на главную страницу
          конференции.
        </p>
        <Link
          href="/ekb"
          className="mt-6 inline-flex items-center justify-center rounded-full bg-violet-500 px-5 py-3 text-sm font-medium text-white transition hover:bg-violet-400"
        >
          На лендинг
        </Link>
      </div>
    </main>
  );
}
