import { z } from "zod";

import { TODO_PREFIX } from "@/lib/todo";

/**
 * Content schemas (brief §9.1). Every content file is parsed at module load,
 * so invalid data fails `next build`. Import content only from Server Components
 * (pass plain props to client components) so zod stays out of the browser bundle.
 *
 * Unknown content is a string starting with "TODO:". TODO strings skip the
 * length/word-count rules; in production they are not rendered (see lib/todo.ts).
 */

const todo = z.string().startsWith(TODO_PREFIX);

/** A real value that passes `schema`, or a TODO placeholder. */
const orTodo = <T extends z.ZodType>(schema: T) => z.union([todo, schema]);

const nonEmpty = z.string().trim().min(1);

const wordCount = (min: number, max: number) =>
  nonEmpty.refine(
    (value) => {
      const words = value.split(/\s+/).filter(Boolean).length;
      return words >= min && words <= max;
    },
    { message: `must be ${min}–${max} words` },
  );

export const skillLevelSchema = z.enum(["expert", "advanced", "proficient"]);
export const accentSchema = z.enum(["silver", "brand", "ice", "cobalt", "wine"]);
export const availabilitySchema = z.enum(["available", "limited", "booked"]);
export const socialPlatformSchema = z.enum([
  "linkedin",
  "github",
  "behance",
  "dribbble",
  "x",
  "fiverr",
  "upwork",
  "website",
  "email",
]);

const skillSchema = z
  .object({
    name: nonEmpty,
    level: orTodo(skillLevelSchema),
    group: orTodo(nonEmpty),
    confirmed: z.boolean(),
  })
  .refine((skill) => !skill.confirmed || !skill.level.startsWith(TODO_PREFIX), {
    message: "a confirmed skill needs a real level",
  });

const experienceSchema = z.object({
  title: nonEmpty,
  org: nonEmpty,
  start: orTodo(nonEmpty),
  end: z.string().optional(),
  summary: orTodo(nonEmpty),
  highlights: z.array(nonEmpty).optional(),
});

const projectSchema = z.object({
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: nonEmpty,
  summary: orTodo(nonEmpty),
  role: orTodo(nonEmpty),
  stack: z.array(nonEmpty),
  outcome: z.string().optional(),
  link: z.url().optional(),
  cover: z.string().optional(),
  featured: z.boolean().optional(),
});

export const teamMemberSchema = z.object({
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  order: z.literal([1, 2, 3, 4, 5]),
  name: nonEmpty,
  role: nonEmpty,
  headline: orTodo(nonEmpty.max(90)),
  bio: orTodo(wordCount(60, 120)),
  accent: accentSchema,
  portrait: z.object({ src: nonEmpty, alt: nonEmpty }).optional(),
  location: z.string().optional(),
  timezone: z.string().optional(),
  availability: orTodo(availabilitySchema),
  currently: z.object({ title: nonEmpty, org: nonEmpty, public: z.boolean() }).optional(),
  yearsExperience: z.number().int().nonnegative().optional(),
  languages: z.array(nonEmpty).optional(),
  skills: z.array(skillSchema),
  tools: z.array(nonEmpty),
  services: z.array(nonEmpty),
  experience: z.array(experienceSchema),
  projects: z.array(projectSchema),
  certifications: z
    .array(
      z.object({
        name: nonEmpty,
        issuer: nonEmpty,
        year: z.number().int().optional(),
        url: z.url().optional(),
      }),
    )
    .optional(),
  education: z
    .array(
      z.object({
        degree: nonEmpty,
        school: nonEmpty,
        year: z.number().int().optional(),
      }),
    )
    .optional(),
  socials: z.array(z.object({ platform: socialPlatformSchema, url: z.url() })),
  cvPdf: z.string().optional(),
  seo: z.object({ title: z.string().optional(), description: z.string().optional() }).optional(),
});

export const teamSchema = z
  .array(teamMemberSchema)
  .length(5)
  .superRefine((team, ctx) => {
    const slugs = new Set(team.map((m) => m.slug));
    if (slugs.size !== team.length) {
      ctx.addIssue({ code: "custom", message: "member slugs must be unique" });
    }
    const orders = new Set(team.map((m) => m.order));
    if (orders.size !== team.length) {
      ctx.addIssue({ code: "custom", message: "member order must be unique (1–5)" });
    }
  });

const linkSchema = z.object({ label: nonEmpty, href: nonEmpty });

export const siteSchema = z.object({
  name: nonEmpty,
  shortName: nonEmpty,
  expansion: orTodo(nonEmpty),
  tagline: orTodo(nonEmpty),
  /** Hero headline; `accent` is set in the serif italic (brief §6.3: one word max). */
  headline: z.object({ lead: nonEmpty, accent: nonEmpty, tail: nonEmpty }),
  subheadline: orTodo(nonEmpty),
  description: orTodo(nonEmpty.max(160)),
  location: orTodo(nonEmpty),
  url: z.url(),
  themeColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  nav: z.array(linkSchema).min(1),
  cta: linkSchema,
  heroCtas: z.array(linkSchema),
  /** Home page sections, in order; `id` is the anchor used by the nav. */
  homeSections: z.array(z.object({ id: z.string().regex(/^[a-z-]+$/), title: nonEmpty })),
  notFound: z.object({
    pageTitle: nonEmpty,
    eyebrow: nonEmpty,
    title: nonEmpty,
    cta: linkSchema,
  }),
  /** Interface labels (navigation, footer, accessibility). */
  labels: z.object({
    skipLink: nonEmpty,
    openMenu: nonEmpty,
    menuTitle: nonEmpty,
    footerExplore: nonEmpty,
    footerContact: nonEmpty,
    whatsapp: nonEmpty,
  }),
  contact: z.object({
    email: z.email(),
    phone: nonEmpty,
    /** Digits only, international format, for https://wa.me/<number> */
    whatsapp: z.string().regex(/^\d{8,15}$/),
  }),
  socials: z.array(z.object({ platform: socialPlatformSchema, url: z.url() })),
});

export type SkillLevel = z.infer<typeof skillLevelSchema>;
export type Accent = z.infer<typeof accentSchema>;
export type TeamMember = z.infer<typeof teamMemberSchema>;
export type Site = z.infer<typeof siteSchema>;
