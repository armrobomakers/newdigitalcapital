"use client";

import Link from "next/link";

import { ArrowRightIcon } from "@/components/icons";
import { useLeadCaptureAvailability } from "@/hooks/use-lead-capture-availability";

type TemporalRegistrationLinkProps = {
  eventId: string;
  openLabel: string;
  closedLabel?: string;
  className?: string;
  withArrow?: boolean;
};

export function TemporalRegistrationLink({
  eventId,
  openLabel,
  closedLabel = "Смотреть программу",
  className,
  withArrow = false,
}: TemporalRegistrationLinkProps) {
  const { availability } = useLeadCaptureAvailability(eventId, "attendee");
  const open = availability?.open === true;

  return (
    <Link
      href={open ? "#register" : "#program"}
      className={className}
      data-registration-state={open ? "open" : "closed"}
    >
      <span>{open ? openLabel : closedLabel}</span>
      {withArrow ? <ArrowRightIcon className="h-5 w-5" /> : null}
    </Link>
  );
}
