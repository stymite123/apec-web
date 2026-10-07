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
      bio: "TODO: bio (60–120 words)",
      accent: "ice",
      portrait: portrait("hamad-alam", "Hamad Alam"),
      availability: "TODO: availability (ok to show?)",
      skills: [
        skill("Web development", true),
        skill("HTML/CSS/JavaScript", false),
        skill("React", false),
        skill("Next.js", false),
        skill("WordPress / Shopify", false),
      ],
      tools: [],
      services: ["web"],
      experience: [],
      projects: [],
      socials: [],
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
