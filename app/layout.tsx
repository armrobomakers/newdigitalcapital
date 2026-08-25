import type { Metadata } from "next";

import { isBrandedPublicUrl } from "@/lib/config-values";

import "./globals.css";
import "./ui-library.css";
import "./ui-footer.css";
import "./ui-trust.css";

const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() ?? "";
const brandedSiteReady = isBrandedPublicUrl(configuredSiteUrl);
const indexingEnabled =
  process.env.NEXT_PUBLIC_INDEXING_ENABLED === "true" && brandedSiteReady;

export const metadata: Metadata = {
  ...(brandedSiteReady ? { metadataBase: new URL(configuredSiteUrl) } : {}),
  applicationName: "Цифровой капитал",
  title: {
    default: "Цифровой капитал — конференции о бизнесе, инвестициях и AI",
    template: "%s | Цифровой капитал",
  },
  description:
    "Конференции «Цифровой капитал» о бизнесе, инвестициях, технологиях и искусственном интеллекте.",
  icons: {
    icon: "/icon.svg",
  },
  robots: {
    index: indexingEnabled,
    follow: indexingEnabled,
  },
  openGraph: {
    type: "website",
    locale: "ru_RU",
    siteName: "Цифровой капитал",
    title: "Цифровой капитал",
    description:
      "Конференции о бизнесе, инвестициях, технологиях и искусственном интеллекте.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
