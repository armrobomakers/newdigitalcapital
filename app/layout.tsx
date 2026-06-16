import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Конференция «Цифровой капитал»",
  description:
    "Премиальный лендинг конференции о бизнесе, инвестициях и искусственном интеллекте в Екатеринбурге.",
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
