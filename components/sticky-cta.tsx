import { TemporalRegistrationLink } from "@/components/temporal-registration-link";
import type { EventData } from "@/data/events";

export function StickyCTA({ eventData }: { eventData: EventData }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-ink-950/90 px-4 py-3 backdrop-blur-2xl md:hidden">
      <TemporalRegistrationLink
        eventId={eventData.eventId}
        openLabel={eventData.heroCta}
        className="btn-primary w-full justify-center"
      />
    </div>
  );
}
