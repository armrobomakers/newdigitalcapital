export type NavItem = {
  label: string;
  href: string;
};

export type StatItem = {
  value: string;
  label: string;
};

export type AudienceItem = {
  title: string;
  description: string;
  icon: "founder" | "investor" | "leader" | "specialist" | "partner";
};

export type Speaker = {
  name: string;
  role: string;
  company: string;
  topic: string;
  initials: string;
  photo?: string;
};

export type ProgramItem = {
  time: string;
  title: string;
  speaker: string;
  note?: string;
  icon?: "calendar" | "spark" | "business" | "invest" | "network" | "ticket";
  accent?: "featured" | "final";
};

export type PartnerItem = {
  name: string;
};

export type FaqItem = {
  question: string;
  answer: string;
};

export type SocialItem = {
  label: "Telegram" | "LinkedIn" | "YouTube" | "VK";
  href: string;
  short: string;
};

export type TicketTier = {
  id: string;
  name: string;
  price: string;
  description: string;
  benefits: string[];
  highlighted?: boolean;
};

export type EventData = {
  eventId: string;
  slug: string;
  name: string;
  badge: string;
  subtitle: string;
  heroCta: string;
  programCta: string;
  dateLabel: string;
  timeLabel: string;
  cityLabel: string;
  venueLabel: string;
  formatLabel: string;
  formatDescription: string;
  programLead: string;
  programDetails: string;
  assets: {
    heroImage: string;
    mapImage: string;
    partnerImage: string;
  };
  navItems: NavItem[];
  stats: StatItem[];
  audience: AudienceItem[];
  speakers: Speaker[];
  program: ProgramItem[];
  registration: {
    title: string;
    lead: string;
    ticketTitle: string;
    price: string;
    priceCaption: string;
    note: string;
    benefits: string[];
    formTitle: string;
    formLead: string;
    tickets?: TicketTier[];
  };
  partners: PartnerItem[];
  partnersLead: string;
  partnersCta: string;
  partnersLabel: string;
  faq: FaqItem[];
  location: {
    verified: boolean;
    description: string;
    venue: string;
    address: string;
    venueDescription: string;
    note: string;
    advantages: string[];
    routeUrl: string;
  };
  footer: {
    ctaTitle: string;
    ctaCopy: string;
    ctaButton: string;
    about: string;
    participantTitle: string;
    participantLinks: NavItem[];
    newsletterTitle: string;
    newsletterCopy: string;
    copyright: string;
    policy: string;
    offer: string;
  };
  contacts: {
    email: string;
    phone: string;
  };
  socials: SocialItem[];
};

const ekbArchiveEvent: EventData = {
  eventId: "ekb-2026-06-13",
  slug: "ekb",
  name: "Цифровой капитал",
  badge: "Конференция о бизнесе, инвестициях и искусственном интеллекте",
  subtitle:
    "Бизнес, инвестиции и искусственный интеллект — для роста капитала, компаний и сильного окружения.",
  heroCta: "Зарегистрироваться",
  programCta: "Смотреть программу",
  dateLabel: "13 июня 2026 · архив",
  timeLabel: "12:00 — 17:00",
  cityLabel: "Екатеринбург",
  venueLabel: "площадка требует верификации",
  formatLabel: "Формат участия",
  formatDescription: "для предпринимателей и инвесторов",
  programLead: "Один день полезного контента, нетворкинга и практических инсайтов от экспертов.",
  programDetails: "Основная часть проходит с 12:00 до 17:00. После — ужин со спикерами в отдельном формате.",
  assets: {
    heroImage: "/hero-stage-3.png",
    mapImage: "/location-map.png",
    partnerImage: "/partner-handshake.png",
  },
  navItems: [
    { label: "Программа", href: "#program" },
    { label: "Спикеры", href: "#speakers" },
    { label: "Для кого", href: "#audience" },
    { label: "Партнеры", href: "#partners" },
    { label: "Локация", href: "#location" },
    { label: "FAQ", href: "#faq" },
  ],
  stats: [
    { value: "3", label: "спикера в опубликованной программе" },
    { value: "5", label: "часов основной программы" },
    { value: "1", label: "панельная дискуссия" },
    { value: "1", label: "город — Екатеринбург" },
  ],
  audience: [
    {
      title: "Предпринимателям",
      description:
        "Конференция для предпринимателей, которым нужны идеи для роста бизнеса, масштабирования, партнерств и привлечения капитала.",
      icon: "founder",
    },
    {
      title: "Инвесторам",
      description:
        "Практический взгляд на инвестиции, управление капиталом, оценку рисков и современные финансовые инструменты для частного инвестора.",
      icon: "investor",
    },
    {
      title: "Экспертам и руководителям",
      description:
        "Для экспертов, руководителей и собственников бизнеса, которые строят личный бренд, усиливают окружение и развивают деловые связи.",
      icon: "leader",
    },
    {
      title: "Специалистам",
      description:
        "О том, как искусственный интеллект меняет рынок труда, профессии, процессы и новые карьерные возможности для специалистов.",
      icon: "specialist",
    },
    {
      title: "Партнерам и командам",
      description:
        "Для партнеров, команд и компаний, которым важны нетворкинг, B2B-контакты, коллаборации и совместный рост в бизнес-среде.",
      icon: "partner",
    },
  ],
  speakers: [
    {
      name: "Василий Климов",
      role: "Спикер",
      company: "SoulMate Club и Искусственный Интеллект",
      topic:
        "Расскажет о развитии сообщества, возможностях клуба и применении искусственного интеллекта в новой цифровой экономике.",
      initials: "ВК",
      photo: "/speaker-1-face.png",
    },
    {
      name: "Владислав Бычков",
      role: "Спикер",
      company: "Инвестиции с AI Robo Makers — ARM",
      topic:
        "Покажет системный подход к алгоритмическому управлению капиталом, рискам и долгосрочным инвестиционным решениям.",
      initials: "ВБ",
      photo: "/speaker-2-face.png",
    },
    {
      name: "Максим Бумарсков",
      role: "Спикер",
      company: "Бизнес SoulMate",
      topic:
        "Раскроет возможности бизнес-направления SoulMate, партнерской модели и роста через экосистему.",
      initials: "МБ",
      photo: "/speaker-3-face.png",
    },
  ],
  program: [
    {
      time: "12:00",
      title: "Сбор гостей и регистрация",
      speaker: "Ресепшн, welcome-кофе",
      icon: "ticket",
    },
    {
      time: "12:20",
      title: "Открытие мероприятия",
      speaker: "Приветствие организаторов",
      icon: "spark",
    },
    {
      time: "12:30",
      title: "Василий Климов",
      speaker: "SoulMate Club и Искусственный Интеллект",
      note: "AI, сообщества и практическая модель роста для бизнеса.",
      icon: "business",
    },
    {
      time: "13:20",
      title: "Владислав Бычков",
      speaker: "AI Robo Makers — ARM",
      note: "Инвестиции, аналитика и решения, которые ускоряют принятие решений.",
      icon: "invest",
    },
    {
      time: "14:10",
      title: "Перерыв, нетворкинг",
      speaker: "Кофе и знакомства",
      icon: "network",
    },
    {
      time: "14:40",
      title: "Максим Бумарсков",
      speaker: "SoulMate",
      note: "Как масштабировать проект без потери качества и фокуса.",
      icon: "business",
    },
    {
      time: "15:30",
      title: "Панельная дискуссия со спикерами",
      speaker: "Вопросы из зала",
      note: "Обсудим рынок, AI-подходы и инструменты для роста компаний.",
      icon: "spark",
      accent: "featured",
    },
    {
      time: "16:30",
      title: "Завершение основной части",
      speaker: "Переход к общению",
      note: "Финальное слово, фото и свободное общение.",
      icon: "calendar",
    },
    {
      time: "17:00",
      title: "Ужин со спикерами",
      speaker: "Закрытый формат",
      note: "Закрытое общение со спикерами в неформальной атмосфере.",
      icon: "network",
      accent: "final",
    },
  ],
  registration: {
    title: "Архив конференции",
    lead: "Регистрация на событие 13 июня 2026 завершена.",
    ticketTitle: "Архив события",
    price: "",
    priceCaption: "Продажи завершены",
    note: "Продажи и прием новых заявок на это событие отключены.",
    benefits: [],
    formTitle: "Регистрация завершена",
    formLead: "Следующая дата будет опубликована отдельным событием.",
  },
  partners: [],
  partnersLead:
    "Список партнеров архивного события скрыт до верификации. Партнерские форматы следующей конференции будут опубликованы вместе с новой датой.",
  partnersCta: "Партнерские форматы",
  partnersLabel: "Партнерский пакет",
  faq: [
    {
      question: "Можно ли зарегистрироваться на это событие?",
      answer:
        "Нет. Конференция состоялась 13 июня 2026 года, и регистрация на архивное событие закрыта.",
    },
    {
      question: "Где проходила конференция?",
      answer:
        "Площадка архивного события сейчас не указана. Для следующего события адрес будет опубликован только после подтверждения площадки и схемы прохода.",
    },
    {
      question: "Будет ли следующая конференция?",
      answer:
        "Следующее событие будет опубликовано отдельной страницей после подтверждения даты, площадки, программы и условий участия.",
    },
    {
      question: "Можно ли посмотреть программу прошедшего события?",
      answer:
        "Да. Программа 13 июня сохранена на этой странице как архив мероприятия.",
    },
    {
      question: "Как узнать о следующем событии?",
      answer:
        "Официальные контакты и подписка на анонсы будут опубликованы после готовности юридического и коммуникационного контура.",
    },
    {
      question: "Можно ли стать партнером следующей конференции?",
      answer:
        "Партнерская форма и условия будут открыты вместе с новой датой мероприятия, чтобы заявки партнеров не смешивались с заявками участников.",
    },
  ],
  location: {
    verified: false,
    description: "Архивные сведения о площадке временно скрыты до верификации адреса.",
    venue: "Площадка архивного события",
    address: "Адрес скрыт до верификации",
    venueDescription: "Площадка будет опубликована после подтверждения адреса и схемы прохода.",
    note: "Маршрут архивного события скрыт до подтверждения корректных данных.",
    advantages: [],
    routeUrl: "#location",
  },
  footer: {
    ctaTitle: "Следите за следующей конференцией «Цифровой капитал»",
    ctaCopy:
      "Следующая дата будет опубликована после подтверждения площадки, программы и условий участия.",
    ctaButton: "Зарегистрироваться",
    about: "Конференция о бизнесе, инвестициях и искусственном интеллекте.",
    participantTitle: "Участнику",
    participantLinks: [
      { label: "Архив", href: "#register" },
      { label: "Программа", href: "#program" },
      { label: "FAQ", href: "#faq" },
      { label: "Контакты", href: "#footer-contacts" },
    ],
    newsletterTitle: "Будьте в курсе",
    newsletterCopy: "Подписка на анонсы будет подключена перед следующим событием.",
    copyright: "© 2026 Цифровой капитал. Все права защищены.",
    policy: "Политика конфиденциальности",
    offer: "Публичная оферта",
  },
  contacts: {
    email: "",
    phone: "",
  },
  socials: [],
};

const ekbSeptemberEvent: EventData = {
  ...ekbArchiveEvent,
  eventId: "ekb-2026-09-26",
  slug: "ekb-2026-09-26",
  badge: "26 сентября · конференция о бизнесе, инвестициях и искусственном интеллекте",
  subtitle:
    "Один день о бизнесе, инвестициях и AI — практические идеи, сильные знакомства и решения для роста капитала и компаний.",
  dateLabel: "26 сентября 2026",
  timeLabel: "12:00 — 17:00",
  cityLabel: "Екатеринбург",
  venueLabel: "БЦ «Саммит» · 8 Марта, 51",
  formatLabel: "Билеты",
  formatDescription: "3 тарифа · от 1 000 ₽",
  programLead: "5 часов живой программы: три выступления, панельная дискуссия и нетворкинг.",
  programDetails: "Бизнес, инвестиции и AI — с фокусом на практические идеи, вопросы из зала и полезные знакомства.",
  program: ekbArchiveEvent.program.filter((item) => item.time !== "17:00"),
  registration: {
    title: "Регистрация на конференцию",
    lead: "26 сентября · Екатеринбург · БЦ «Саммит». Выберите один из трех форматов участия — от 1 000 ₽.",
    ticketTitle: "Билеты от",
    price: "1 000 ₽",
    priceCaption: "три тарифа участия",
    note: "Количество мест ограничено. После заявки команда подтвердит участие и отправит организационные детали.",
    benefits: [
      "Офлайн-участие в конференции",
      "Доступ к основной программе",
      "Нетворкинг с участниками и экспертами",
    ],
    formTitle: "Выберите билет и оставьте заявку",
    formLead: "Оставьте контакты — команда подтвердит получение заявки и свяжется с вами по указанному телефону.",
    tickets: [
      {
        id: "standard-1000",
        name: "Стандарт",
        price: "1 000 ₽",
        description: "Базовое участие",
        benefits: ["Вход на конференцию", "Основная программа", "Нетворкинг-зона"],
      },
      {
        id: "business-3000",
        name: "Бизнес",
        price: "3 000 ₽",
        description: "Расширенный формат",
        benefits: [
          "Всё из тарифа «Стандарт»",
          "Приоритетная посадка",
          "Материалы спикеров после события",
        ],
        highlighted: true,
      },
      {
        id: "vip-5000",
        name: "VIP",
        price: "5 000 ₽",
        description: "Максимум общения",
        benefits: [
          "Всё из тарифа «Бизнес»",
          "Отдельная VIP-зона / networking",
          "Приоритетный доступ к общению со спикерами",
        ],
      },
    ],
  },
  partners: [],
  partnersLead:
    "Партнерские форматы открыты для компаний и сообществ, которым близки темы бизнеса, капитала и технологий.",
  partnersCta: "Стать партнером",
  faq: [
    {
      question: "Когда пройдет конференция?",
      answer: "26 сентября 2026 года с 12:00 до 17:00 в Екатеринбурге.",
    },
    {
      question: "Где пройдет конференция?",
      answer: "БЦ «Саммит», Екатеринбург, ул. 8 Марта, 51. Точный зал и схема прохода будут опубликованы ближе к событию.",
    },
    {
      question: "Какие есть билеты?",
      answer: "Доступны три формата участия: Стандарт — 1 000 ₽, Бизнес — 3 000 ₽ и VIP — 5 000 ₽. Состав каждого тарифа указан в блоке регистрации.",
    },
    {
      question: "Кто выступит?",
      answer: "В программе — Василий Климов, Владислав Бычков и Максим Бумарсков.",
    },
    {
      question: "Можно ли уже зарегистрироваться?",
      answer: "Да. Выберите подходящий тариф в блоке регистрации и оставьте контактные данные. После отправки команда подтвердит получение заявки.",
    },
    {
      question: "Можно ли стать партнером?",
      answer: "Да. Партнерские форматы доступны для компаний и сообществ; детали команда согласует после получения заявки.",
    },
  ],
  location: {
    verified: true,
    description: "Конференция пройдет в деловом центре Екатеринбурга — БЦ «Саммит».",
    venue: "БЦ «Саммит»",
    address: "Екатеринбург, ул. 8 Марта, 51",
    venueDescription: "БЦ «Саммит» расположен в центре Екатеринбурга и подходит для деловой программы, встреч и офлайн-нетворкинга.",
    note: "Точный зал и схема входа будут опубликованы ближе к событию.",
    advantages: ["Центр Екатеринбурга", "Деловой формат площадки", "Удобно для офлайн-нетворкинга"],
    routeUrl: "https://yandex.ru/maps/?text=%D0%95%D0%BA%D0%B0%D1%82%D0%B5%D1%80%D0%B8%D0%BD%D0%B1%D1%83%D1%80%D0%B3%2C%20%D1%83%D0%BB.%208%20%D0%9C%D0%B0%D1%80%D1%82%D0%B0%2C%2051",
  },
  footer: {
    ...ekbArchiveEvent.footer,
    ctaTitle: "Увидимся 26 сентября на «Цифровом капитале»",
    ctaCopy: "Екатеринбург · БЦ «Саммит» · 12:00–17:00. Один день практической программы и нетворкинга.",
    ctaButton: "Зарегистрироваться",
    participantLinks: [
      { label: "Регистрация", href: "#register" },
      { label: "Программа", href: "#program" },
      { label: "FAQ", href: "#faq" },
      { label: "Контакты", href: "#footer-contacts" },
    ],
    newsletterTitle: "Контакты",
    newsletterCopy: "Email организатора: armrobomakers@gmail.com. Телефон будет опубликован дополнительно.",
  },
  contacts: {
    email: "armrobomakers@gmail.com",
    phone: "TODO_ORGANIZER_PHONE",
  },
  socials: [],
};

export const eventContentCatalog: Record<string, EventData> = {
  [ekbArchiveEvent.eventId]: ekbArchiveEvent,
  [ekbSeptemberEvent.eventId]: ekbSeptemberEvent,
};

export function getEventContent(eventId: string): EventData | null {
  return eventContentCatalog[eventId] ?? null;
}

export function getEventContentBySlug(slug: string): EventData | null {
  return Object.values(eventContentCatalog).find((event) => event.slug === slug) ?? null;
}

export function listEventContent(): EventData[] {
  return Object.values(eventContentCatalog);
}
