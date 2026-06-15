import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:7485';
const ymId = process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID;
const vkId = process.env.NEXT_PUBLIC_VK_PIXEL_ID;

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
      <body>
        {children}
        {ymId ? (
          <Script id="ym" strategy="afterInteractive">
            {`(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};m[i].l=1*new Date();k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})(window,document,'script','https://mc.yandex.ru/metrika/tag.js','ym');ym(${ymId},'init',{clickmap:true,trackLinks:true,accurateTrackBounce:true,webvisor:true});`}
          </Script>
        ) : null}
        {vkId ? (
          <Script id="vk-pixel" strategy="afterInteractive">
            {`!function(){var t=document.createElement('script');t.type='text/javascript',t.async=!0,t.src='https://vk.com/js/api/openapi.js?169',t.onload=function(){VK.Retargeting.Init('${vkId}');VK.Retargeting.Hit();};document.head.appendChild(t);}();`}
          </Script>
        ) : null}
      </body>
    </html>
  );
}
