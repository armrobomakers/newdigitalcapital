export const conversionEventNames = [
  "page_view",
  "section_view",
  "cta_click",
  "form_start",
  "lead_submit",
  "lead_saved",
  "form_error",
] as const;

export type ConversionEventName = (typeof conversionEventNames)[number];

export type ConversionLeadType = "attendee" | "partner" | "speaker" | "media";

export function isConversionEventName(value: unknown): value is ConversionEventName {
  return typeof value === "string" && conversionEventNames.includes(value as ConversionEventName);
}
