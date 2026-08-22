# DC-03 single-event coupling report

## components/landing.tsx
```text
37:import { eventData, type AudienceItem, type ProgramItem, type Speaker } from "@/data/events";
370:        <p className="text-sm text-white/85">{eventData.location.venue}</p>
371:        <p className="mt-1 text-xs text-white/48">{eventData.location.address}</p>
387:              {eventData.registration.ticketTitle}
390:              {eventData.registration.price}
402:            {eventData.registration.benefits.map((benefit) => (
468:const footerCtaTitleParts = eventData.footer.ctaTitle.match(/^(.*конференции)\s+(«.*»)$/);
469:const lifecycle = getEventLifecycleBySlug(eventData.slug);
473:const activeSocials = eventData.socials.filter((social) => social.href && social.href !== "#");
491:              {eventData.navItems.map((item) => (
506:              {registrationOpen ? eventData.heroCta : "Смотреть программу"}
517:                {eventData.subtitle}
523:                  title={eventData.dateLabel}
524:                  copy={eventData.timeLabel}
528:                  title={eventData.cityLabel}
529:                  copy={locationVerified ? eventData.venueLabel : "архив: площадка на проверке"}
533:                  title={eventData.formatLabel}
543:                  <span>{registrationOpen ? eventData.heroCta : "Смотреть программу"}</span>
557:            {eventData.stats.map((stat, index) => (
589:          {eventData.audience.map((item) => (
615:          {eventData.speakers.map((speaker, index) => (
627:              <span>{eventData.dateLabel}, {eventData.cityLabel}</span>
646:                {eventData.program.map((item) => (
667:                    ? eventData.registration.lead
701:            {registrationOpen ? eventData.registration.note : "Продажи и прием новых заявок на это событие отключены."}
716:          {eventData.partners.map((partner) => (
735:                {eventData.partnersLead}
739:              {eventData.partnersCta}
755:          {eventData.faq.map((item, index) => (
781:                    <h3 className="font-display text-4xl text-white">{eventData.location.venue}</h3>
782:                    <p className="mt-2 text-sm text-white/60">{eventData.location.address}</p>
789:                  {eventData.location.advantages.map((item) => (
801:                <Link href={eventData.location.routeUrl} className="btn-primary mt-6 inline-flex" target="_blank" rel="noreferrer">
817:              {eventData.location.note}
839:                    {footerCtaTitleParts?.[1] ?? eventData.footer.ctaTitle}
845:                <p className="mt-3 text-sm leading-7 text-white/66">{eventData.footer.ctaCopy}</p>
853:                  {registrationOpen ? eventData.footer.ctaButton : "Смотреть программу"}
882:              <p className="mt-4 max-w-md text-sm leading-7 text-white/62">{eventData.footer.about}</p>
910:                {eventData.navItems.map((item) => (
921:              <p className="text-sm font-medium text-violet-300">{eventData.footer.participantTitle}</p>
923:                {eventData.footer.participantLinks.map((item) => (
961:            <p>{eventData.footer.copyright}</p>
964:                {eventData.footer.policy}
968:                {eventData.footer.offer}
```

## components/sticky-cta.tsx
```text
4:import { eventData } from "@/data/events";
7:  const lifecycle = getEventLifecycleBySlug(eventData.slug);
16:        {registrationOpen ? eventData.heroCta : "Смотреть программу"}
```

## app and data references
```text
app/[slug]/page.tsx:7:import { eventData } from "@/data/events";
app/[slug]/page.tsx:12:  return [{ slug: eventData.slug }];
app/[slug]/page.tsx:22:  if (slug !== eventData.slug) {
app/[slug]/page.tsx:34:  const title = `${eventData.name} — конференция о бизнесе, инвестициях и AI`;
app/[slug]/page.tsx:38:    description: eventData.subtitle,
app/[slug]/page.tsx:50:      siteName: eventData.name,
app/[slug]/page.tsx:52:      description: eventData.subtitle,
app/[slug]/page.tsx:58:          alt: eventData.name,
app/[slug]/page.tsx:72:  if (slug !== eventData.slug) {
data/events.ts:49:export const eventData = {
data/events.ts:283:export type EventData = typeof eventData;
```

## file sizes
```text
  976 components/landing.tsx
  283 data/events.ts
   87 app/[slug]/page.tsx
   20 components/sticky-cta.tsx
 1366 total
```
