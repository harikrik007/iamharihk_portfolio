// Everything the site says about Hari lives here. Edit this file to change copy;
// the components only lay it out.

export const profile = {
  name: "Harikrishnan M",
  initials: "HM",
  handle: "harikrishnan.m",
  // The live address. Share previews and search engines use it.
  siteUrl: "https://www.iamharihk.com",
  title: "Senior Software Engineer / AI Researcher",
  company: "Immilearn",
  companyLegalName: "Immilearn India Pvt Ltd",
  companyUrl: "https://immilearn.com",
  school: "College of Engineering, Perumon",
  location: "Kerala, India",
  region: "Kerala",
  countryCode: "IN",
  // Bottom line of the social share image.
  tagline: "AgentBaba · Agent Marketplace · Avatar Studio · ex-Watasale",
  linkedin: "https://www.linkedin.com/in/harikrishnan-m-91a059122/",
  // Leave any of these empty to hide its button. See TODO_CONTENT.md.
  email: "hari@immilearn.com",
  cv: "", // e.g. "/cv/Harikrishnan_M_CV.pdf", placed in public/cv/
  github: "",
  calendar: "", // a Cal.com or Google booking link
  status: "Building Avatar Studio",
  intro:
    "I build the systems AI agents run on: the agentic runtime and harness behind AgentBaba, a database that AI can operate, and the engine that turns an agent into a talking virtual human.",
  description:
    "Harikrishnan M is a Senior Software Engineer / AI Researcher at Immilearn, building AgentBaba's agentic runtime, agent harness, AI-operable database and Avatar Studio's avatar engine.",
};

// Each line links to the chapter it names.
export const bootLog = [
  { process: "android.java", when: "2015", state: "ok", scene: "phone" },
  { process: "embedded.watasale", when: "2018", state: "ok", scene: "cart" },
  { process: "founder.cratehunt", when: "2019", state: "ok", scene: "crosshair" },
  { process: "vision.plates", when: "2022", state: "ok", scene: "plate" },
  { process: "agentic.runtime", when: "2024", state: "ok", scene: "database" },
  { process: "avatar.engine", when: "now", state: "run", scene: "face" },
] as const;

export const stats = [
  { value: "2015", label: "first app shipped" },
  { value: "4", label: "live AI products" },
  { value: "1st", label: "autonomous store in India, on my embedded software and AI models" },
];

export const about = {
  heading: "Engineer, researcher, one-time founder.",
  paragraphs: [
    "I started in 2015 writing Android apps in Java. A few years later I was writing the embedded software for Watasale, India's first autonomous store, and training the AI models that let it check people out without a cashier.",
    "In 2019 I co-founded CrateHunt Esports: online PUBG tournaments with cash prizes. We built the MVP, learned that teenagers love to compete but rarely have money to spend, and shut it down. It taught me more about product than any job had. In 2022 I worked at a stealth startup that collects parking, toll and fuel payments by reading number plates, on a stack that is now patent-pending in the US.",
    "Since 2024 I've been at Immilearn building AgentBaba: the runtime its agents run on, the harness that lets non-developers build their own, a database that AI can operate, and the engine behind Avatar Studio's talking virtual humans.",
  ],
  facts: [
    { label: "Based in", value: "Kerala, India" },
    { label: "Works at", value: "Immilearn India Pvt Ltd" },
    {
      label: "Studied",
      value: "BTech, Electrical, Electronics & Communication · College of Engineering, Perumon · 2011–15",
    },
    { label: "Right now", value: "Building Avatar Studio" },
  ],
};

export type Era = {
  scene: "phone" | "cart" | "crosshair" | "plate" | "knot";
  years: string;
  title: string;
  subtitle: string;
  body: string;
  points?: string[];
  note?: string;
};

export const journey: Era[] = [
  {
    scene: "phone",
    years: "2015 – 2018",
    title: "Mobile first",
    subtitle: "iROID Technologies · Independent · Better Tomorrow Online",
    body: "I learned to ship on phones: native Android in Java at iROID Technologies, apps I built for my own clients, then mobile applications at Better Tomorrow Online. Today I write mobile in Flutter.",
    points: [
      "At Better Tomorrow Online, part of the team that integrated AEPS (Aadhaar Enabled Payment System) for Federal Bank with NPCI.",
    ],
  },
  {
    scene: "cart",
    years: "2018 – 2019",
    title: "Watasale",
    subtitle: "India's first autonomous store",
    body: "A shop with no cashier: walk in, pick up what you want, walk out.",
    points: [
      "Main developer of the embedded software that powered the store.",
      "Trained the AI models that spot each product and the shopper who picks it up or puts it back, so the right person is billed: cashierless checkout in the spirit of Amazon Go.",
      "Built the training and inference pipeline for those models.",
    ],
    note: "Watasale was later acquired by Amazon. I had moved on in 2019, before the deal.",
  },
  {
    scene: "crosshair",
    years: "2019 – 2024",
    title: "CrateHunt Esports",
    subtitle: "Co-founder · a two-person startup",
    body: "Online tournaments for PUBG players, with cash prizes for the winners. We built the MVP and ran it, then shut it down. Our players were mostly teenagers: they loved to compete but had little to spend, and no amount of engineering changes that.",
    note: "What it taught me: before you build something, make sure the people who will use it can pay for it.",
  },
  {
    scene: "plate",
    years: "2022",
    title: "Stealth startup",
    subtitle: "Parking, toll and fuel payments, by number plate",
    body: "A camera reads a vehicle's number plate, the system confirms which vehicle it really is, and the owner is charged automatically. It works for parking fees and tolls, and at petrol pumps too: fill up and drive off, and the bill is debited without a stop at the counter.",
    points: [
      "Vehicle plate identification from camera feeds.",
      "Vehicle identity cross-matching, so the right vehicle is charged.",
      "A proprietary stack, with a US patent pending.",
    ],
  },
  {
    scene: "knot",
    years: "2024 – now",
    title: "Immilearn",
    subtitle: "Senior Software Engineer / AI Researcher",
    body: "Back with a team of ex-Watasale and ex-Amazon engineers, building AgentBaba: an AI-native platform where autonomous workers run a business's operations. I work across the stack, from the agent runtime to the screens people use.",
  },
];

export type Project = {
  scene: "database" | "hub" | "face";
  name: string;
  url: string;
  kicker: string;
  summary: string;
  role: string;
  built: string[];
  facts: string[];
  status?: string;
  // Optional extras, each hidden until filled in (see TODO_CONTENT.md).
  // A real number, shown in place of the status badge, e.g. "12k minutes talked".
  metric?: string;
  // One result in a sentence.
  impact?: string;
  // A screenshot in public/work/<slug>/, optionally with a short muted loop.
  media?: { src: string; alt: string; width: number; height: number; webm?: string; mp4?: string };
  // Draws the AgentBaba runtime diagram.
  diagram?: boolean;
};

export const projects: Project[] = [
  {
    scene: "database",
    name: "AgentBaba",
    url: "https://agentbaba.ai",
    kicker: "Autonomous AI workspace",
    summary:
      "One workspace where AI workers, apps, email, calls, calendar and files stay in sync, and agents keep working in the background.",
    role: "Backend & frontend engineer",
    built: [
      "The agentic runtime that runs AI workers autonomously in the background.",
      "AgentBaba's proprietary database, designed so AI can operate it directly.",
      "Frontend and backend across the platform.",
    ],
    facts: ["AI workers", "Internal & external app builders", "Email, calls & SMS", "AI Drive", "Studio"],
    diagram: true,
  },
  {
    scene: "hub",
    name: "Agent Marketplace",
    url: "https://agentbaba.ai/agent-marketplace",
    kicker: "AI workers for everyone",
    summary:
      "Hire a ready-made AI worker, or build your own, without a technical background. Our way of socialising AI for a general audience.",
    role: "Frontend, backend & agent harness",
    built: [
      "The harness every marketplace agent runs on.",
      "Frontend and backend for hiring, building and managing workers.",
    ],
    facts: ["27 ready-made workers", "40+ connectors", "WhatsApp, calls & email", "Worker teams"],
  },
  {
    scene: "face",
    name: "Avatar Studio",
    url: "https://avatar.agentbaba.ai",
    kicker: "Talking virtual humans for websites",
    summary:
      "Pick a face and a voice, teach it your business, add one line of code. Visitors talk to it face to face, in their own words.",
    role: "Frontend & backend · avatar engine",
    built: [
      "A proprietary avatar engine, taken from R&D to production.",
      "Frontend and backend of the product.",
    ],
    facts: ["One-line embed", "34 voices, 10 Indian-English", "Answers from your documents", "Acts on your page", "Billed by the minute"],
    status: "Gaining traction",
  },
];

export const skills = [
  {
    group: "Agentic AI",
    items: ["Agent runtimes", "Harness engineering", "Tool use & actions", "Multi-agent workflows", "Agent memory & state"],
  },
  {
    group: "Machine learning & R&D",
    items: [
      "LLM applications",
      "Product & person detection",
      "Training & inference pipelines",
      "Computer vision for cashierless retail",
      "Real-time avatar engines",
    ],
  },
  { group: "Web & backend", items: ["FastAPI", "Django", "Next.js", "React"] },
  { group: "Mobile", items: ["Flutter", "Java / Android"] },
  { group: "Systems", items: ["Embedded software", "IoT", "Database design"] },
  { group: "Languages", items: ["Python", "JavaScript / TypeScript", "Dart", "Java", "C / C++"] },
];

export const liveProducts = [
  { name: "AgentBaba", url: "https://agentbaba.ai" },
  { name: "Studio", url: "https://studio.agentbaba.ai" },
  { name: "Avatar Studio", url: "https://avatar.agentbaba.ai" },
  { name: "Agent Marketplace", url: "https://agentbaba.ai/agent-marketplace" },
];

export const contact = {
  heading: "Let's talk agents.",
  body: "Building something with AI agents, avatars or a new product idea? I'd love to hear about it.",
};
