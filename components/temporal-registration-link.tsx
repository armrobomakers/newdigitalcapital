"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

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
  const searchParams = useSearchParams();
  const { availability } = useLeadCaptureAvailability(eventId, "attendee");
  const salesPreview = searchParams.get("preview") === "sales";
  const open = salesPreview || availability?.open === true;

  return (
    <Link
      href={open ? "#register" : "#program"}
      className={className}
      data-registration-state={open ? "open" : "closed"}
      data-registration-preview={salesPreview ? "sales" : undefined}
    >
      <span>{open ? openLabel : closedLabel}</span>
      {withArrow ? <ArrowRightIcon className="h-5 w-5" /> : null}
    </Link>
  );
}
