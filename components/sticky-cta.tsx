import Link from "next/link";

import { getEventLifecycleBySlug } from "@/data/event-registry";
import type { EventData } from "@/data/events";

export function StickyCTA({ eventData }: { eventData: EventData }) {
  const lifecycle = getEventLifecycleBySlug(eventData.slug);
  const registrationOpen = Boolean(lifecycle?.registrationOpen && lifecycle.status === "sales");

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-ink-950/90 px-4 py-3 backdrop-blur-2xl md:hidden">
      <Link
        href={registrationOpen ? "#register" : "#program"}
        className="btn-primary w-full justify-center"
      >
        {registrationOpen ? eventData.heroCta : "Смотреть программу"}
      </Link>
    </div>
  );
}
