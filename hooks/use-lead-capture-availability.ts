"use client";

import { useCallback, useEffect, useState } from "react";

import {
  getLeadCaptureAvailability,
  type LeadCaptureAvailability,
  type LeadType,
} from "@/data/event-registry";

const LEAD_WINDOW_REFRESH_MS = 30_000;

export function useLeadCaptureAvailability(eventId: string, leadType: LeadType) {
  const [availability, setAvailability] = useState<LeadCaptureAvailability | null>(() =>
    getLeadCaptureAvailability(eventId, leadType)
  );

  const refresh = useCallback(() => {
    const nextAvailability = getLeadCaptureAvailability(eventId, leadType);
    setAvailability(nextAvailability);
    return nextAvailability;
  }, [eventId, leadType]);

  useEffect(() => {
    const timer = window.setInterval(refresh, LEAD_WINDOW_REFRESH_MS);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        refresh();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [refresh]);

  return { availability, refresh };
}
