import { notFound, redirect } from "next/navigation";

import { assertConferenceCatalog, listPageReadyConferences } from "@/data/conferences";

function getPrimaryConference() {
  const conferences = listPageReadyConferences();
  const priority = ["sales", "scheduled", "sold_out", "past"] as const;

  for (const status of priority) {
    const matches = conferences
      .filter((conference) => conference.lifecycle.status === status)
      .sort(
        (left, right) =>
          Date.parse(right.lifecycle.startsAt) - Date.parse(left.lifecycle.startsAt)
      );

    if (matches[0]) {
      return matches[0];
    }
  }

  return null;
}

export default function HomePage() {
  assertConferenceCatalog();
  const conference = getPrimaryConference();
  if (!conference) {
    notFound();
  }

  redirect(`/${conference.lifecycle.slug}`);
}
