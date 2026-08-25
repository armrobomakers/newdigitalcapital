import Link from "next/link";

import { CalendarIcon, MailIcon, PinIcon } from "@/components/icons";
import { getEventOperationalDetails } from "@/data/event-operational-details";
import type { EventData } from "@/data/events";
import { isResolvedConfigValue } from "@/lib/config-values";

export function EventTrustBar({ eventData }: { eventData: EventData }) {
  const emailReady = isResolvedConfigValue(eventData.contacts.email);
  const phoneReady = isResolvedConfigValue(eventData.contacts.phone);
  const venueReady = eventData.location.verified;
  const operationalDetails = getEventOperationalDetails(eventData.eventId);
  const hallReady = isResolvedConfigValue(operationalDetails?.hall);
  const entryInstructionsReady = isResolvedConfigValue(operationalDetails?.entryInstructions);

  if (!emailReady && !phoneReady && !venueReady) {
    return null;
  }

  return (
    <aside
      aria-label="Данные события и организационные детали"
      data-ui="event-trust-bar"
      className="section-shell pt-2 md:pt-3"
    >
      <div className="rounded-[18px] border border-white/[0.075] bg-white/[0.025] px-3 py-2.5 text-[12px] text-white/58 shadow-[inset_0_1px_0_rgba(255,255,255,0.025)] backdrop-blur-xl sm:px-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2">
            <span className="inline-flex items-center gap-2 text-white/68">
              <CalendarIcon className="h-3.5 w-3.5 text-violet-200/80" />
              <span>{eventData.dateLabel}</span>
            </span>

            {venueReady ? (
              <Link
                href="#location"
                className="inline-flex items-center gap-2 transition hover:text-white"
              >
                <PinIcon className="h-3.5 w-3.5 text-violet-200/80" />
                <span className="truncate">
                  {eventData.location.venue} · {eventData.cityLabel}
                </span>
              </Link>
            ) : null}
          </div>

          <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2 sm:justify-end">
            <span className="hidden text-[10px] font-semibold uppercase tracking-[0.16em] text-violet-200/42 lg:inline">
              контакт организатора
            </span>

            {emailReady ? (
              <a
                href={`mailto:${eventData.contacts.email}`}
                className="inline-flex min-w-0 items-center gap-2 text-white/68 transition hover:text-white"
              >
                <MailIcon className="h-3.5 w-3.5 shrink-0 text-violet-200/80" />
                <span className="truncate">{eventData.contacts.email}</span>
              </a>
            ) : null}

            {phoneReady ? (
              <a
                href={`tel:${eventData.contacts.phone.replace(/[^+\d]/g, "")}`}
                className="text-white/68 transition hover:text-white"
              >
                {eventData.contacts.phone}
              </a>
            ) : null}
          </div>
        </div>

        {venueReady && operationalDetails ? (
          <div
            data-ui="event-ops-strip"
            className="mt-2 flex flex-col gap-1 border-t border-white/[0.055] pt-2 text-[11px] leading-5 text-white/45 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-4 sm:gap-y-1"
          >
            <span>
              <span className="text-white/58">Зал:</span>{" "}
              {hallReady ? operationalDetails.hall : "будет указан дополнительно"}
            </span>
            <span>
              <span className="text-white/58">Вход:</span>{" "}
              {entryInstructionsReady
                ? operationalDetails.entryInstructions
                : "схема прохода появится ближе к событию"}
            </span>
          </div>
        ) : null}
      </div>
    </aside>
  );
}
