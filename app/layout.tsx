import type { Metadata } from 'next';
import './globals.css';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:7485';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'Цифровой капитал — конференция о бизнесе, ИИ и инвестициях',
  description: 'Бизнес, инвестиции, искусственный интеллект, сильное окружение и новые возможности роста.',
  openGraph: {
    title: 'Цифровой капитал',
    description: 'Конференция о бизнесе, ИИ, инвестициях и нетворкинге.',
    url: siteUrl,
    siteName: 'Цифровой капитал',
    images: ['/og.svg'],
    locale: 'ru_RU',
    type: 'website'
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
