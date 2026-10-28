import { siteSchema } from "./schema";

/**
 * Site-wide copy and settings. Decisions: docs/DECISIONS.md.
 * Strings marked DRAFT were written by Claude from known facts only and are
 * listed in docs/COPY_REVIEW.md for the team's approval.
 */
export const site = siteSchema.parse({
  name: "APEC Digital",
  shortName: "APEC",
  expansion: "Agency for Professionals, Experienced & Creatives",
  tagline: "Innovate | Grow | Succeed",
  headline: {
    lines: ["Agency for", "Professionals,", "Experienced", "& Creatives"],
    accent: "Creatives",
  },
  // DRAFT
  subheadline:
    "Five specialists, one standard. Search, AI agents, websites, mobile apps and brand design, each led by the person who actually does the work.",
  // DRAFT
  description:
    "APEC Digital is a five-person studio from Pakistan for SEO, AI agents, web development, mobile apps and brand design, working with clients worldwide.",
  location: "Pakistan · Remote · Worldwide",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  themeColor: "#0B1233",
  nav: [
    { label: "Team", href: "/#team" },
    { label: "Services", href: "/#services" },
    { label: "Process", href: "/#process" },
    { label: "Contact", href: "/#contact" },
  ],
  cta: { label: "Contact", href: "/#contact" },
  heroCtas: [
    { label: "Meet the five", href: "/#team" },
    { label: "Start a project", href: "/#contact" },
  ],
  sections: {
    // DRAFT
    manifesto: {
      lines: ["AI makes us fast.", "Specialists make it right.", "You get both."],
    },
    team: {
      id: "team",
      title: "The Five",
    },
    services: {
      id: "services",
      title: "What we do",
      ledBy: "Led by",
    },
    process: {
      id: "process",
      title: "How we work",
    },
    contact: {
      id: "contact",
      title: "Bring your next build to APEC.",
      // DRAFT
      intro: "Tell us what you’re building. Email or WhatsApp — whichever is easier for you.",
      emailLabel: "Email us",
      whatsappLabel: "WhatsApp us",
      emailTerm: "Email",
      phoneTerm: "Phone / WhatsApp",
      whatsappMessage: "Hi APEC Digital, I'd like to talk about a project.",
    },
  },
  member: {
    workWith: "Work with {name}",
    emailLabel: "Email",
    cvLabel: "Download CV",
    whatsappMessage:
      "Hi {name}, I found you on the APEC Digital website and I'd like to talk about a project.",
    emailSubject: "Project enquiry for {name}",
    breadcrumbTeam: "Team",
    currently: "Currently",
    about: "About",
    skills: "Skills",
    tools: "Toolbelt",
    experience: "Experience",
    projects: "Projects",
    projectsComing: "More case studies coming.",
    ctaTitle: "Have a project for {name}?",
    previous: "Previous",
    next: "Next",
    allMembers: "All five",
    present: "Present",
  },
  notFound: {
    pageTitle: "Page not found",
    eyebrow: "404",
    title: "This peak doesn’t exist.",
    cta: { label: "Back to home", href: "/" },
  },
  labels: {
    skipLink: "Skip to content",
    openMenu: "Open menu",
    menuTitle: "Menu",
    footerExplore: "Explore",
    footerContact: "Contact",
    whatsapp: "WhatsApp",
    scrollCue: "Scroll",
  },
  contact: {
    email: "contact.apecdigital@gmail.com",
    phone: "+92 326 5698123",
    whatsapp: "923265698123",
  },
  socials: [],
});
