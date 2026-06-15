import { NextResponse } from 'next/server';
import { getEvent } from '@/data/events';

function clean(value: FormDataEntryValue | null) {
  return typeof value === 'string' ? value.trim() : '';
}

async function sendTelegram(text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
      message_thread_id: process.env.TELEGRAM_THREAD_ID || undefined
    })
  });
}

async function sendSheets(payload: Record<string, string>) {
  const url = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  if (!url) return;

  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const eventSlug = clean(formData.get('eventSlug')) || 'ekb';
  const event = getEvent(eventSlug);

  const name = clean(formData.get('name'));
  const phone = clean(formData.get('phone'));
  const telegram = clean(formData.get('telegram'));
  const comment = clean(formData.get('comment'));

  if (!name || !phone) {
    return NextResponse.json({ ok: false, error: 'Введите имя и телефон' }, { status: 400 });
  }

  const url = new URL(request.url);
  const referrer = request.headers.get('referer') || '';
  const userAgent = request.headers.get('user-agent') || '';

  const payload: Record<string, string> = {
    created_at: new Date().toISOString(),
    eventSlug,
    eventTitle: event?.title || 'Цифровой капитал',
    name,
    phone,
    telegram,
    comment,
    utm_source: clean(formData.get('utm_source')),
    utm_medium: clean(formData.get('utm_medium')),
    utm_campaign: clean(formData.get('utm_campaign')),
    utm_content: clean(formData.get('utm_content')),
    utm_term: clean(formData.get('utm_term')),
    referrer,
    landing_page: clean(formData.get('landing_page')) || `${url.origin}/${eventSlug}`,
    user_agent: userAgent
  };

  const message = [
    '🔥 <b>Новая регистрация</b>',
    `Событие: ${payload.eventTitle} / ${eventSlug}`,
    `Имя: ${name}`,
    `Телефон: ${phone}`,
    telegram ? `Telegram: ${telegram}` : '',
    comment ? `Комментарий: ${comment}` : '',
    payload.utm_source ? `Источник: ${payload.utm_source}` : '',
    payload.utm_campaign ? `Кампания: ${payload.utm_campaign}` : '',
    payload.utm_content ? `Креатив: ${payload.utm_content}` : '',
    referrer ? `Referrer: ${referrer}` : ''
  ].filter(Boolean).join('\n');

  await Promise.allSettled([sendTelegram(message), sendSheets(payload)]);

  return new Response(`<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Заявка отправлена</title><style>body{margin:0;background:#08061c;color:white;font-family:Arial,sans-serif;display:grid;place-items:center;min-height:100vh;padding:24px}.card{max-width:620px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.16);border-radius:28px;padding:34px;text-align:center}a{color:#08061c;background:#f1c268;padding:14px 22px;border-radius:999px;text-decoration:none;font-weight:800;display:inline-block;margin-top:20px}</style></head><body><div class="card"><h1>Заявка отправлена 🚀</h1><p>Организаторы свяжутся с вами и подтвердят участие.</p><a href="/${eventSlug}">Вернуться на сайт</a></div></body></html>`, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  });
}
