"use client";

import type { ReactNode } from "react";

import { useLeadCaptureAvailability } from "@/hooks/use-lead-capture-availability";

export function TemporalRegistrationGate({
  eventId,
  openContent,
  closedContent,
}: {
  eventId: string;
  openContent: ReactNode;
  closedContent: ReactNode;
}) {
  const { availability } = useLeadCaptureAvailability(eventId, "attendee");

  return availability?.open === true ? openContent : closedContent;
}
