import type { ReactNode } from 'react';
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

function SectionTitle({ eyebrow, title, text }: { eyebrow: string; title: string; text?: string }) {
  return (
    <div className="mx-auto mb-8 max-w-3xl text-center sm:mb-12">
      <div className="text-[11px] font-black uppercase tracking-[0.34em] text-gold/90">{eyebrow}</div>
      <h2 className="mt-4 text-4xl font-black leading-[.95] tracking-[-.06em] sm:text-6xl">{title}</h2>
      {text ? <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-white/58 sm:text-lg">{text}</p> : null}
    </div>
  );
}

function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`glass premium-border rounded-[30px] ${className}`}>{children}</div>;
}

export default function EventPage({ params }: { params: { slug: string } }) {
  const event = getEvent(params.slug);
  if (!event) notFound();

  return (
    <main className="min-h-screen overflow-hidden bg-night text-white">
      <div className="fixed inset-0 -z-20 bg-grid opacity-70" />
      <div className="fixed left-1/2 top-[-260px] -z-20 h-[760px] w-[760px] -translate-x-1/2 rounded-full bg-violet/35 blur-[150px]" />
      <div className="fixed right-[-240px] top-[28vh] -z-20 h-[520px] w-[520px] rounded-full bg-fuchsia-500/18 blur-[130px]" />
      <div className="fixed bottom-[-260px] left-[-200px] -z-20 h-[620px] w-[620px] rounded-full bg-blue-600/20 blur-[140px]" />

      <header className="fixed left-0 right-0 top-0 z-50 border-b border-white/10 bg-[#07051a]/72 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <a href="#top" className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-2xl bg-white text-sm font-black text-night">DC</span>
            <span className="text-xs font-black uppercase tracking-[0.28em] text-white/84">Цифровой капитал</span>
          </a>
          <nav className="hidden items-center gap-6 text-sm font-semibold text-white/62 md:flex">
            <a className="transition hover:text-white" href="#speakers">Спикеры</a>
            <a className="transition hover:text-white" href="#program">Программа</a>
            <a className="transition hover:text-white" href="#register">Регистрация</a>
          </nav>
          <a href="#register" className="hidden rounded-full bg-gold px-5 py-2.5 text-sm font-black text-night shadow-glow transition hover:scale-[1.03] sm:inline-flex">Забронировать</a>
        </div>
      </header>

      <section id="top" className="relative mx-auto grid min-h-[100svh] max-w-7xl items-center gap-8 px-4 pb-12 pt-24 sm:px-6 lg:grid-cols-[1.04fr_.96fr] lg:gap-10 lg:pb-20 lg:pt-28">
        <div className="relative z-10">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-gold/35 bg-gold/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-gold shadow-glow sm:text-sm">
            <span className="h-2 w-2 rounded-full bg-gold" />
            {event.city} • {event.date} • {event.time}
          </div>

          <h1 className="font-display text-[4.85rem] leading-[.78] tracking-[-.11em] sm:text-[8rem] lg:text-[9.7rem]">
            <span className="block">Цифровой</span>
            <span className="gold-text block pb-2">капитал</span>
          </h1>

          <p className="mt-4 max-w-2xl text-[17px] leading-8 text-white/70 sm:mt-7 sm:text-xl sm:leading-9">{event.subtitle}</p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
            <a href="#register" className="rounded-full bg-gold px-8 py-4 text-center text-base font-black text-night shadow-glow transition hover:scale-[1.02]">{event.cta}</a>
            <a href="#program" className="rounded-full border border-white/18 bg-white/6 px-8 py-4 text-center text-base font-black text-white/90 transition hover:bg-white/12">Смотреть программу</a>
          </div>

          <div className="mt-7 grid grid-cols-3 gap-2 sm:gap-3">
            {event.stats.map((item) => (
              <div key={item.label} className="rounded-[22px] border border-white/10 bg-white/[.055] p-3 backdrop-blur sm:p-4">
                <div className="text-2xl font-black text-gold sm:text-3xl">{item.value}</div>
                <div className="mt-1 text-[11px] leading-4 text-white/50 sm:text-xs">{item.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 mx-auto w-full max-w-[540px] pb-8 lg:pb-0">
          <div className="absolute left-1/2 top-1/2 -z-10 h-[470px] w-[470px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet/20 blur-[80px] sm:h-[620px] sm:w-[620px]" />
          <div className="orbit absolute left-1/2 top-1/2 -z-10 h-[310px] w-[310px] -translate-x-1/2 -translate-y-1/2 rotate-12 sm:h-[480px] sm:w-[480px]" />
          <div className="orbit absolute left-1/2 top-1/2 -z-10 h-[240px] w-[420px] -translate-x-1/2 -translate-y-1/2 -rotate-12 sm:h-[320px] sm:w-[620px]" />

          <Card className="floaty overflow-hidden p-5 sm:p-7">
            <div className="relative min-h-[470px] overflow-hidden rounded-[26px] border border-white/12 bg-[radial-gradient(circle_at_40%_15%,rgba(178,133,255,.35),transparent_34%),linear-gradient(160deg,rgba(255,255,255,.10),rgba(255,255,255,.03))] p-5 sm:min-h-[580px] sm:p-7">
              <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-gold/20 blur-[70px]" />
              <div className="absolute bottom-[-90px] left-[-70px] h-64 w-64 rounded-full bg-blue-500/20 blur-[80px]" />
              <div className="relative flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.32em] text-gold">business event</p>
                  <h2 className="mt-3 text-4xl font-black leading-[.95] tracking-[-.06em] sm:text-5xl">Конференция нового капитала</h2>
                </div>
                <div className="grid h-16 w-16 shrink-0 place-items-center rounded-3xl bg-white text-xl font-black text-night shadow-glow">13</div>
              </div>

              <div className="relative mt-9 rounded-[28px] border border-white/12 bg-[#08061c]/70 p-4 shadow-card backdrop-blur-xl">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-sm text-white/45">Город</div>
                    <div className="text-xl font-black">{event.city}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-white/45">Площадка</div>
                    <div className="text-xl font-black">{event.venue}</div>
                  </div>
                </div>
              </div>

              <div className="relative mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-[24px] border border-white/10 bg-white/[.07] p-4">
                  <div className="text-3xl font-black text-gold">ИИ</div>
                  <div className="mt-2 text-sm leading-5 text-white/58">практика для бизнеса</div>
                </div>
                <div className="rounded-[24px] border border-white/10 bg-white/[.07] p-4">
                  <div className="text-3xl font-black text-gold">$</div>
                  <div className="mt-2 text-sm leading-5 text-white/58">капитал и инвестиции</div>
                </div>
              </div>

              <div className="relative mt-5 space-y-3">
                {event.program.slice(0, 4).map((item) => (
                  <div key={`${item.time}-${item.title}`} className="flex gap-3 rounded-2xl border border-white/10 bg-white/[.055] p-3">
                    <div className="min-w-24 rounded-full bg-gold/15 px-3 py-2 text-center text-xs font-black text-gold">{item.time}</div>
                    <div className="text-sm font-bold text-white/80">{item.title}</div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
        <SectionTitle eyebrow="для кого" title="Событие для тех, кто создает рост" text="Сайт должен продавать не просто конференцию, а ощущение: здесь собираются люди, связи и возможности." />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {event.audience.map((item, index) => (
            <Card key={item.title} className="p-5 sm:p-6">
              <div className="mb-8 text-5xl font-black text-white/10">0{index + 1}</div>
              <h3 className="text-2xl font-black tracking-[-.04em]">{item.title}</h3>
              <p className="mt-3 leading-7 text-white/60">{item.text}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="grid gap-4 lg:grid-cols-[.85fr_1.15fr] lg:items-stretch">
          <Card className="flex flex-col justify-between p-7 sm:p-10">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.34em] text-gold">зачем приходить</p>
              <h2 className="mt-4 text-4xl font-black leading-[.95] tracking-[-.06em] sm:text-6xl">Не слушать. Забрать возможности.</h2>
            </div>
            <p className="mt-8 text-lg leading-8 text-white/64">Главная ценность конференции — не только выступления. Это доступ к людям, идеям, партнерствам и новым точкам роста.</p>
          </Card>
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-1">
            {event.benefits.map((item) => (
              <Card key={item.title} className="p-6">
                <h3 className="text-2xl font-black tracking-[-.04em]">{item.title}</h3>
                <p className="mt-3 leading-7 text-white/60">{item.text}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="speakers" className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
        <SectionTitle eyebrow="спикеры" title="Эксперты конференции" text="Каждый блок программы усиливает одну главную тему: капитал, технологии, окружение и практические шаги после события." />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {event.speakers.map((speaker) => (
            <Card key={speaker.name} className="group overflow-hidden p-5 transition duration-300 hover:-translate-y-1">
              <div className="mb-5 grid h-20 w-20 place-items-center rounded-[28px] bg-gradient-to-br from-gold via-violet to-blue-500 text-2xl font-black text-white shadow-glow transition group-hover:scale-105">{speaker.initials}</div>
              <h3 className="text-2xl font-black tracking-[-.04em]">{speaker.name}</h3>
              <p className="mt-2 text-sm font-bold text-gold/90">{speaker.role}</p>
              <p className="mt-4 text-sm leading-6 text-white/60">{speaker.topic}</p>
            </Card>
          ))}
        </div>
      </section>

      <section id="program" className="mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-20">
        <SectionTitle eyebrow="программа" title="Плотный день: от идей к действиям" />
        <div className="relative">
          <div className="absolute left-5 top-0 hidden h-full w-px bg-gradient-to-b from-gold via-violet to-transparent sm:block" />
          <div className="grid gap-3">
            {event.program.map((item) => (
              <div key={`${item.time}-${item.title}`} className="glass premium-border rounded-[26px] p-4 sm:ml-14 sm:grid sm:grid-cols-[150px_1fr] sm:gap-6 sm:p-5">
                <div className="mb-3 inline-flex rounded-full bg-gold/15 px-4 py-2 text-sm font-black text-gold sm:mb-0 sm:justify-center">{item.time}</div>
                <div>
                  <div className="text-xl font-black tracking-[-.03em]">{item.title}</div>
                  {item.speaker ? <div className="mt-1 text-sm font-bold text-gold/90">{item.speaker}</div> : null}
                  {item.text ? <p className="mt-2 leading-6 text-white/58">{item.text}</p> : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
        <SectionTitle eyebrow="экосистема" title="Партнеры и направления" />
        <div className="grid gap-4 md:grid-cols-3">
          {event.partners.map((partner) => (
            <Card key={partner.name} className="p-7">
              <div className="text-3xl font-black tracking-[-.05em] gold-text">{partner.name}</div>
              <p className="mt-3 leading-7 text-white/60">{partner.text}</p>
            </Card>
          ))}
        </div>
      </section>

      <section id="register" className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-24">
        <Card className="overflow-hidden p-5 sm:p-8 lg:p-10">
          <div className="grid gap-8 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.34em] text-gold">регистрация</p>
              <h2 className="mt-4 text-4xl font-black leading-[.95] tracking-[-.06em] sm:text-6xl">Забронировать участие</h2>
              <p className="mt-5 text-lg leading-8 text-white/62">Оставьте контакты — организаторы свяжутся с вами и подтвердят участие.</p>
              <div className="mt-6 rounded-[26px] border border-white/10 bg-white/[.055] p-5">
                <div className="text-sm text-white/45">Место</div>
                <div className="mt-1 text-xl font-black">{event.venue}</div>
                <div className="mt-1 text-white/58">{event.address}</div>
              </div>
            </div>

            <form action="/api/register" method="POST" className="grid gap-3 rounded-[28px] border border-white/10 bg-[#07051a]/60 p-4 sm:p-5">
              <input type="hidden" name="eventSlug" value={event.slug} />
              <input type="hidden" name="utm_source" />
              <input type="hidden" name="utm_medium" />
              <input type="hidden" name="utm_campaign" />
              <input type="hidden" name="utm_content" />
              <input type="hidden" name="utm_term" />
              <input type="hidden" name="landing_page" />
              <input className="input" name="name" placeholder="Ваше имя" required />
              <input className="input" name="phone" placeholder="Телефон" required />
              <input className="input" name="telegram" placeholder="Telegram / WhatsApp" />
              <textarea className="input min-h-28" name="comment" placeholder="Комментарий или вопрос" />
              <button className="mt-2 rounded-full bg-gold px-7 py-4 text-center text-base font-black text-night shadow-glow transition hover:scale-[1.01]" type="submit">Отправить заявку</button>
            </form>
          </div>
        </Card>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-20">
        <SectionTitle eyebrow="FAQ" title="Частые вопросы" />
        <div className="grid gap-3">
          {event.faq.map((item) => (
            <Card key={item.q} className="p-5 sm:p-6">
              <h3 className="text-xl font-black tracking-[-.03em]">{item.q}</h3>
              <p className="mt-2 leading-7 text-white/62">{item.a}</p>
            </Card>
          ))}
        </div>
      </section>

      <footer className="border-t border-white/10 px-4 pb-24 pt-10 text-center text-sm text-white/45 sm:px-6 sm:pb-10">
        <div className="mx-auto max-w-7xl">
          <div className="text-lg font-black text-white">Цифровой капитал</div>
          <div className="mt-2">Бизнес • Инвестиции • ИИ • Нетворкинг</div>
        </div>
      </footer>

      <a href="#register" className="fixed bottom-4 left-4 right-4 z-50 rounded-full bg-gold px-6 py-4 text-center text-base font-black text-night shadow-glow sm:hidden">Зарегистрироваться</a>
      <script
        dangerouslySetInnerHTML={{
          __html: `(() => { const p = new URLSearchParams(window.location.search); ['utm_source','utm_medium','utm_campaign','utm_content','utm_term'].forEach(k => { const el = document.querySelector('input[name="'+k+'"]'); if (el) el.value = p.get(k) || ''; }); const lp = document.querySelector('input[name="landing_page"]'); if (lp) lp.value = window.location.href; })();`
        }}
      />
    </main>
  );
}
