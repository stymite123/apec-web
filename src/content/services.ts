import { z } from "zod";

import { processStepSchema, serviceSchema } from "./schema";
import { team } from "./team";

/** DRAFT copy throughout — see docs/COPY_REVIEW.md. One discipline per member. */
export const services = z
  .array(serviceSchema)
  .parse([
    {
      slug: "seo",
      title: "SEO & Machine Learning",
      summary:
        "Technical and on-page SEO, keyword research and analytics, with machine learning where your data can sharpen decisions.",
      lead: "muhammad-huzaifa",
    },
    {
      slug: "ai-agents",
      title: "AI Agents & Automation",
      summary:
        "LLM agents, workflow and CRM automation, and API integrations that take repetitive work off your team.",
      lead: "mustafa-ishaq",
    },
    {
      slug: "web",
      title: "Web Development",
      summary: "Fast, accessible websites that are easy to update and built to be found.",
      lead: "hamad-alam",
    },
    {
      slug: "mobile-apps",
      title: "Mobile Apps",
      summary: "Mobile apps from first prototype to release, designed around how people use them.",
      lead: "mian-faizyab",
    },
    {
      slug: "brand-design",
      title: "Brand & Graphic Design",
      summary: "Brand identity and graphic design that keep every touchpoint consistent.",
      lead: "abdur-rahman",
    },
  ])
  .map((service) => {
    if (!team.some((member) => member.slug === service.lead)) {
      throw new Error(`services: lead "${service.lead}" is not a team member`);
    }
    return service;
  });

/** Brief §8.1 #7: Discover → Design → Build (AI-accelerated) → Launch & Grow. */
export const processSteps = z.array(processStepSchema).parse([
  {
    title: "Discover",
    summary: "We learn your goals, audience and constraints, and agree what success looks like.",
  },
  {
    title: "Design",
    summary: "Structure, brand and interface are shaped and agreed before anything is built.",
  },
  {
    title: "Build",
    summary:
      "Specialists build with AI tools for speed, and review every line and pixel themselves.",
  },
  {
    title: "Launch & Grow",
    summary: "We ship, measure and keep improving search, speed and conversion.",
  },
]);
