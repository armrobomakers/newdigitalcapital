import { Suspense, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";

import {
  AiIcon,
  ArrowRightIcon,
  ArrowUpRightIcon,
  BusinessIcon,
  BrandMarkIcon,
  CalendarIcon,
  CheckIcon,
  CrownIcon,
  InvestIcon,
  HandshakeIcon,
  CloudIcon,
  HexNetworkIcon,
  LinkedInIcon,
  MailIcon,
  MicrophoneIcon,
  NetworkIcon,
  PinIcon,
  PieChartIcon,
  PhoneIcon,
  PlaneIcon,
  ShieldIcon,
  SparkIcon,
  StarIcon,
  TelegramIcon,
  TicketIcon,
  UsersIcon,
  VkIcon,
  YouTubeIcon,
} from "@/components/icons";
import { RegistrationForm } from "@/components/registration-form";
import { StickyCTA } from "@/components/sticky-cta";
import { eventData, type AudienceItem, type ProgramItem, type Speaker } from "@/data/events";

function SectionTitle({
  kicker,
  title,
  description,
  center = false,
  maxWidthClass,
  titleClassName,
}: {
  kicker?: string;
  title: string;
  description?: string;
  center?: boolean;
  maxWidthClass?: string;
  titleClassName?: string;
}) {
  const titleClass = kicker
    ? "section-title"
    : "mt-0 max-w-5xl font-display text-4xl leading-[0.92] text-white sm:text-6xl lg:text-[5.5rem]";
  const wrapperClass = center
    ? `mx-auto w-full ${maxWidthClass ?? "max-w-[1200px]"} text-center`
    : maxWidthClass ?? "max-w-4xl";

  return (
    <div className={wrapperClass}>
      {kicker ? <p className="section-kicker">{kicker}</p> : null}
      <h2 className={`${center && kicker ? "section-title-center" : titleClass} ${titleClassName ?? ""}`.trim()}>
        {title}
      </h2>
      {description ? (
        <p className={center ? "section-copy mx-auto mt-4 max-w-4xl text-center" : "section-copy mt-4"}>
          {description}
        </p>
      ) : null}
    </div>
  );
}

function AudienceIcon({
  icon,
  className = "h-5 w-5 text-violet-200",
}: {
  icon: AudienceItem["icon"];
  className?: string;
}) {
  switch (icon) {
    case "founder":
      return <BusinessIcon className={className} />;
    case "investor":
      return <InvestIcon className={className} />;
    case "leader":
      return <UsersIcon className={className} />;
    case "specialist":
      return <AiIcon className={className} />;
    case "partner":
      return <NetworkIcon className={className} />;
    default:
      return <SparkIcon className={className} />;
  }
}

function HeroStatIcon({ index }: { index: number }) {
  const className = "h-12 w-12 text-violet-300 sm:h-14 sm:w-14";

  switch (index) {
    case 0:
      return <UsersIcon className={className} />;
    case 1:
      return <MicrophoneIcon className={className} />;
    case 2:
      return <PieChartIcon className={className} />;
    default:
      return <HandshakeIcon className={className} />;
  }
}

function HeroMetaCard({
  icon,
  title,
  copy,
}: {
  icon: ReactNode;
  title: string;
  copy: string;
}) {
  return (
    <div className="flex min-h-[88px] items-start gap-2 rounded-[22px] border border-white/10 bg-black/22 px-4 py-3.5 backdrop-blur-xl">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-violet-400/30 bg-[radial-gradient(circle_at_35%_30%,rgba(124,60,255,0.34),rgba(8,7,22,0.96))] text-violet-100">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[16px] font-medium leading-tight text-white sm:text-[17px]">{title}</p>
        <p className="mt-1 text-[12px] leading-5 text-white/64 sm:text-[13px] lg:text-[11px] lg:leading-4">
          {copy}
        </p>
      </div>
    </div>
  );
}

function ProgramIcon({ icon }: { icon?: ProgramItem["icon"] }) {
  const className = "h-4 w-4 text-violet-100";

  switch (icon) {
    case "business":
      return <BusinessIcon className={className} />;
    case "invest":
      return <InvestIcon className={className} />;
    case "network":
      return <NetworkIcon className={className} />;
    case "ticket":
      return <TicketIcon className={className} />;
    case "calendar":
      return <CalendarIcon className={className} />;
    case "spark":
    default:
      return <SparkIcon className={className} />;
  }
}

function HeroVisual() {
  return (
    <div className="relative min-h-[480px] overflow-hidden rounded-[38px] bg-[#050411] lg:min-h-[460px]">
      <Image
        src="/hero-stage-3.png"
        alt=""
        fill
        priority
        className="object-cover object-center"
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(124,60,255,0.12),transparent_24%),radial-gradient(circle_at_82%_18%,rgba(178,133,255,0.08),transparent_22%),linear-gradient(90deg,rgba(4,3,13,0.28)_0%,rgba(4,3,13,0.18)_42%,rgba(4,3,13,0.08)_68%,rgba(4,3,13,0.18)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,3,13,0.02)_0%,rgba(4,3,13,0.05)_35%,rgba(4,3,13,0.2)_100%)]" />
    </div>
  );
}

function SpeakerCard({ speaker, index }: { speaker: Speaker; index: number }) {
  const speakerImageSrc = `/speaker-${index + 1}-face.png`;

  return (
    <article className="group flex h-full min-h-[520px] flex-col overflow-hidden rounded-[30px] border border-white/10 bg-white/[0.045] shadow-soft backdrop-blur-2xl transition duration-300 hover:-translate-y-1 hover:border-violet-300/30 hover:bg-white/[0.06]">
      <div className="relative px-3 pb-1.5 pt-3.5 lg:px-4">
        <div className="absolute inset-x-0 top-0 h-20 bg-[radial-gradient(circle_at_50%_0%,rgba(124,60,255,0.26),transparent_60%)]" />
        <div className="relative mx-auto aspect-square w-full max-w-[258px] overflow-hidden rounded-[26px] border border-white/12 bg-[radial-gradient(circle_at_32%_28%,rgba(255,255,255,0.16),rgba(124,60,255,0.24)_45%,rgba(8,7,22,0.98))] p-2 shadow-[0_0_0_1px_rgba(124,60,255,0.06),0_0_42px_rgba(124,60,255,0.14)] lg:max-w-[270px]">
          <Image
            src={speakerImageSrc}
            alt={speaker.name}
            fill
            unoptimized
            className="object-cover"
          />
        </div>
      </div>

      <div className="flex flex-1 flex-col px-5 pb-5 text-center lg:px-6">
        <h3 className="mt-1.5 text-[1.62rem] font-semibold leading-[1.1] text-white lg:text-[1.72rem]">
          {speaker.name}
        </h3>
        <p className="mt-1.5 text-[12px] font-medium leading-5 text-violet-200/90 lg:text-[13px]">
          {speaker.company}
        </p>
        <div className="mx-auto mt-2.5 h-px w-10 bg-violet-400/80" />
        <p className="mt-3 px-1 text-[13px] leading-6 text-white/68 lg:text-[14px] lg:leading-6">
          {speaker.topic}
        </p>
        <div className="mt-auto pt-4">
          <Link
            href="#register"
            className="inline-flex min-w-[136px] items-center justify-center gap-2 rounded-full border border-violet-400/35 bg-black/15 px-5 py-2.5 text-sm font-semibold text-white/90 transition group-hover:border-violet-300/40 group-hover:bg-violet-500/20"
          >
            Подробнее
            <ArrowUpRightIcon className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}

function ProgramRow({
  item,
  accent,
}: {
  item: ProgramItem;
  accent?: "featured" | "final";
}) {
  const isFeatured = accent === "featured";
  const isFinal = accent === "final";

  return (
    <li
      className={`relative overflow-hidden rounded-[22px] border px-4 py-4 transition ${
        isFinal
          ? "border-violet-400/50 bg-[linear-gradient(180deg,rgba(124,60,255,0.24),rgba(255,255,255,0.05))] shadow-[0_0_0_1px_rgba(124,60,255,0.14)] lg:pr-16"
          : isFeatured
            ? "border-violet-300/35 bg-white/[0.055] shadow-[0_0_34px_rgba(124,60,255,0.16)] lg:pr-16"
            : "border-white/10 bg-white/[0.04] hover:border-violet-300/25 hover:bg-white/[0.06]"
      }`}
    >
      <div className="grid gap-3 lg:grid-cols-[96px_18px_1fr] lg:items-start">
        <div
          className={`text-[2.3rem] font-medium leading-none ${
            isFinal ? "text-white" : "text-violet-300"
          } lg:justify-self-start lg:pt-0.5`}
        >
          {item.time}
        </div>
        <div className="relative hidden items-center justify-center lg:flex">
          <span
            className={`h-3 w-3 rounded-full border ${
              isFinal
                ? "border-white/25 bg-white shadow-[0_0_0_6px_rgba(124,60,255,0.16)]"
                : "border-white/20 bg-violet-200 shadow-[0_0_0_6px_rgba(124,60,255,0.12)]"
            }`}
          />
        </div>
        <div className="flex items-start gap-3">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border bg-[linear-gradient(180deg,rgba(124,60,255,0.24),rgba(255,255,255,0.03))] ${
              isFinal ? "border-violet-300/45" : isFeatured ? "border-violet-300/35" : "border-white/10"
            }`}
          >
            <ProgramIcon icon={item.icon} />
          </div>
          <div className="min-w-0">
            <p
              className={`text-lg font-semibold text-white ${
                isFinal ? "lg:text-[1.25rem]" : isFeatured ? "lg:text-[1.2rem]" : ""
              }`}
            >
              {item.title}
            </p>
            <p className="mt-1 text-sm text-white/58">{item.speaker}</p>
            {item.note ? (
              <p className={`mt-2 text-sm leading-6 ${isFinal ? "text-white/78" : "text-white/72"}`}>
                {item.note}
              </p>
            ) : null}
          </div>
        </div>
        {isFeatured ? (
          <div className="absolute right-4 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-[18px] border border-violet-300/25 bg-black/20 text-violet-200 lg:flex">
            <StarIcon className="h-5 w-5" />
          </div>
        ) : null}
        {isFinal ? (
          <div className="absolute right-4 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-[18px] border border-amber-300/30 bg-black/20 text-amber-300 lg:flex">
            <CrownIcon className="h-5 w-5" />
          </div>
        ) : null}
      </div>
    </li>
  );
}

function PartnerBadge({ name }: { name: string }) {
  if (name === "SoulMate") {
    return <span className="text-[82px] font-semibold leading-none text-white/90">S</span>;
  }

  if (name === "AI Robo Makers") {
    return <span className="text-[56px] font-light leading-none text-white/90">Ai</span>;
  }

  if (name === "Digital Capital") {
    return (
      <div className="flex items-end gap-1">
        <span className="h-5 w-3 rounded-sm bg-white/90" />
        <span className="h-10 w-3 rounded-sm bg-white/90" />
        <span className="h-14 w-3 rounded-sm bg-white/90" />
        <span className="h-20 w-3 rounded-sm bg-white/90" />
      </div>
    );
  }

  if (name === "Tech Club") {
    return <HexNetworkIcon className="h-[4.5rem] w-[4.5rem] text-white/90" />;
  }

  if (name === "Future Bank") {
    return <ShieldIcon className="h-[4.5rem] w-[4.5rem] text-white/90" />;
  }

  return <CloudIcon className="h-[4.5rem] w-[4.5rem] text-white/90" />;
}

function FAQItem({ item, index }: { item: { question: string; answer: string }; index: number }) {
  return (
    <details
      open={index === 0}
      className="group rounded-[26px] border border-white/10 bg-white/[0.045] p-4 shadow-soft backdrop-blur-2xl"
    >
      <summary className="flex cursor-pointer list-none items-center gap-4 marker:hidden">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-black/20 text-sm font-semibold text-white/72">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="min-w-0 flex-1 text-left text-lg font-medium text-white">
          {item.question}
        </span>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-black/20 text-lg text-white/70">
          <span className="group-open:hidden">+</span>
          <span className="hidden group-open:inline">-</span>
        </span>
      </summary>
      <p className="mt-4 ml-14 text-sm leading-7 text-white/65">{item.answer}</p>
    </details>
  );
}

function MapCardExact() {
  return (
    <div className="relative min-h-[360px] overflow-hidden rounded-[32px] border border-white/10 bg-[#07061a] shadow-soft">
      <Image src="/location-map.png" alt="" fill className="object-cover object-center" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,3,13,0.08)_0%,rgba(4,3,13,0.06)_22%,rgba(4,3,13,0.15)_58%,rgba(4,3,13,0.42)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#050411] to-transparent" />
      <div className="absolute left-5 bottom-5 rounded-[22px] border border-white/10 bg-black/40 px-4 py-3 backdrop-blur-xl">
        <p className="text-sm text-white/85">{eventData.location.venue}</p>
        <p className="mt-1 text-xs text-white/48">{eventData.location.address}</p>
      </div>
    </div>
  );
}

function RegistrationTicket() {
  return (
    <div className="relative min-h-[520px] overflow-hidden rounded-[32px] border border-violet-400/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.09),rgba(255,255,255,0.035))] p-6 shadow-[0_0_48px_rgba(124,60,255,0.16)]">
      <span className="pointer-events-none absolute left-0 top-1/2 h-16 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border border-violet-400/60 bg-[#050411]" />
      <span className="pointer-events-none absolute right-0 top-1/2 h-16 w-8 translate-x-1/2 -translate-y-1/2 rounded-full border border-violet-400/60 bg-[#050411]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_18%,rgba(124,60,255,0.34),transparent_32%),radial-gradient(circle_at_76%_28%,rgba(241,194,104,0.16),transparent_26%)]" />
      <div className="relative flex h-full flex-col">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="mt-4 font-display text-3xl leading-tight text-white">
              {eventData.registration.ticketTitle}
            </h3>
            <p className="mt-4 font-display text-7xl leading-none text-white">
              {eventData.registration.price}
            </p>
          </div>
          <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-full border border-violet-400/50 bg-[radial-gradient(circle_at_35%_30%,rgba(255,255,255,0.2),rgba(124,60,255,0.52)_48%,rgba(10,8,24,0.98))] text-5xl font-semibold text-white shadow-[0_0_0_10px_rgba(124,60,255,0.08)]">
            %
          </div>
        </div>

        <div className="mt-7 h-px bg-white/10" />

        <div className="mt-6 grid flex-1 gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
          <ul className="space-y-4">
            {eventData.registration.benefits.map((benefit) => (
              <li key={benefit} className="flex items-center gap-3 text-[18px] text-white/90">
                <CheckIcon className="h-5 w-5 shrink-0 text-violet-100" />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>

          <div className="mx-auto flex w-32 justify-center rounded-[22px] border border-violet-400/70 bg-black/18 p-3">
            <div className="grid h-28 w-28 grid-cols-5 gap-1 rounded-[18px] border border-dashed border-white/25 p-2">
              {Array.from({ length: 25 }).map((_, index) => (
                <span
                  key={index}
                  className={`rounded-[2px] ${
                    index % 5 === 0 || index % 5 === 4 || index < 5 || index > 19
                      ? "bg-white/70"
                      : index % 2 === 0
                        ? "bg-white/32"
                        : "bg-white/18"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        <p className="mt-6 text-right text-[11px] uppercase tracking-[0.22em] text-white/45">
          места ограничены
        </p>
      </div>
    </div>
  );
}

function PartnerVisualExact() {
  return (
    <div
      className="relative min-h-[260px] overflow-hidden rounded-[32px] border border-white/10 bg-[#07061a] bg-cover bg-center shadow-soft"
      style={{ backgroundImage: "url('/partner-handshake.png')" }}
    >
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(4,3,13,0.14)_0%,rgba(4,3,13,0.04)_40%,rgba(4,3,13,0.18)_100%)]" />
    </div>
  );
}

const footerCtaTitleParts = eventData.footer.ctaTitle.match(/^(.*конференции)\s+(«.*»)$/);

export function LandingPage() {
  return (
    <main className="relative pb-24 md:pb-0">
      <StickyCTA />

      <section className="section-shell pt-1 md:pt-3">
        <div className="relative p-0 md:pt-1">
          <header className="flex items-center justify-between gap-4">
            <Link href="#top" className="inline-flex items-center gap-3">
              <div>
                <span className="block font-display text-[22px] leading-none text-white">Цифровой</span>
                <span className="block font-display text-[22px] leading-none text-white">капитал</span>
              </div>
            </Link>

            <nav className="hidden items-center gap-1 lg:flex">
              {eventData.navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-full px-4 py-2 text-sm text-white/72 transition hover:bg-white/[0.06] hover:text-white"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <Link href="#register" className="btn-primary hidden md:inline-flex">
              {eventData.heroCta}
            </Link>
          </header>

          <div id="top" className="mt-5 grid gap-5 lg:mt-6 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
            <div className="max-w-3xl">
              <h1 className="mt-0 max-w-2xl font-display text-5xl leading-[0.88] text-white sm:text-7xl lg:text-[6.65rem] lg:leading-[0.8]">
                <span className="block">Цифровой</span>
                <span className="block">капитал</span>
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-white/68 sm:text-lg">
                {eventData.subtitle}
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <HeroMetaCard
                  icon={<CalendarIcon className="h-5 w-5" />}
                  title={eventData.dateLabel}
                  copy={eventData.timeLabel}
                />
                <HeroMetaCard
                  icon={<PinIcon className="h-5 w-5" />}
                  title={eventData.cityLabel}
                  copy={eventData.venueLabel}
                />
                <HeroMetaCard
                  icon={<UsersIcon className="h-5 w-5" />}
                  title={eventData.formatLabel}
                  copy="для предпринимателей и инвесторов"
                />
              </div>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <Link href="#register" className="btn-primary min-w-[270px] justify-between">
                  <span>{eventData.heroCta}</span>
                  <ArrowRightIcon className="h-5 w-5" />
                </Link>
                <Link href="#program" className="btn-secondary min-w-[270px] justify-between">
                  <span>{eventData.programCta}</span>
                  <CalendarIcon className="h-5 w-5 text-violet-200" />
                </Link>
              </div>
            </div>

            <HeroVisual />
          </div>

          <div className="mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {eventData.stats.map((stat, index) => (
              <div
                key={stat.label}
                className="min-h-[156px] rounded-[26px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.035),rgba(255,255,255,0.02))] p-5 shadow-soft"
              >
                <div className="flex h-full items-start justify-between gap-4">
                  <div>
                    <p className="font-display text-4xl leading-none text-violet-200 sm:text-5xl">
                      {stat.value}
                    </p>
                    <p className="mt-2 max-w-40 text-sm leading-6 text-white/58">{stat.label}</p>
                  </div>
                  <div className="flex h-24 w-24 shrink-0 items-center justify-center sm:h-28 sm:w-28">
                    <HeroStatIcon index={index} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="audience" className="section-shell relative overflow-hidden py-10 md:py-14">
        <div className="pointer-events-none absolute left-[-120px] top-[-60px] h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle_at_35%_35%,rgba(124,60,255,0.22),transparent_28%),radial-gradient(circle_at_65%_65%,rgba(124,60,255,0.15),transparent_35%)] blur-2xl" />
        <div className="pointer-events-none absolute right-[-120px] top-[80px] h-[340px] w-[340px] rounded-full bg-[radial-gradient(circle_at_center,rgba(124,60,255,0.12),transparent_62%)] blur-2xl" />
        <SectionTitle
          title="Кому будет полезно"
          description="Для предпринимателей, инвесторов, экспертов и команд, которые хотят усилить рост и окружение."
          maxWidthClass="max-w-[520px]"
          titleClassName="lg:text-[4.45rem]"
        />
        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {eventData.audience.map((item) => (
            <article
              key={item.title}
              className="group flex min-h-[390px] flex-col rounded-[28px] border border-white/10 bg-white/[0.045] p-4 text-center shadow-soft backdrop-blur-2xl transition duration-300 hover:-translate-y-1 hover:border-violet-300/25 hover:bg-white/[0.06]"
            >
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-violet-400/30 bg-[radial-gradient(circle_at_35%_30%,rgba(124,60,255,0.22),rgba(8,7,22,0.96))] sm:h-28 sm:w-28">
                <AudienceIcon icon={item.icon} className="h-9 w-9 text-violet-200" />
              </div>
              <h3 className="mt-4 text-[1.18rem] font-semibold leading-tight text-white">
                {item.title}
              </h3>
              <div className="mx-auto mt-3 h-px w-12 bg-violet-400/70" />
              <p className="mt-3 text-[14px] leading-5 text-white/66">{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="speakers" className="section-shell relative overflow-hidden py-8 md:py-12">
        <div className="pointer-events-none absolute right-[-80px] top-[-20px] h-[320px] w-[680px] bg-[radial-gradient(circle_at_20%_50%,rgba(124,60,255,0.18),transparent_18%),radial-gradient(circle_at_45%_15%,rgba(124,60,255,0.22),transparent_18%),radial-gradient(circle_at_70%_45%,rgba(124,60,255,0.16),transparent_18%),linear-gradient(115deg,rgba(124,60,255,0.18),transparent_60%)] blur-2xl" />
        <SectionTitle
          title="Спикеры"
          description="Практики из бизнеса, инвестиций и цифровых технологий."
          titleClassName="lg:text-[4.1rem]"
        />
        <div className="mt-5 grid gap-3 lg:grid-cols-3">
          {eventData.speakers.map((speaker, index) => (
            <SpeakerCard key={speaker.name} speaker={speaker} index={index} />
          ))}
        </div>
      </section>

      <section id="program" className="section-shell relative py-16 md:py-24">
        <div className="pointer-events-none absolute left-[-120px] top-[240px] hidden h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle_at_30%_70%,rgba(124,60,255,0.35),transparent_35%),radial-gradient(circle_at_0%_100%,rgba(124,60,255,0.18),transparent_45%)] blur-2xl lg:block" />
        <div className="grid gap-8 lg:grid-cols-[0.84fr_1.16fr]">
          <div className="lg:pt-2">
            <SectionTitle

              title="Программа мероприятия"
              description="Основная часть проходит с 12:00 до 17:00. После — ужин со спикерами в отдельном формате."
            />
            <Link href="#register" className="btn-primary mt-8 inline-flex">
              Смотреть программу
            </Link>
          </div>

          <div className="rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.065),rgba(255,255,255,0.03))] p-4 shadow-soft backdrop-blur-2xl md:p-5">
            <div className="relative rounded-[26px] border border-white/10 bg-black/18 p-4 md:p-5 lg:pl-[120px]">
              <div className="pointer-events-none absolute left-[120px] top-8 bottom-8 hidden w-px bg-white/10 lg:block" />
              <ul className="space-y-3">
                {eventData.program.map((item) => (
                  <ProgramRow
                    key={`${item.time}-${item.title}`}
                    item={item}
                    accent={item.time === "15:30" ? "featured" : item.time === "17:00" ? "final" : undefined}
                  />
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section id="register" className="section-shell py-16 md:py-24">
        <div className="overflow-hidden rounded-[36px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.075),rgba(255,255,255,0.03))] p-4 shadow-soft backdrop-blur-2xl md:p-6">
          <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-start">
            <div className="space-y-6">
              <SectionTitle
                title="Забронируйте место на конференции"
                description={eventData.registration.lead}
                maxWidthClass="max-w-[860px]"
                titleClassName="lg:text-[4.75rem]"
              />

              <div id="register-form" className="rounded-[28px] border border-white/10 bg-black/18 p-5">
                <Suspense
                  fallback={
                    <div className="space-y-4 rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
                      <div className="h-12 rounded-[18px] bg-white/10" />
                      <div className="h-12 rounded-[18px] bg-white/10" />
                      <div className="h-12 rounded-[18px] bg-white/10" />
                      <div className="h-12 rounded-[18px] bg-white/10" />
                    </div>
                  }
                >
                  <RegistrationForm />
                </Suspense>
              </div>
            </div>

            <RegistrationTicket />
          </div>

          <div className="mt-5 flex items-center gap-4">
            <div className="h-px flex-1 bg-white/10" />
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-violet-400/50 bg-black/20 text-lg font-medium text-violet-200">
              !
            </div>
            <div className="h-px flex-1 bg-white/10" />
          </div>
          <p className="mt-3 text-center text-sm leading-7 text-white/58">{eventData.registration.note}</p>
        </div>
      </section>

      <section id="partners" className="section-shell relative overflow-hidden py-16 md:py-24">
        <div className="pointer-events-none absolute right-[-100px] top-[10px] h-[360px] w-[360px] rounded-full bg-[radial-gradient(circle_at_center,rgba(124,60,255,0.12),transparent_60%)] blur-2xl" />
        <div className="pointer-events-none absolute left-[-120px] bottom-[120px] h-[260px] w-[520px] bg-[radial-gradient(circle_at_0%_100%,rgba(124,60,255,0.18),transparent_35%),radial-gradient(circle_at_100%_0%,rgba(124,60,255,0.08),transparent_35%)] blur-2xl" />
        <SectionTitle

          title="Партнеры мероприятия"
          description="Компании и команды, которые развивают бизнес, технологии, капитал и сильное окружение."
          center
        />

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
          {eventData.partners.map((partner) => (
            <div
              key={partner.name}
              className="rounded-[24px] border border-white/10 bg-white/[0.045] px-4 py-8 text-center shadow-soft"
            >
              <div className="flex h-28 items-center justify-center">
                <PartnerBadge name={partner.name} />
              </div>
              <p className="mt-2 text-sm font-medium tracking-[0.08em] text-white/86">
                {partner.name}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-5 rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-5 shadow-soft backdrop-blur-2xl lg:grid-cols-[1fr_1.05fr]">
          <div className="flex flex-col justify-between gap-6">
            <div>
              <h3 className="mt-3 max-w-[620px] font-display text-4xl leading-tight text-white">
                {eventData.partnersLead}
              </h3>
            </div>
            <Link href="#register" className="btn-primary inline-flex w-fit">
              {eventData.partnersCta}
            </Link>
          </div>
          <PartnerVisualExact />
        </div>
      </section>

      <section id="faq" className="section-shell relative overflow-hidden py-16 md:py-24">
        <div className="pointer-events-none absolute left-[-160px] top-[20px] h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle_at_35%_30%,rgba(124,60,255,0.18),transparent_28%),radial-gradient(circle_at_50%_70%,rgba(124,60,255,0.12),transparent_30%)] blur-2xl" />
        <div className="pointer-events-none absolute right-[-120px] bottom-[-40px] h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle_at_55%_45%,rgba(124,60,255,0.16),transparent_28%),radial-gradient(circle_at_10%_90%,rgba(124,60,255,0.09),transparent_34%)] blur-2xl" />
        <SectionTitle

          title="FAQ"
          description="Ответы на частые вопросы об участии в мероприятии."
          center
        />
        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          {eventData.faq.map((item, index) => (
            <FAQItem key={item.question} item={item} index={index} />
          ))}
        </div>
      </section>

      <section id="location" className="section-shell py-16 md:py-24">
        <SectionTitle

          title="Локация"
          description="Конференция пройдет в центре Екатеринбурга."
          center
        />
        <div className="mt-8 grid gap-5 lg:grid-cols-[0.96fr_1.04fr]">
          <div className="rounded-[32px] border border-white/10 bg-white/[0.05] p-6 shadow-soft backdrop-blur-2xl">
            <div className="flex items-start gap-4">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[24px] border border-violet-400/30 bg-[radial-gradient(circle_at_35%_35%,rgba(124,60,255,0.22),rgba(8,7,22,0.96))]">
                <BusinessIcon className="h-10 w-10 text-violet-200" />
              </div>
              <div>
                <h3 className="font-display text-4xl text-white">{eventData.location.venue}</h3>
                <p className="mt-2 text-sm text-white/60">{eventData.location.address}</p>
              </div>
            </div>
            <p className="mt-6 text-lg leading-8 text-white/72">
              Современная площадка в центре города с удобной транспортной доступностью и комфортной инфраструктурой.
            </p>
            <ul className="mt-6 space-y-3">
              {eventData.location.advantages.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-3 rounded-[18px] border border-white/10 bg-black/18 px-4 py-3 text-white/82"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border border-violet-400/30 bg-black/20 text-violet-200">
                    <PinIcon className="h-4 w-4" />
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <Link href={eventData.location.routeUrl} className="btn-primary mt-6 inline-flex" target="_blank" rel="noreferrer">
              <PlaneIcon className="h-4 w-4" />
              Построить маршрут
            </Link>
          </div>

          <MapCardExact />
        </div>
        <div className="mt-6 flex items-center gap-4">
          <div className="h-px flex-1 bg-white/10" />
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-violet-400/50 bg-black/20 text-lg font-medium text-violet-200">
            i
          </div>
          <div className="h-px flex-1 bg-white/10" />
        </div>
        <p className="mt-3 text-center text-sm leading-7 text-white/58">
          {eventData.location.note}
        </p>
      </section>

      <footer className="section-shell pb-10 pt-16 md:pb-16">
        <div className="rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.04))] p-5 shadow-soft backdrop-blur-2xl md:p-6">
          <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_15%_20%,rgba(124,60,255,0.2),transparent_26%),linear-gradient(135deg,rgba(255,255,255,0.03),rgba(255,255,255,0.06))] p-6">
            <div className="relative grid gap-6 lg:grid-cols-[1.75fr_0.55fr] lg:items-center">
              <div className="relative z-10 max-w-[820px] lg:pr-8">
                <h3 className="mt-3 font-display text-[2.7rem] leading-[0.94] tracking-[-0.03em] text-white lg:text-[3.1rem]">
                  <span className="block whitespace-nowrap">
                    {footerCtaTitleParts?.[1] ?? eventData.footer.ctaTitle}
                  </span>
                  <span className="block whitespace-nowrap text-violet-300">
                    {footerCtaTitleParts?.[2]}
                  </span>
                </h3>
                <p className="mt-3 text-sm leading-7 text-white/66">{eventData.footer.ctaCopy}</p>
              </div>

              <div className="flex flex-col items-start gap-4 lg:absolute lg:left-[68%] lg:top-[81%] lg:z-20 lg:flex-row lg:-translate-x-1/2 lg:-translate-y-1/2 lg:items-center">
                <Link href="#register" className="btn-primary min-w-[286px]">
                  {eventData.footer.ctaButton}
                </Link>
                <Link href="#program" className="btn-secondary min-w-[286px]">
                  {eventData.programCta}
                </Link>
              </div>

              <div className="relative min-h-[250px] overflow-hidden lg:min-h-[320px]">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute right-[-105px] top-[-88px] h-[420px] w-[420px] bg-[url('/footer-orb.svg')] bg-cover bg-right-top bg-no-repeat opacity-100 lg:right-[-120px] lg:top-[-108px] lg:h-[620px] lg:w-[620px]"
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_28%,rgba(124,60,255,0.28),transparent_36%),linear-gradient(90deg,transparent_0%,transparent_44%,rgba(7,6,26,0.16)_70%,rgba(7,6,26,0.25)_100%)]"
                />
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-10 lg:grid-cols-[1.08fr_0.72fr_0.72fr_0.82fr_0.96fr]">
            <div>
              <Link href="#top" className="inline-flex items-start gap-3">
                <BrandMarkIcon className="h-14 w-14 text-violet-300" />
                <div className="leading-none">
                  <span className="block font-display text-[2.1rem] leading-none text-white">Цифровой</span>
                  <span className="block font-display text-[2.1rem] leading-none text-white">капитал</span>
                </div>
              </Link>
              <p className="mt-4 max-w-md text-sm leading-7 text-white/62">{eventData.footer.about}</p>
              <div className="mt-5 flex items-center gap-5">
                {eventData.socials.map((social) => (
                  <Link
                    key={social.label}
                    href={social.href}
                    className="flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-white/82 transition hover:border-violet-300/30 hover:bg-violet-500/20"
                    aria-label={social.label}
                  >
                    {social.label === "Telegram" ? (
                      <TelegramIcon className="h-5 w-5" />
                    ) : social.label === "VK" ? (
                      <VkIcon className="h-5 w-5" />
                    ) : social.label === "YouTube" ? (
                      <YouTubeIcon className="h-5 w-5" />
                    ) : (
                      <LinkedInIcon className="h-5 w-5" />
                    )}
                  </Link>
                ))}
              </div>
            </div>

            <div className="lg:border-l lg:border-white/10 lg:pl-6">
              <p className="text-sm font-medium text-violet-300">Навигация</p>
              <ul className="mt-4 space-y-3 text-sm text-white/72">
                {eventData.navItems.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="transition hover:text-white">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:border-l lg:border-white/10 lg:pl-6">
              <p className="text-sm font-medium text-violet-300">{eventData.footer.participantTitle}</p>
              <ul className="mt-4 space-y-3 text-sm text-white/72">
                {eventData.footer.participantLinks.map((item) => (
                  <li key={item.label}>
                    <Link href={item.href} className="transition hover:text-white">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div id="footer-contacts" className="lg:border-l lg:border-white/10 lg:pl-6">
              <p className="text-sm font-medium text-violet-300">Контакты</p>
              <ul className="mt-4 space-y-3 text-sm text-white/72">
                <li className="flex items-center gap-2">
                  <MailIcon className="h-4 w-4 text-violet-200" />
                  <span>{eventData.contacts.email}</span>
                </li>
                <li className="flex items-center gap-2">
                  <PhoneIcon className="h-4 w-4 text-violet-200" />
                  <span>{eventData.contacts.phone}</span>
                </li>
              </ul>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-black/18 p-5 lg:border-l lg:border-white/10 lg:pl-6">
              <p className="text-sm font-medium text-violet-300">
                {eventData.footer.newsletterTitle}
              </p>
              <p className="mt-4 text-sm leading-7 text-white/68">
                {eventData.footer.newsletterCopy}
              </p>
              <div className="mt-4 flex gap-2">
                <input
                  type="email"
                  placeholder="Ваш email"
                  className="field-input min-w-0 flex-1"
                />
                <button type="button" className="btn-primary px-5">
                  <ArrowRightIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 border-t border-white/8 pt-5 text-xs text-white/42 sm:flex-row sm:items-center sm:justify-between">
            <p>{eventData.footer.copyright}</p>
            <div className="flex flex-wrap gap-4">
              <Link href="#" className="transition hover:text-white">
                {eventData.footer.policy}
              </Link>
              <span className="hidden h-4 w-px bg-white/14 sm:block" aria-hidden="true" />
              <Link href="#" className="transition hover:text-white">
                {eventData.footer.offer}
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}

