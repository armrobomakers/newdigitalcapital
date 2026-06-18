import type { StaticImageData } from "next/image";

import screen1 from "@/maket/desktop/1.png";
import screen2 from "@/maket/desktop/2.png";
import screen3 from "@/maket/desktop/3.png";
import screen4 from "@/maket/desktop/4.png";
import screen5 from "@/maket/desktop/5.png";
import screen6 from "@/maket/desktop/6.png";
import screen7 from "@/maket/desktop/7.png";
import screen8 from "@/maket/desktop/8.png";
import screen9 from "@/maket/desktop/9.png";

const screens: Array<{ image: StaticImageData; alt: string; priority?: boolean }> = [
  { image: screen1, alt: "Экран 1: титульный блок конференции", priority: true },
  { image: screen2, alt: "Экран 2: для кого будет полезно" },
  { image: screen3, alt: "Экран 3: спикеры конференции" },
  { image: screen4, alt: "Экран 4: программа мероприятия" },
  { image: screen5, alt: "Экран 5: регистрация" },
  { image: screen6, alt: "Экран 6: партнеры и предложение партнерства" },
  { image: screen7, alt: "Экран 7: FAQ" },
  { image: screen8, alt: "Экран 8: локация конференции" },
  { image: screen9, alt: "Экран 9: финальный CTA и футер" },
];

export function LandingPage() {
  return (
    <main className="bg-black">
      {screens.map(({ image, alt, priority }) => (
        <section key={alt} className="bg-black">
          <img
            src={image.src}
            alt={alt}
            width={image.width}
            height={image.height}
            loading={priority ? "eager" : "eager"}
            decoding="async"
            className="block h-auto w-full"
          />
        </section>
      ))}
    </main>
  );
}
