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

/** `confirmed` = the member stated it. The level may still be a TODO (shown without a level). */
const skillSchema = z.object({
  name: nonEmpty,
  level: orTodo(skillLevelSchema),
  group: orTodo(nonEmpty),
  confirmed: z.boolean(),
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
  /** Name used in "Work with {name}"; defaults to the first word of `name`. */
  callName: nonEmpty.optional(),
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

const sectionSchema = z.object({
  id: z.string().regex(/^[a-z-]+$/),
  eyebrow: nonEmpty,
  title: nonEmpty,
  intro: orTodo(nonEmpty).optional(),
});

const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

export const serviceSchema = z.object({
  slug,
  title: nonEmpty,
  summary: orTodo(nonEmpty),
  /** Team member slug who leads this discipline. */
  lead: slug,
});

export const processStepSchema = z.object({
  title: nonEmpty,
  summary: orTodo(nonEmpty),
});

export const siteSchema = z.object({
  name: nonEmpty,
  shortName: nonEmpty,
  expansion: orTodo(nonEmpty),
  tagline: orTodo(nonEmpty),
  /** Hero headline, one entry per line; `accent` (a word in the last line) is set in italic. */
  headline: z
    .object({ lines: z.array(nonEmpty).min(1).max(4), accent: nonEmpty })
    .refine((h) => h.lines.at(-1)?.includes(h.accent), "headline.accent must be in the last line"),
  /** Mono caption along the bottom of the hero. */
  heroCaption: orTodo(nonEmpty),
  subheadline: orTodo(nonEmpty),
  description: orTodo(nonEmpty.max(160)),
  location: orTodo(nonEmpty),
  url: z.url(),
  themeColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  nav: z.array(linkSchema).min(1),
  cta: linkSchema,
  heroCtas: z.array(linkSchema),
  /** Home page section copy; `id` is the anchor used by the nav. */
  sections: z.object({
    manifesto: z.object({ lines: z.array(nonEmpty).min(1).max(3) }),
    team: sectionSchema.extend({
      viewProfile: nonEmpty,
      /** Mono caption on each card (GSAP Field "FIELD CHARACTERS"). */
      cardCaption: nonEmpty,
      /** Two-line mono label beside the intro paragraph. */
      scrollLabel: z.tuple([nonEmpty, nonEmpty]),
    }),
    services: sectionSchema.extend({ ledBy: nonEmpty }),
    process: sectionSchema,
    contact: sectionSchema.extend({
      emailLabel: nonEmpty,
      whatsappLabel: nonEmpty,
      emailTerm: nonEmpty,
      phoneTerm: nonEmpty,
      /** Pre-filled WhatsApp message. */
      whatsappMessage: nonEmpty,
    }),
  }),
  /** Member page (/team/[slug]) labels; `{name}` is replaced with the first name. */
  member: z.object({
    workWith: nonEmpty,
    emailLabel: nonEmpty,
    /** Pre-filled WhatsApp message / email subject; `{name}` = member's call name. */
    whatsappMessage: nonEmpty,
    emailSubject: nonEmpty,
    breadcrumbTeam: nonEmpty,
    currently: nonEmpty,
    about: nonEmpty,
    skills: nonEmpty,
    tools: nonEmpty,
    experience: nonEmpty,
    projects: nonEmpty,
    projectsComing: nonEmpty,
    ctaTitle: nonEmpty,
    previous: nonEmpty,
    next: nonEmpty,
    allMembers: nonEmpty,
    present: nonEmpty,
  }),
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
    scrollCue: nonEmpty,
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
export type Service = z.infer<typeof serviceSchema>;
export type ProcessStep = z.infer<typeof processStepSchema>;
