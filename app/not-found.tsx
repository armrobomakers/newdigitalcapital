export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-night p-6 text-center text-white">
      <div>
        <h1 className="text-5xl font-black">Страница не найдена</h1>
        <p className="mt-4 text-white/60">Проверьте ссылку или перейдите на главную страницу.</p>
        <a href="/ekb" className="mt-8 inline-block rounded-full bg-gold px-6 py-3 font-black text-night">На главную</a>
      </div>
    </main>
  );
}
