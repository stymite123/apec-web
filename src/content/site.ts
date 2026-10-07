import { siteSchema } from "./schema";

/** Site-wide copy and settings. Decisions: docs/DECISIONS.md (2026-10-07/08). */
export const site = siteSchema.parse({
  name: "APEC Digital",
  shortName: "APEC",
  expansion: "Agency for Professionalism, Experience and Creativity",
  tagline: "Innovate | Grow | Succeed",
  headline: { lead: "Five specialists.", accent: "One", tail: "apex." },
  subheadline:
    "TODO: sub-headline — the brief §1 draft says “web apps”; revise for the current five roles (owner: Muhammad Huzaifa, SEO)",
  description: "TODO: SEO meta description (owner: Muhammad Huzaifa, SEO)",
  location: "Pakistan · Remote · Worldwide",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  themeColor: "#05060A",
  nav: [
    { label: "Team", href: "/#team" },
    { label: "Services", href: "/#services" },
    { label: "Process", href: "/#process" },
    { label: "Contact", href: "/#contact" },
  ],
  cta: { label: "Start a project", href: "/#contact" },
  heroCtas: [
    { label: "Meet the five", href: "/#team" },
    { label: "Start a project", href: "/#contact" },
  ],
  homeSections: [
    { id: "team", title: "The Five" },
    { id: "services", title: "Services" },
    { id: "process", title: "Process" },
    { id: "contact", title: "Contact" },
  ],
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
  },
  contact: {
    email: "contact.apecdigital@gmail.com",
    phone: "+92 326 5698123",
    whatsapp: "923265698123",
  },
  socials: [],
});
