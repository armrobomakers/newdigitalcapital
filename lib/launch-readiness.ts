import { listConferences, validateConferenceCatalog } from "@/data/conferences";
import { getEventSeoConfig } from "@/data/event-seo";
import { isValidLeadStorageSecret } from "@/lib/lead-delivery";
import { isLegalConfigReady } from "@/lib/legal";

export type LaunchBlocker = {
  code: string;
  message: string;
};

export type LaunchWarning = LaunchBlocker;

function blocker(code: string, message: string): LaunchBlocker {
  return { code, message };
}

function isBrandedSiteUrl(siteUrl: string) {
  return Boolean(
    siteUrl &&
      !siteUrl.includes("localhost") &&
      !siteUrl.includes("127.0.0.1") &&
      !siteUrl.includes("vercel.app")
  );
}

function getSalesConference() {
  return listConferences()
    .filter(
      ({ lifecycle }) =>
        lifecycle.pageReady && lifecycle.status === "sales" && lifecycle.leadCapture.attendee
    )
    .sort(
      (left, right) =>
        Date.parse(left.lifecycle.startsAt) - Date.parse(right.lifecycle.startsAt)
    )[0] ?? null;
}

export function getLaunchReadinessSnapshot() {
  const registrationBlockers: LaunchBlocker[] = [];
  const paidTrafficBlockers: LaunchBlocker[] = [];
  const warnings: LaunchWarning[] = [];
  const catalogErrors = validateConferenceCatalog();
  const salesConference = getSalesConference();

  if (catalogErrors.length > 0) {
    const item = blocker(
      "conference_catalog_invalid",
      "Lifecycle и content catalog конференций не согласованы."
    );
    registrationBlockers.push(item);
    paidTrafficBlockers.push(item);
  }

  if (!salesConference) {
    const item = blocker(
      "sales_event_missing",
      "Нет page-ready события со статусом sales и открытой регистрацией участников."
    );
    registrationBlockers.push(item);
    paidTrafficBlockers.push(item);
  }

  if (salesConference) {
    const { content, lifecycle } = salesConference;
    const seo = getEventSeoConfig(lifecycle.id);

    if (!content.location.verified) {
      const item = blocker(
        "venue_unverified",
        "Площадка активного события не подтверждена."
      );
      registrationBlockers.push(item);
      paidTrafficBlockers.push(item);
    }

    if (!content.contacts.email.trim()) {
      const item = blocker(
        "event_email_missing",
        "У активного события не указан рабочий email организатора."
      );
      registrationBlockers.push(item);
      paidTrafficBlockers.push(item);
    }

    if (!content.contacts.phone.trim()) {
      const item = blocker(
        "event_phone_missing",
        "У активного события не указан рабочий телефон организатора."
      );
      registrationBlockers.push(item);
      paidTrafficBlockers.push(item);
    }

    if (content.speakers.length === 0) {
      const item = blocker(
        "speakers_missing",
        "У активного события не опубликован ни один спикер."
      );
      registrationBlockers.push(item);
      paidTrafficBlockers.push(item);
    }

    if (content.program.length === 0) {
      const item = blocker(
        "program_missing",
        "У активного события отсутствует опубликованная программа."
      );
      registrationBlockers.push(item);
      paidTrafficBlockers.push(item);
    }

    if (!seo.structuredDataReady) {
      paidTrafficBlockers.push(
        blocker(
          "structured_data_not_ready",
          "Event JSON-LD активного события не подтвержден."
        )
      );
    }

    if (content.partners.length === 0) {
      warnings.push(
        blocker(
          "partners_empty",
          "Список партнеров активного события пуст. Это допустимо, но требует проверки перед рекламой."
        )
      );
    }

    if (content.socials.length === 0) {
      warnings.push(
        blocker(
          "social_links_empty",
          "У активного события нет подтвержденных социальных ссылок."
        )
      );
    }
  }

  if (!isLegalConfigReady()) {
    const item = blocker(
      "legal_config_incomplete",
      "Не заполнены обязательные реквизиты оператора персональных данных."
    );
    registrationBlockers.push(item);
    paidTrafficBlockers.push(item);
  }

  const leadStorageReady = Boolean(process.env.LEAD_STORAGE_WEBHOOK_URL?.trim());
  const leadStorageSecret = process.env.LEAD_STORAGE_WEBHOOK_SECRET?.trim() ?? "";

  if (!leadStorageReady) {
    const item = blocker(
      "lead_storage_unavailable",
      "Не настроено основное хранилище заявок."
    );
    registrationBlockers.push(item);
    paidTrafficBlockers.push(item);
  } else if (!isValidLeadStorageSecret(leadStorageSecret)) {
    const item = blocker(
      "lead_storage_signature_missing",
      "Основное хранилище заявок настроено без достаточно сильной обязательной подписи webhook."
    );
    registrationBlockers.push(item);
    paidTrafficBlockers.push(item);
  }

  if (!process.env.ANALYTICS_WEBHOOK_URL) {
    paidTrafficBlockers.push(
      blocker(
        "analytics_unavailable",
        "Не настроен production analytics backend для измерения рекламной воронки."
      )
    );
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() ?? "";
  if (!isBrandedSiteUrl(siteUrl)) {
    paidTrafficBlockers.push(
      blocker(
        "branded_domain_missing",
        "NEXT_PUBLIC_SITE_URL не указывает на брендовый production-домен."
      )
    );
  }

  if (process.env.NEXT_PUBLIC_INDEXING_ENABLED !== "true") {
    paidTrafficBlockers.push(
      blocker(
        "indexing_disabled",
        "Индексация production-сайта еще не включена."
      )
    );
  }

  return {
    registration_ready: registrationBlockers.length === 0,
    paid_traffic_ready: paidTrafficBlockers.length === 0,
    registration_blockers: registrationBlockers,
    paid_traffic_blockers: paidTrafficBlockers,
    warnings,
    active_sales_event: salesConference
      ? {
          id: salesConference.lifecycle.id,
          slug: salesConference.lifecycle.slug,
          starts_at: salesConference.lifecycle.startsAt,
        }
      : null,
  };
}
