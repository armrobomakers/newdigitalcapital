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
};

export type PartnerItem = {
  name: string;
};

export type FaqItem = {
  question: string;
  answer: string;
};

export const eventData = {
  slug: "ekb",
  name: "Цифровой капитал",
  badge: "Конференция о бизнесе, инвестициях и искусственном интеллекте",
  subtitle:
    "Бизнес, инвестиции и искусственный интеллект — для роста капитала, компаний и сильного окружения.",
  heroCta: "Зарегистрироваться",
  programCta: "Смотреть программу",
  dateLabel: "13 июня 2026",
  timeLabel: "12:00 — 17:00",
  cityLabel: "Екатеринбург",
  venueLabel: "БЦ «Саммит»",
  formatLabel: "Формат участия",
  navItems: [
    { label: "Программа", href: "#program" },
    { label: "Спикеры", href: "#speakers" },
    { label: "Для кого", href: "#audience" },
    { label: "Партнеры", href: "#partners" },
    { label: "Локация", href: "#location" },
    { label: "FAQ", href: "#faq" },
  ] satisfies NavItem[],
  stats: [
    { value: "500+", label: "участников офлайн и онлайн" },
    { value: "40+", label: "спикеров-практиков и экспертов" },
    { value: "8", label: "часов контента и нетворкинга" },
    { value: "20+", label: "партнеров и инвесторов" },
  ] satisfies StatItem[],
  audience: [
    {
      title: "Предпринимателям",
      description:
        "Конференция для предпринимателей, которым нужны идеи для роста бизнеса, масштабирования, партнерств и привлечения капитала в Екатеринбурге.",
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
  ] satisfies AudienceItem[],
  speakers: [
    {
      name: "Василий Климов",
      role: "Спикер",
      company: "SoulMate Club и Искусственный Интеллект",
      topic:
        "Расскажет о развитии сообщества, возможностях клуба и применении искусственного интеллекта в новой цифровой экономике.",
      initials: "ВК",
    },
    {
      name: "Владислав Бычков",
      role: "Спикер",
      company: "Инвестиции с AI Robo Makers — ARM",
      topic:
        "Покажет системный подход к алгоритмическому управлению капиталом, рискам и долгосрочным инвестиционным решениям.",
      initials: "ВБ",
    },
    {
      name: "Максим Бумарсков",
      role: "Спикер",
      company: "Бизнес SoulMate",
      topic:
        "Раскроет возможности бизнес-направления SoulMate, партнерской модели и роста через экосистему.",
      initials: "МБ",
    },
  ] satisfies Speaker[],
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
    },
  ] satisfies ProgramItem[],
  registration: {
    title: "Забронируйте место на конференции",
    lead:
      "Оставьте заявку, и мы свяжемся с вами для подтверждения участия.",
    ticketTitle: "Стандартный билет",
    price: "6 900 ₽",
    priceCaption: "Количество мест ограничено",
    note: "Количество мест ограничено. Регистрация обязательна.",
    benefits: [
      "Живой формат",
      "Доступ ко всем выступлениям",
      "Материалы мероприятия",
      "Нетворкинг с участниками",
      "Сертификат участника",
    ],
    formTitle: "Регистрация",
    formLead: "Заполните форму и получите подтверждение на почту.",
  },
  partners: [
    { name: "SoulMate" },
    { name: "AI Robo Makers" },
    { name: "Digital Capital" },
    { name: "Tech Club" },
    { name: "Future Bank" },
    { name: "Cloudium" },
  ] satisfies PartnerItem[],
  partnersLead:
    "Представьте свой бренд на главной бизнес-площадке события, получите доступ к предпринимателям, инвесторам и экспертному окружению.",
  partnersCta: "Стать партнером",
  partnersLabel: "Партнерский пакет",
  faq: [
    {
      question: "Как принять участие?",
      answer:
        "Оставьте заявку в форме регистрации. После отправки мы подтвердим участие и пришлем детали на указанный контакт.",
    },
    {
      question: "Где пройдет конференция?",
      answer:
        "В Екатеринбурге, в БЦ «Саммит». Точный маршрут и схема прохода доступны в блоке локации ниже.",
    },
    {
      question: "Будет ли онлайн-трансляция?",
      answer:
        "Мы ориентируемся на очный формат, а доступ к материалам и деталям подтверждаем после регистрации.",
    },
    {
      question: "Что входит в стоимость билета?",
      answer:
        "Выступления, материалы спикеров, кофе-брейк, нетворкинг и вечерний формат общения после основной программы.",
    },
    {
      question: "Можно ли прийти командой?",
      answer:
        "Да, можно. Для команды лучше оформить отдельную заявку на каждого участника, чтобы мы подготовили доступ и билеты.",
    },
    {
      question: "Будет ли ужин со спикерами?",
      answer:
        "Да. После основной части предусмотрен закрытый ужин со спикерами в отдельном формате.",
    },
  ] satisfies FaqItem[],
  location: {
    venue: "БЦ «Саммит»",
    address: "Екатеринбург, ул. Малышева, 51",
    note:
      "Точная информация по входу и встрече гостей будет отправлена участникам после регистрации.",
    advantages: [
      "5 минут от метро",
      "Удобный подъезд",
      "Комфортный зал для мероприятия",
    ],
    routeUrl: "https://yandex.ru/maps/",
  },
  footer: {
    ctaTitle: "Присоединяйтесь к конференции «Цифровой капитал»",
    ctaCopy:
      "Получите доступ к экспертам, новым идеям, деловым контактам и возможностям для роста.",
    ctaButton: "Зарегистрироваться",
    about: "Конференция о бизнесе, инвестициях и искусственном интеллекте.",
    participantTitle: "Участнику",
    participantLinks: [
      { label: "Регистрация", href: "#register" },
      { label: "Материалы", href: "#program" },
      { label: "Новости", href: "#faq" },
      { label: "Контакты", href: "#footer-contacts" },
    ],
    newsletterTitle: "Будьте в курсе",
    newsletterCopy: "Оставьте email, чтобы получить материалы и новости мероприятия.",
    copyright: "© 2026 Цифровой капитал. Все права защищены.",
    policy: "Политика конфиденциальности",
    offer: "Публичная оферта",
  },
  contacts: {
    email: "info@digitalcapital.ru",
    phone: "+7 (343) 123-45-67",
  },
  socials: [
    { label: "Telegram", href: "#", short: "TG" },
    { label: "LinkedIn", href: "#", short: "IN" },
    { label: "YouTube", href: "#", short: "YT" },
    { label: "VK", href: "#", short: "VK" },
  ],
} as const;

export type EventData = typeof eventData;
