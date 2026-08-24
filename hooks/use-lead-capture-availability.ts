"use client";

import { useCallback, useEffect, useState } from "react";

import {
  getLeadCaptureAvailability,
  type LeadCaptureAvailability,
  type LeadType,
} from "@/data/event-registry";

const LEAD_WINDOW_REFRESH_MS = 30_000;
const REGISTRATION_READINESS_TTL_MS = 25_000;

type HealthResponse = {
  readiness?: {
    ready_for_registration?: boolean;
  };
};

type RegistrationReadinessListener = (ready: boolean | null) => void;

let cachedRegistrationReady: boolean | null = null;
let registrationReadinessCheckedAt = 0;
let registrationReadinessRequest: Promise<void> | null = null;
const registrationReadinessListeners = new Set<RegistrationReadinessListener>();

function publishRegistrationReadiness(ready: boolean) {
  cachedRegistrationReady = ready;
  registrationReadinessCheckedAt = Date.now();
  for (const listener of registrationReadinessListeners) {
    listener(ready);
  }
}

function refreshRegistrationReadiness() {
  const now = Date.now();
  if (
    cachedRegistrationReady !== null &&
    now - registrationReadinessCheckedAt < REGISTRATION_READINESS_TTL_MS
  ) {
    return Promise.resolve();
  }

  if (registrationReadinessRequest) {
    return registrationReadinessRequest;
  }

  registrationReadinessRequest = (async () => {
    try {
      const response = await fetch("/api/health", { cache: "no-store" });
      if (!response.ok) {
        publishRegistrationReadiness(false);
        return;
      }

      const payload = (await response.json()) as HealthResponse;
      publishRegistrationReadiness(payload.readiness?.ready_for_registration === true);
    } catch {
      // Fail closed: the registration API already enforces the same production
      // prerequisites, so the public UI must not advertise an unusable form.
      publishRegistrationReadiness(false);
    } finally {
      registrationReadinessRequest = null;
    }
  })();

  return registrationReadinessRequest;
}

function useAttendeeRegistrationReadiness(enabled: boolean) {
  const [ready, setReady] = useState<boolean | null>(() => cachedRegistrationReady);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const listener: RegistrationReadinessListener = (nextReady) => setReady(nextReady);
    registrationReadinessListeners.add(listener);
    void refreshRegistrationReadiness();

    const timer = window.setInterval(() => {
      void refreshRegistrationReadiness();
    }, LEAD_WINDOW_REFRESH_MS);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void refreshRegistrationReadiness();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      registrationReadinessListeners.delete(listener);
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [enabled]);

  return enabled ? ready : true;
}

function applyRegistrationReadiness(
  availability: LeadCaptureAvailability | null,
  leadType: LeadType,
  registrationReady: boolean | null
) {
  if (leadType !== "attendee" || !availability?.open || registrationReady === true) {
    return availability;
  }

  return {
    ...availability,
    open: false,
    reason: "page_not_ready" as const,
  };
}

export function useLeadCaptureAvailability(eventId: string, leadType: LeadType) {
  const [availability, setAvailability] = useState<LeadCaptureAvailability | null>(() =>
    getLeadCaptureAvailability(eventId, leadType)
  );
  const registrationReady = useAttendeeRegistrationReadiness(leadType === "attendee");

  const refresh = useCallback(() => {
    const nextAvailability = getLeadCaptureAvailability(eventId, leadType);
    setAvailability(nextAvailability);

    if (leadType === "attendee") {
      void refreshRegistrationReadiness();
    }

    return applyRegistrationReadiness(nextAvailability, leadType, registrationReady);
  }, [eventId, leadType, registrationReady]);

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

  return {
    availability: applyRegistrationReadiness(availability, leadType, registrationReady),
    refresh,
  };
}
