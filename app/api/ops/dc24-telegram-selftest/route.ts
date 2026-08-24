import { NextResponse } from "next/server";

const SELF_TEST_EXPIRES_AT = Date.parse("2026-08-24T10:30:00.000Z");
const MESSAGE = [
  "<b>Digital Capital — Telegram self-test</b>",
  "Production alert channel is configured.",
  "Event: ekb-2026-09-26",
  "No personal data is included in this test.",
].join("\n");

function response(payload: Record<string, unknown>, status = 200) {
  return NextResponse.json(payload, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

export async function GET() {
  if (process.env.VERCEL_ENV !== "production") {
    return response({ ok: false, error: "production_only" }, 404);
  }

  if (Date.now() >= SELF_TEST_EXPIRES_AT) {
    return response({ ok: false, error: "self_test_expired" }, 410);
  }

  const token = process.env.TELEGRAM_BOT_TOKEN?.trim() ?? "";
  const chatId = process.env.TELEGRAM_CHAT_ID?.trim() ?? "";
  if (!token || !chatId) {
    return response({ ok: false, error: "telegram_configuration_incomplete" }, 503);
  }

  try {
    const telegramResponse = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: MESSAGE,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });

    const body = (await telegramResponse.json().catch(() => null)) as
      | { ok?: boolean; description?: string; result?: { message_id?: number; chat?: { id?: number } } }
      | null;

    if (!telegramResponse.ok || body?.ok !== true) {
      return response(
        {
          ok: false,
          error: "telegram_delivery_failed",
          status: telegramResponse.status,
          description: body?.description ?? null,
        },
        502
      );
    }

    return response({
      ok: true,
      delivered: true,
      message_id: body.result?.message_id ?? null,
      expires_at: new Date(SELF_TEST_EXPIRES_AT).toISOString(),
    });
  } catch (error) {
    return response(
      {
        ok: false,
        error: error instanceof Error ? error.message : "telegram_self_test_failed",
      },
      502
    );
  }
}
