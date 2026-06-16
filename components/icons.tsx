import type { ReactNode, SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function BaseIcon({ children, ...props }: IconProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export function BusinessIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M3 21h18" />
      <path d="M5 21V8h6v13" />
      <path d="M13 21V5h6v16" />
      <path d="M8 11h2" />
      <path d="M16 9h2" />
      <path d="M16 13h2" />
    </BaseIcon>
  );
}

export function UserIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <circle cx="12" cy="8" r="3.2" />
      <path d="M5.5 20v-1.2A4.8 4.8 0 0 1 10.3 14h3.4a4.8 4.8 0 0 1 4.8 4.8V20" />
    </BaseIcon>
  );
}

export function BriefcaseIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <rect x="4.5" y="7.5" width="15" height="11" rx="2.5" />
      <path d="M9 7.5V6a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 6v1.5" />
      <path d="M4.5 12h15" />
    </BaseIcon>
  );
}

export function InvestIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M4 19h16" />
      <path d="m6 15 3-3 3 2 6-6" />
      <path d="m14 8 4 0v4" />
    </BaseIcon>
  );
}

export function AiIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <rect x="7" y="7" width="10" height="10" rx="3" />
      <path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3" />
      <path d="M10 10h4v4h-4z" />
    </BaseIcon>
  );
}

export function NetworkIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <circle cx="6" cy="7" r="2" />
      <circle cx="18" cy="7" r="2" />
      <circle cx="12" cy="17" r="2" />
      <path d="M8 8.2 10.5 13" />
      <path d="M16 8.2 13.5 13" />
    </BaseIcon>
  );
}

export function CalendarIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <rect x="4" y="5" width="16" height="15" rx="3" />
      <path d="M8 3v4M16 3v4M4 10h16" />
    </BaseIcon>
  );
}

export function PinIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M12 21s6-5.3 6-11a6 6 0 1 0-12 0c0 5.7 6 11 6 11Z" />
      <circle cx="12" cy="10" r="2.2" />
    </BaseIcon>
  );
}

export function ShieldIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M12 3 19 6v6c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V6l7-3Z" />
      <path d="m9.2 12 1.8 1.8 3.8-4" />
    </BaseIcon>
  );
}

export function SparkIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M12 2 14.2 8.8 21 11l-6.8 2.2L12 20l-2.2-6.8L3 11l6.8-2.2L12 2Z" />
    </BaseIcon>
  );
}

export function StarIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="m12 3 2.4 5.1 5.6.8-4 3.9.9 5.5L12 15.7 7.1 18.3l.9-5.5-4-3.9 5.6-.8L12 3Z" />
    </BaseIcon>
  );
}

export function CrownIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M4 8.5 7.2 11 12 5.8l4.8 5.2L20 8.5 18.2 18H5.8L4 8.5Z" />
      <path d="M6.8 18h10.4" />
    </BaseIcon>
  );
}

export function HexNetworkIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M12 3 19 7.2V16.8L12 21 5 16.8V7.2L12 3Z" />
      <circle cx="9" cy="8.5" r="0.9" />
      <circle cx="15" cy="8.5" r="0.9" />
      <circle cx="12" cy="12" r="0.9" />
      <circle cx="9" cy="15.5" r="0.9" />
      <circle cx="15" cy="15.5" r="0.9" />
      <path d="M9 8.5 12 12l3-3.5M9 15.5 12 12l3 3.5M9 8.5v7M15 8.5v7" />
    </BaseIcon>
  );
}

export function CloudIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M7.5 18.5h9a4.5 4.5 0 0 0 .7-8.94A5.5 5.5 0 0 0 6.9 8.7 3.8 3.8 0 0 0 7.5 18.5Z" />
    </BaseIcon>
  );
}

export function TicketIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4V8Z" />
      <path d="M9 9.5h6M9 12h6M9 14.5h4" />
    </BaseIcon>
  );
}

export function UsersIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M17 20v-1a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v1" />
      <circle cx="11.5" cy="8.5" r="3" />
      <path d="M21 20v-1a3.5 3.5 0 0 0-2.2-3.2" />
      <path d="M16.5 5.8a3 3 0 0 1 0 5.8" />
    </BaseIcon>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="m5 12 4 4L19 6" />
    </BaseIcon>
  );
}

export function ArrowUpRightIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M7 17 17 7" />
      <path d="M8 7h9v9" />
    </BaseIcon>
  );
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </BaseIcon>
  );
}

export function MicrophoneIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <rect x="8" y="3.5" width="8" height="12" rx="4" />
      <path d="M12 15.5V20" />
      <path d="M7.5 20h9" />
      <path d="M5.5 11a6.5 6.5 0 0 0 13 0" />
    </BaseIcon>
  );
}

export function PieChartIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 12V4a8 8 0 0 1 8 8h-8Z" />
      <path d="M12 12h8a8 8 0 0 1-4.2 7.1L12 12Z" />
    </BaseIcon>
  );
}

export function HandshakeIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M4.5 12.5 8 9l3 3" />
      <path d="m10.5 8.5 2.5-2.5a2 2 0 0 1 2.8 0l1.7 1.7" />
      <path d="m19.5 11-2 2a3 3 0 0 1-4.2 0L12 11.7" />
      <path d="m8 13 2.5 2.5a3 3 0 0 0 4.2 0l1.8-1.8" />
      <path d="M5.5 14.5 8 17a2 2 0 0 0 2.8 0l1.2-1.2" />
    </BaseIcon>
  );
}

export function MailIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <rect x="3" y="5" width="18" height="14" rx="3" />
      <path d="m4.5 7.5 7.5 6 7.5-6" />
    </BaseIcon>
  );
}

export function PhoneIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M8 3.5h8A2.5 2.5 0 0 1 18.5 6v12A2.5 2.5 0 0 1 16 20.5H8A2.5 2.5 0 0 1 5.5 18V6A2.5 2.5 0 0 1 8 3.5Z" />
      <path d="M11 16h2" />
    </BaseIcon>
  );
}

export function TelegramIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="m3.5 11.3 16.8-7.2-3.2 15.8-4.6-5.2-3.6 2.5-.9-4.1 8.6-6.6" />
    </BaseIcon>
  );
}

export function VkIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M4.5 7c1.3 6 4.3 10 7.5 10h1.5v-4.1c1.8 2.7 3.4 4.1 5.5 4.1h.5l-4.2-6.1 3.8-5.9H15c-1.5 0-2.7 1.1-3.5 3V5H8v12H4.5" />
    </BaseIcon>
  );
}

export function LinkedInIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <rect x="4" y="4" width="16" height="16" rx="3" />
      <path d="M8 10.5V16" />
      <path d="M8 7.5v.2" />
      <path d="M12 16v-3a2 2 0 1 1 4 0v3" />
    </BaseIcon>
  );
}

export function YouTubeIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <rect x="3.5" y="6" width="17" height="12" rx="3" />
      <path d="m11 9 4 3-4 3V9Z" />
    </BaseIcon>
  );
}

export function BrandMarkIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M6.5 6.5 12 3.5l5.5 3v14l-5.5 3-5.5-3v-14Z" />
      <path d="M9 8.5 12 7l3 1.5v8L12 18l-3-1.5v-8Z" />
      <path d="M9 12h6" />
    </BaseIcon>
  );
}
