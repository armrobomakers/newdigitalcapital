type Screen = {
  src: string;
  alt: string;
  compact?: boolean;
};

const screens: Screen[] = [
  {
    src: "/maket-desktop/1.png",
    alt: "Экран 1: титульный блок конференции",
    compact: true,
  },
  { src: "/maket-desktop/2.png", alt: "Экран 2: для кого будет полезно" },
  { src: "/maket-desktop/3.png", alt: "Экран 3: спикеры конференции" },
  { src: "/maket-desktop/4.png", alt: "Экран 4: программа мероприятия" },
  { src: "/maket-desktop/5.png", alt: "Экран 5: регистрация" },
  { src: "/maket-desktop/6.png", alt: "Экран 6: партнеры и предложение партнерства" },
  { src: "/maket-desktop/7.png", alt: "Экран 7: FAQ" },
  { src: "/maket-desktop/8.png", alt: "Экран 8: локация конференции" },
  { src: "/maket-desktop/9.png", alt: "Экран 9: финальный CTA и футер" },
];

export function LandingPage() {
  return (
    <main className="bg-black">
      {screens.map(({ src, alt, compact }) => (
        <section key={alt} className="bg-black">
          {compact ? (
            <div className="aspect-[1586/760] w-full overflow-hidden bg-black">
              <img
                src={src}
                alt={alt}
                width={1586}
                height={992}
                loading="eager"
                decoding="async"
                className="block h-full w-full object-cover object-top"
              />
            </div>
          ) : (
            <img
              src={src}
              alt={alt}
              width={1586}
              height={992}
              loading="lazy"
              decoding="async"
              className="block h-auto w-full"
            />
          )}
        </section>
      ))}
    </main>
  );
}
