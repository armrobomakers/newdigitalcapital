import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Цифровой капитал",
    short_name: "Цифровой капитал",
    description:
      "Конференции о бизнесе, инвестициях, технологиях и искусственном интеллекте.",
    start_url: "/",
    display: "standalone",
    background_color: "#050411",
    theme_color: "#050411",
    lang: "ru",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
