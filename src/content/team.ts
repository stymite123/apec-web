import { teamSchema } from "./schema";

/**
 * The five (brief §9.2; names/titles from the agency flyer — DECISIONS 2026-10-08).
 * Facts only. `confirmed: true` = a skill we were told about (brief "known skills" /
 * flyer title); its level stays TODO until the member confirms it. Candidate skills
 * (`confirmed: false`) never render in production.
 * Headlines are DRAFTS for approval (docs/COPY_REVIEW.md).
 */
const skill = (name: string, confirmed: boolean) => ({
  name,
  level: "TODO: level",
  group: "TODO: group",
  confirmed,
});

const portrait = (slug: string, name: string) => ({
  src: `/team/${slug}.jpg`,
  alt: `Portrait of ${name}`,
});

export const team = teamSchema
  .parse([
    {
      slug: "muhammad-huzaifa",
      order: 1,
      name: "Muhammad Huzaifa",
      callName: "Huzaifa",
      role: "SEO & ML Engineer",
      headline: "SEO and machine learning, focused on search visibility you can measure.",
      bio: "TODO: bio (60–120 words)",
      accent: "silver",
      portrait: portrait("muhammad-huzaifa", "Muhammad Huzaifa"),
      availability: "TODO: availability (ok to show?)",
      skills: [
        skill("SEO", true),
        skill("Machine learning", true),
        skill("Technical SEO", false),
        skill("Keyword research", false),
        skill("Google Search Console", false),
        skill("GA4", false),
      ],
      tools: [],
      services: ["seo"],
      experience: [],
      projects: [],
      socials: [],
    },
    {
      slug: "mustafa-ishaq",
      order: 2,
      name: "Mustafa Ishaq",
      role: "AI Agent Engineer",
      headline: "AI agents and automation that take repetitive work off your team.",
      bio: "TODO: bio (60–120 words)",
      accent: "brand",
      portrait: portrait("mustafa-ishaq", "Mustafa Ishaq"),
      availability: "TODO: availability (ok to show?)",
      currently: { title: "AI Engineer", org: "Atlus Bank (USA)", public: true },
      skills: [
        skill("Python 3", true),
        skill("Claude Code", true),
        skill("OpenClaw", true),
        skill("LLM agents", false),
        skill("Workflow automation", false),
        skill("CRM & email automation", false),
        skill("API integrations", false),
      ],
      tools: [],
      services: ["ai-agents"],
      experience: [
        {
          title: "AI Engineer",
          org: "Atlus Bank (USA)",
          start: "TODO: start date",
          summary: "TODO: 1–2 line summary",
        },
      ],
      projects: [],
      socials: [],
    },
    {
      slug: "hamad-alam",
      order: 3,
      name: "Hamad Alam",
      role: "Web Developer",
      headline: "Websites that load fast, read clearly and are easy to keep up to date.",
      // From his own portfolio (hamadalamportfolio.vercel.app), condensed.
      bio: "Hamad builds modern web experiences that combine thoughtful design, responsive layouts and reliable performance. He works at the meeting point of motion and clean architecture, with semantic HTML, modular CSS and modern JavaScript, so a site stays quick to load and easy to maintain long after launch. Every animation, breakpoint and interaction is built to hold attention without costing speed or accessibility, and each build is checked across browsers and screen sizes before it ships.",
      accent: "ice",
      portrait: portrait("hamad-alam", "Hamad Alam"),
      cv: "/cv/hamad-alam.pdf",
      availability: "TODO: availability (ok to show?)",
      skills: [
        skill("Web development", true),
        skill("Responsive web design", true),
        skill("UI/UX design", true),
        skill("Website optimisation", true),
        skill("Scroll and motion work", true),
      ],
      tools: [
        "React",
        "Next.js",
        "TypeScript",
        "JavaScript",
        "HTML",
        "CSS",
        "Tailwind CSS",
        "GSAP",
        "Three.js",
        "Node.js",
        "Express",
        "Supabase",
        "PostgreSQL",
        "Firebase",
        "MongoDB",
        "Vite",
        "Git",
        "Vercel",
      ],
      services: ["web"],
      experience: [],
      projects: [
        {
          slug: "wholesale",
          title: "WholeSale",
          summary:
            "A wholesale storefront: product listing, categories and enquiry flow, built to stay fast on slow connections.",
          role: "Design and build",
          stack: ["HTML", "CSS", "JavaScript"],
          link: "https://whole-sale-seven.vercel.app",
          cover: "/portfolio/work/hamad-1.webp",
          featured: true,
        },
        {
          slug: "noor",
          title: "Islamic Noor",
          summary:
            "A content site for Islamic resources, with clear reading typography and a structure that is easy to extend.",
          role: "Design and build",
          stack: ["HTML", "CSS", "JavaScript"],
          link: "https://islamic-noor-mu.vercel.app",
          cover: "/portfolio/work/hamad-2.webp",
        },
        {
          slug: "second-one",
          title: "SecondOne",
          summary:
            "A business site built from first principles, with no framework weight on the page.",
          role: "Design and build",
          stack: ["HTML", "CSS", "JavaScript"],
          link: "https://second-one-silk.vercel.app",
          cover: "/portfolio/work/hamad-3.webp",
        },
      ],
      socials: [
        { platform: "github", url: "https://github.com/HamadAlam311" },
        { platform: "website", url: "https://hamadalamportfolio.vercel.app" },
      ],
    },
    {
      slug: "mian-faizyab",
      order: 4,
      name: "Mian Faizyab",
      callName: "Faizyab",
      role: "App Developer",
      headline: "Mobile apps, from first prototype to release.",
      bio: "TODO: bio (60–120 words)",
      accent: "cobalt",
      portrait: portrait("mian-faizyab", "Mian Faizyab"),
      availability: "TODO: availability (ok to show?)",
      skills: [skill("Mobile app development", true)],
      tools: [],
      services: ["mobile-apps"],
      experience: [],
      projects: [],
      socials: [],
    },
    {
      slug: "abdur-rahman",
      order: 5,
      name: "Abdur Rahman",
      role: "Graphic Designer",
      headline: "Brand and graphic design that keep every touchpoint consistent.",
      bio: "TODO: bio (60–120 words)",
      accent: "wine",
      portrait: portrait("abdur-rahman", "Abdur Rahman"),
      availability: "TODO: availability (ok to show?)",
      skills: [
        skill("Graphic design", true),
        skill("Brand identity", false),
        skill("Figma", false),
        skill("Adobe Creative Cloud", false),
        skill("Social creatives", false),
      ],
      tools: [],
      services: ["brand-design"],
      experience: [],
      projects: [],
      socials: [],
    },
  ])
  .sort((a, b) => a.order - b.order);

type Member = (typeof team)[number];

export const callName = (member: Member) => member.callName ?? member.name.split(" ")[0];

export const getMember = (slug: string) => team.find((member) => member.slug === slug);

/** Shown skills: confirmed only in production; everything in dev. */
export const visibleSkills = (member: Member) =>
  process.env.NODE_ENV === "production" ? member.skills.filter((s) => s.confirmed) : member.skills;
