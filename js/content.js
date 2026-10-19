/*
  ──────────────────────────────────────────────────────────────
  CONTENT: edit your text here.

  Everything on the site (map levels, quest log, achievements,
  inventory, contact) is rendered from this one object, so you
  never need to touch the game engine in main.js to update it.

  Rules of thumb
  - Keep exactly 9 levels: the world map has 9 stops.
  - `world` on a level points at worlds[].id.
  - Plain text only (no HTML) in every field.
  ──────────────────────────────────────────────────────────────
*/
window.CONTENT = {
  name: "Hari Krishnan",
  fullName: "Hari Krishnan A J",
  role: "Backend & AI Engineer",
  location: "Hyderabad, India",

  // Stored in two halves so simple scrapers can't harvest it from the HTML.
  email: { user: "hariiajkrishnan", domain: "gmail.com" },
  emailSubject: "Hello Hari",

  resume: "assets/Hari-Krishnan-Resume.pdf",

  worlds: [
    { id: 1, name: "CAMPUS", org: "Shiv Nadar University, Chennai", when: "2021 – 2025", color: "#2F7A3A" },
    { id: 2, name: "STARTUP WOODS", org: "Interain AI, Chennai", when: "Aug 2023 – Feb 2024", color: "#1F6B4F" },
    { id: 3, name: "KARBONWISE CITY", org: "Karbonwise, Hyderabad", when: "Mar 2024 – now", color: "#3F4A8C" },
    { id: 4, name: "???", org: "Loading the next level…", when: "", color: "#6B3FA0" }
  ],

  levels: [
    {
      code: "1-1", world: 1, when: "2021 – 2025",
      title: "TUTORIAL: CAMPUS",
      text: "Shiv Nadar University, Chennai. A B.Tech in Computer Science with an IoT specialisation: four years of learning the controls, finished with an 8.8 CGPA.",
      loot: ["8.8 CGPA", "B.Tech CSE (IoT)"]
    },
    {
      code: "2-1", world: 2, when: "Aug 2023",
      title: "FIRST HIRE",
      text: "Joined Interain AI as its very first engineer, while still a student. Then grew and guided a 15-person team, six of them developers.",
      loot: ["Founding engineer", "Team of 15"]
    },
    {
      code: "2-2", world: 2, when: "2023",
      title: "THE ADAPTIVE COACH",
      text: "Built an AI interview-practice tool on Next.js and FastAPI. Its questions adjust to each student's history, and it shows them exactly where they're strong and what to work on next.",
      loot: ["100 active users"]
    },
    {
      code: "2-3", world: 2, when: "2023 – 2024",
      title: "FIVE COLLEGES",
      text: "Took the product on the road. Live demos and pilots turned five Chennai colleges into early partners.",
      loot: ["5 college partners"]
    },
    {
      code: "3-1", world: 3, when: "2024 – now",
      title: "THE 20-MILLION HAYSTACK",
      text: "Customers describe materials in their own words; the right emission factor hides among 20 million. My four-stage search finds it: keyword and fuzzy matching, meaning-based vector search, score fusion, then a reranker that reads every candidate closely.",
      loot: ["≈90% accuracy", "20M factors"]
    },
    {
      code: "3-2", world: 3, when: "2024 – now",
      title: "THE LEARNING LOOP",
      text: "Every correction teaches the system something. Ranking adapts to each account's history, cutting hand-mapping on a typical 500-item project by around 60%.",
      loot: ["−60% manual work"]
    },
    {
      code: "3-3", world: 3, when: "2024 – now",
      title: "THE GREAT REBUILD",
      text: "Led six engineers through a two-month rebuild of the services, database and APIs, then moved every live customer onto the new multi-tenant platform without a second of downtime.",
      loot: ["0 downtime", "6 engineers led"]
    },
    {
      code: "3-4", world: 3, when: "2024 – now",
      title: "BORDER FORTRESS",
      text: "Europe started pricing the carbon inside imported goods (CBAM). With a team of three, I turned the regulation into a working product in three months, covering all six sectors, and onboarded five exporters.",
      loot: ["3 months", "5 exporters", "−70% data entry"]
    },
    {
      code: "4-?", world: 4, when: "Next",
      title: "THE NEXT LEVEL",
      text: "The map ends here, for now. Looking for someone to lead search, AI or backend work? Press CONTINUE at the bottom of the page and let's play the next level together.",
      loot: ["Your team?"]
    }
  ],

  // Index (0-based) of the level that represents "today". The intro walk stops here.
  nowLevel: 7,

  sideQuests: {
    world: 3,
    title: "SIDE QUESTS CLEARED",
    items: [
      "Ask-your-data analytics: plain-language questions, charts on demand",
      "Fifty sources, one library: new data feeds in hours, not days",
      "PCR ingestion automated: ≈70% less setup, 100+ PCRs covered",
      "Revit plugin: building imports from hours to minutes",
      "Self-serve trial portal: 200+ sign-ups across several regions"
    ]
  },

  // num counts up when the card scrolls into view; pre/post wrap it.
  achievements: [
    { pre: "", num: 20, post: "M", label: "emission factors made searchable" },
    { pre: "≈", num: 90, post: "%", label: "match accuracy against expert analysts" },
    { pre: "-", num: 60, post: "%", label: "hand-mapping on a typical project" },
    { pre: "", num: 0, post: " MIN", label: "downtime moving every live customer" },
    { pre: "", num: 3, post: " MO", label: "from EU regulation to working product" },
    { pre: "", num: 15, post: "+", label: "enterprise clients on the platform" },
    { pre: "", num: 200, post: "+", label: "self-serve trial sign-ups" },
    { pre: "", num: 15, post: "", label: "teammates led as first hire" }
  ],

  inventory: [
    { slot: "SPELLS", plain: "AI & search", items: ["RAG", "Hybrid search", "Embeddings", "Reranking", "pgvector", "FAISS", "Retrieval evals", "Prompt engineering", "LLM integration"] },
    { slot: "WEAPONS", plain: "languages", items: ["Python", "TypeScript", "JavaScript", "SQL", "C++"] },
    { slot: "TOOLS", plain: "backend", items: ["FastAPI", "Django", "Flask", "REST APIs", "ETL pipelines"] },
    { slot: "TREASURE VAULT", plain: "data", items: ["PostgreSQL", "Full-text & trigram search", "Redis", "MongoDB", "MySQL"] },
    { slot: "VEHICLES", plain: "cloud & ops", items: ["AWS", "Docker", "Nginx", "Linux", "Jenkins · CI/CD", "Flyway", "Git"] }
  ]
};
