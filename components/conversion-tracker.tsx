"use client";

import { useEffect } from "react";

import { trackConversionEvent } from "@/lib/analytics-client";

const observedSections = ["program", "speakers", "register", "partners", "location"] as const;
const trackedAnchors = new Set(["#register", "#program", "#partners", "#speakers", "#location"]);

function normalizeCtaLabel(value: string) {
  return value.replace(/\s+/g, " ").trim().slice(0, 100);
}

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
      const target =
        event.target instanceof Element
          ? event.target.closest<HTMLElement>("a,button,[data-analytics-cta]")
          : null;
      if (!target) {
        return;
      }

      const href = target.getAttribute("href") ?? "";
      const explicitCta = target.dataset.analyticsCta;
      const isTrackedDestination =
        trackedAnchors.has(href) || href.startsWith("mailto:") || href.startsWith("tel:");
      const isStyledCta =
        target.classList.contains("btn-primary") || target.classList.contains("btn-secondary");

      if (!explicitCta && !isTrackedDestination && !isStyledCta) {
        return;
      }

      const cta = explicitCta ?? normalizeCtaLabel(target.textContent ?? "") || "unknown";
      trackConversionEvent("cta_click", eventId, {
        cta,
        destination: href || "button",
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
