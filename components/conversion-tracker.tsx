"use client";

import { useEffect } from "react";

import { trackConversionEvent } from "@/lib/analytics-client";

const observedSections = ["program", "speakers", "register", "partners", "location"] as const;

export function ConversionTracker({ eventId }: { eventId: string }) {
  useEffect(() => {
    trackConversionEvent("page_view", eventId);

    const seen = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting || seen.has(entry.target.id)) {
            continue;
          }

          seen.add(entry.target.id);
          trackConversionEvent("section_view", eventId, { section: entry.target.id });
        }
      },
      { threshold: 0.25 }
    );

    for (const sectionId of observedSections) {
      const element = document.getElementById(sectionId);
      if (element) {
        observer.observe(element);
      }
    }

    const handleClick = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target.closest<HTMLElement>("[data-analytics-cta]") : null;
      if (!target) {
        return;
      }

      trackConversionEvent("cta_click", eventId, {
        cta: target.dataset.analyticsCta ?? "unknown",
        destination: target.getAttribute("href") ?? "",
      });
    };

    document.addEventListener("click", handleClick);

    return () => {
      observer.disconnect();
      document.removeEventListener("click", handleClick);
    };
  }, [eventId]);

  return null;
}
