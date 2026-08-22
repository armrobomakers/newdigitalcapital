import { notFound, redirect } from "next/navigation";

import { listEventLifecycles } from "@/data/event-registry";

function getPrimaryEvent() {
  const events = listEventLifecycles().filter((event) => event.pageReady);
  const priority = ["sales", "scheduled", "sold_out", "past"] as const;

  for (const status of priority) {
    const matches = events
      .filter((event) => event.status === status)
      .sort((left, right) => Date.parse(right.startsAt) - Date.parse(left.startsAt));

    if (matches[0]) {
      return matches[0];
    }
  }

  return null;
}

export default function HomePage() {
  const event = getPrimaryEvent();
  if (!event) {
    notFound();
  }

  redirect(`/${event.slug}`);
}
