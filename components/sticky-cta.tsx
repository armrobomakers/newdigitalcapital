import Link from "next/link";

import { eventData } from "@/data/events";

export function StickyCTA() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-ink-950/90 px-4 py-3 backdrop-blur-2xl md:hidden">
      <Link href="#register" className="btn-primary w-full justify-center">
        {eventData.heroCta}
      </Link>
    </div>
  );
}
