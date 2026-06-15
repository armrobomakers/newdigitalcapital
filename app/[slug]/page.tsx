import { notFound } from 'next/navigation';
import { getEvent, getEventSlugs } from '@/data/events';

export function generateStaticParams() {
  return getEventSlugs().map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const event = getEvent(params.slug);
  if (!event) return {};
  return {
    title: `${event.title} — ${event.city}`,
    description: event.subtitle
  };
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`glass rounded-[28px] p-5 shadow-card ${className}`}>{children}</div>;
}

export default function EventPage({ params }: { params: { slug: string } }) {
  const event = getEvent(params.slug);
  if (!event) notFound();

  return (
    <main className="min-h-screen overflow-hidden bg-night text-white">
      <div className="fixed inset-0 -z-10 bg-grid opacity-35" />
      <div className="fixed left-1/2 top-[-180px] -z-10 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-violet/35 blur-[120px]" />
      <div className="fixed bottom-[-180px] left-[-120px] -z-10 h-[480px] w-[480px] rounded-full bg-blue-600/25 blur-[120px]" />

      <header className="sticky top-0 z-40 border-b border-white/10 bg-night/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <a href="#top" className="text-sm font-bold uppercase tracking-[0.28em] text-white/90">Цифровой капитал</a>
          <a href="#register" className="rounded-full bg-white px-4 py-2 text-sm font-bold text-night transition hover:bg-gold">Регистрация</a>
        </div>
      </header>

      <section id="top" className="relative mx-auto grid max-w-7xl gap-8 px-4 pb-16 pt-10 sm:px-6 lg:grid-cols-[1.1fr_.9fr] lg:pb-24 lg:pt-20">
        <div>
          <div className="mb-5 inline-flex rounded-full border border-gold/35 bg-gold/10 px-4 py-2 text-sm font-semibold text-gold">
            {event.city} • {event.date} • {event.time}
          </div>
          <h1 className="font-display text-6xl leading-[.9] tracking-[-.08em] sm:text-7xl lg:text-8xl">
            {event.title.split(' ')[0]}<br />{event.title.split(' ').slice(1).join(' ')}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/72 sm:text-xl">{event.subtitle}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a href="#register" className="rounded-full bg-gold px-7 py-4 text-center text-base font-black text-night shadow-glow transition hover:scale-[1.02]">{event.cta}</a>
            <a href="#program" className="rounded-full border border-white/18 px-7 py-4 text-center text-base font-bold text-white transition hover:bg-white/10">Смотреть программу</a>
          </div>
          <div className="mt-8 grid grid-cols-3 gap-3">
            {event.stats.map((item) => (
              <Card key={item.label} className="p-4">
                <div className="text-2xl font-black text-gold">{item.value}</div>
                <div className="mt-1 text-xs text-white/58">{item.label}</div>
              </Card>
            ))}
          </div>
        </div>

        <Card className="relative overflow-hidden p-6 lg:p-8">
          <div className="absolute right-[-80px] top-[-80px] h-56 w-56 rounded-full bg-violet/50 blur-[80px]" />
          <div className="relative">
            <p className="text-sm uppercase tracking-[0.35em] text-gold">место проведения</p>
            <h2 className="mt-4 text-4xl font-black tracking-[-.04em]">{event.venue}</h2>
            <p className="mt-3 text-white/70">{event.address}</p>
            <div className="mt-8 rounded-[26px] border border-white/12 bg-white/8 p-5">
              <p className="text-sm font-bold text-white/60">Для кого</p>
              <div className="mt-4 grid gap-3">
                {event.audience.map((item) => (
                  <div key={item.title} className="rounded-2xl bg-white/8 p-4">
                    <div className="font-bold">{item.title}</div>
                    <div className="mt-1 text-sm leading-6 text-white/58">{item.text}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="mb-8 max-w-2xl">
          <p className="text-sm uppercase tracking-[0.35em] text-gold">ценность события</p>
          <h2 className="mt-3 text-4xl font-black tracking-[-.05em] sm:text-5xl">Почему стоит прийти</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {event.benefits.map((item) => (
            <Card key={item.title}>
              <h3 className="text-xl font-black">{item.title}</h3>
              <p className="mt-3 leading-7 text-white/65">{item.text}</p>
            </Card>
          ))}
        </div>
      </section>

      <section id="speakers" className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="mb-8 max-w-2xl">
          <p className="text-sm uppercase tracking-[0.35em] text-gold">спикеры</p>
          <h2 className="mt-3 text-4xl font-black tracking-[-.05em] sm:text-5xl">Эксперты конференции</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {event.speakers.map((speaker) => (
            <Card key={speaker.name}>
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet to-gold text-xl font-black text-white shadow-glow">{speaker.initials}</div>
              <h3 className="text-2xl font-black">{speaker.name}</h3>
              <p className="mt-1 text-sm text-gold">{speaker.role}</p>
              <p className="mt-4 leading-7 text-white/65">{speaker.topic}</p>
            </Card>
          ))}
        </div>
      </section>

      <section id="program" className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <div className="mb-8 text-center">
          <p className="text-sm uppercase tracking-[0.35em] text-gold">расписание</p>
          <h2 className="mt-3 text-4xl font-black tracking-[-.05em] sm:text-5xl">Программа</h2>
        </div>
        <div className="grid gap-3">
          {event.program.map((item) => (
            <div key={`${item.time}-${item.title}`} className="glass rounded-[24px] p-4 sm:flex sm:items-start sm:gap-6">
              <div className="mb-2 rounded-full bg-gold/15 px-4 py-2 text-sm font-black text-gold sm:mb-0 sm:min-w-32 sm:text-center">{item.time}</div>
              <div>
                <div className="text-lg font-black">{item.title}</div>
                {item.speaker && <div className="mt-1 text-sm text-gold">{item.speaker}</div>}
                {item.text && <p className="mt-2 leading-6 text-white/60">{item.text}</p>}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="mb-8 max-w-2xl">
          <p className="text-sm uppercase tracking-[0.35em] text-gold">партнеры</p>
          <h2 className="mt-3 text-4xl font-black tracking-[-.05em] sm:text-5xl">Партнерская экосистема</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {event.partners.map((partner) => (
            <Card key={partner.name}>
              <div className="text-2xl font-black">{partner.name}</div>
              <p className="mt-2 text-white/60">{partner.text}</p>
            </Card>
          ))}
        </div>
      </section>

      <section id="register" className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <Card className="p-5 sm:p-8">
          <div className="mb-6 text-center">
            <p className="text-sm uppercase tracking-[0.35em] text-gold">регистрация</p>
            <h2 className="mt-3 text-4xl font-black tracking-[-.05em]">Забронировать участие</h2>
            <p className="mt-3 text-white/62">Оставьте контакты — организаторы свяжутся с вами и подтвердят участие.</p>
          </div>
          <form action="/api/register" method="POST" className="grid gap-3">
            <input type="hidden" name="eventSlug" value={event.slug} />
            <input className="input" name="name" placeholder="Ваше имя" required />
            <input className="input" name="phone" placeholder="Телефон" required />
            <input className="input" name="telegram" placeholder="Telegram / WhatsApp" />
            <textarea className="input min-h-28" name="comment" placeholder="Комментарий или вопрос" />
            <button className="mt-2 rounded-full bg-gold px-7 py-4 text-center text-base font-black text-night shadow-glow transition hover:scale-[1.01]" type="submit">Отправить заявку</button>
          </form>
        </Card>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <div className="mb-8 text-center">
          <p className="text-sm uppercase tracking-[0.35em] text-gold">FAQ</p>
          <h2 className="mt-3 text-4xl font-black tracking-[-.05em]">Вопросы</h2>
        </div>
        <div className="grid gap-3">
          {event.faq.map((item) => (
            <Card key={item.q}>
              <h3 className="text-lg font-black">{item.q}</h3>
              <p className="mt-2 leading-7 text-white/62">{item.a}</p>
            </Card>
          ))}
        </div>
      </section>

      <footer className="border-t border-white/10 px-4 py-10 text-center text-sm text-white/45 sm:px-6">
        © Цифровой капитал. Бизнес • Инвестиции • ИИ • Нетворкинг
      </footer>

      <a href="#register" className="fixed bottom-4 left-4 right-4 z-50 rounded-full bg-gold px-6 py-4 text-center text-base font-black text-night shadow-glow sm:hidden">Зарегистрироваться</a>
    </main>
  );
}
