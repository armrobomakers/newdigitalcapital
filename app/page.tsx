import { notFound, redirect } from "next/navigation";

import { getPrimaryConference } from "@/data/conferences";

export default function HomePage() {
  const conference = getPrimaryConference();
  if (!conference) {
    notFound();
  }

  redirect(`/${conference.lifecycle.slug}`);
}
