import type { Metadata } from "next";

import "./globals.css";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://digitalcapital.vercel.app").replace(
  /\/$/,
  ""
);
const indexingEnabled = process.env.NEXT_PUBLIC_INDEXING_ENABLED === "true";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
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
