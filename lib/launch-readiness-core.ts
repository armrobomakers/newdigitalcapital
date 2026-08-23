export type LaunchBlocker = {
  code: string;
  message: string;
};

export type LaunchWarning = LaunchBlocker;

export type AttendeeCaptureReason =
  | "open"
  | "page_not_ready"
  | "lead_type_disabled"
  | "status_closed"
  | "invalid_event_time"
  | "event_started"
  | "invalid_window"
  | "window_not_open"
  | "window_closed";

export type AttendeeCaptureSnapshot = {
  open: boolean;
  reason: AttendeeCaptureReason;
  eventStartsAt: string;
  opensAt: string | null;
  closesAt: string;
};

export type SalesEventReadinessInput = {
  id: string;
  slug: string;
  startsAt: string;
  attendeeCapture: AttendeeCaptureSnapshot | null;
  locationVerified: boolean;
  emailPresent: boolean;
  phonePresent: boolean;
  speakersCount: number;
  programCount: number;
  structuredDataReady: boolean;
  partnersCount: number;
  socialsCount: number;
};

export type LaunchReadinessInput = {
  catalogErrors: string[];
  salesEvent: SalesEventReadinessInput | null;
  legalReady: boolean;
  leadStorageReady: boolean;
  leadStorageSecretReady: boolean;
  analyticsReady: boolean;
  brandedSiteUrlReady: boolean;
  indexingEnabled: boolean;
};

function blocker(code: string, message: string): LaunchBlocker {
  return { code, message };
}

function temporalRegistrationBlocker(
  availability: AttendeeCaptureSnapshot | null
): LaunchBlocker | null {
  if (!availability || availability.open) {
    return null;
  }

  switch (availability.reason) {
    case "window_not_open":
      return blocker(
        "registration_window_not_open",
        "Окно регистрации активного sales-события еще не открыто."
      );
    case "window_closed":
      return blocker(
        "registration_window_closed",
        "Окно регистрации активного sales-события уже закрыто."
      );
    case "event_started":
      return blocker(
        "sales_event_started",
        "Активное sales-событие уже началось; прием новых заявок автоматически закрыт."
      );
    case "invalid_event_time":
    case "invalid_window":
      return blocker(
        "registration_window_invalid",
        "Временная конфигурация регистрации активного sales-события невалидна."
      );
    case "page_not_ready":
    case "lead_type_disabled":
    case "status_closed":
      return blocker(
        "registration_configuration_closed",
        "Конфигурация активного sales-события не разрешает регистрацию участников."
      );
    case "open":
    default:
      return null;
  }
}

export function evaluateLaunchReadiness(input: LaunchReadinessInput) {
  const registrationBlockers: LaunchBlocker[] = [];
  const paidTrafficBlockers: LaunchBlocker[] = [];
  const warnings: LaunchWarning[] = [];
  const salesEvent = input.salesEvent;

  if (input.catalogErrors.length > 0) {
    const item = blocker(
      "conference_catalog_invalid",
      "Lifecycle и content catalog конференций не согласованы."
    );
    registrationBlockers.push(item);
    paidTrafficBlockers.push(item);
  }

  if (!salesEvent) {
    const item = blocker(
      "sales_event_missing",
      "Нет page-ready события со статусом sales и включенным attendee lead capture."
    );
    registrationBlockers.push(item);
    paidTrafficBlockers.push(item);
  }

  if (salesEvent) {
    const temporalBlocker = temporalRegistrationBlocker(salesEvent.attendeeCapture);

    if (temporalBlocker) {
      registrationBlockers.push(temporalBlocker);
      paidTrafficBlockers.push(temporalBlocker);
    }

    if (!salesEvent.locationVerified) {
      const item = blocker(
        "venue_unverified",
        "Площадка активного события не подтверждена."
      );
      registrationBlockers.push(item);
      paidTrafficBlockers.push(item);
    }

    if (!salesEvent.emailPresent) {
      const item = blocker(
        "event_email_missing",
        "У активного события не указан рабочий email организатора."
      );
      registrationBlockers.push(item);
      paidTrafficBlockers.push(item);
    }

    if (!salesEvent.phonePresent) {
      const item = blocker(
        "event_phone_missing",
        "У активного события не указан рабочий телефон организатора."
      );
      registrationBlockers.push(item);
      paidTrafficBlockers.push(item);
    }

    if (salesEvent.speakersCount === 0) {
      const item = blocker(
        "speakers_missing",
        "У активного события не опубликован ни один спикер."
      );
      registrationBlockers.push(item);
      paidTrafficBlockers.push(item);
    }

    if (salesEvent.programCount === 0) {
      const item = blocker(
        "program_missing",
        "У активного события отсутствует опубликованная программа."
      );
      registrationBlockers.push(item);
      paidTrafficBlockers.push(item);
    }

    if (!salesEvent.structuredDataReady) {
      paidTrafficBlockers.push(
        blocker(
          "structured_data_not_ready",
          "Event JSON-LD активного события не подтвержден."
        )
      );
    }

    if (salesEvent.partnersCount === 0) {
      warnings.push(
        blocker(
          "partners_empty",
          "Список партнеров активного события пуст. Это допустимо, но требует проверки перед рекламой."
        )
      );
    }

    if (salesEvent.socialsCount === 0) {
      warnings.push(
        blocker(
          "social_links_empty",
          "У активного события нет подтвержденных социальных ссылок."
        )
      );
    }
  }

  if (!input.legalReady) {
    const item = blocker(
      "legal_config_incomplete",
      "Не заполнены обязательные реквизиты оператора персональных данных."
    );
    registrationBlockers.push(item);
    paidTrafficBlockers.push(item);
  }

  if (!input.leadStorageReady) {
    const item = blocker(
      "lead_storage_unavailable",
      "Не настроено основное хранилище заявок."
    );
    registrationBlockers.push(item);
    paidTrafficBlockers.push(item);
  } else if (!input.leadStorageSecretReady) {
    const item = blocker(
      "lead_storage_signature_missing",
      "Основное хранилище заявок настроено без достаточно сильной обязательной подписи webhook."
    );
    registrationBlockers.push(item);
    paidTrafficBlockers.push(item);
  }

  if (!input.analyticsReady) {
    paidTrafficBlockers.push(
      blocker(
        "analytics_unavailable",
        "Не настроен production analytics backend для измерения рекламной воронки."
      )
    );
  }

  if (!input.brandedSiteUrlReady) {
    paidTrafficBlockers.push(
      blocker(
        "branded_domain_missing",
        "NEXT_PUBLIC_SITE_URL не указывает на брендовый production-домен."
      )
    );
  }

  if (!input.indexingEnabled) {
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
    active_sales_event: salesEvent
      ? {
          id: salesEvent.id,
          slug: salesEvent.slug,
          starts_at: salesEvent.startsAt,
          attendee_capture: salesEvent.attendeeCapture,
        }
      : null,
  };
}
