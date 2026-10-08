import type { Metadata } from "next";

import { Contact } from "@/components/sections/Contact";
import { FieldIntro } from "@/components/sections/FieldIntro";
import { Hero } from "@/components/sections/Hero";
import { Process } from "@/components/sections/Process";
import { Services } from "@/components/sections/Services";
import { TaglineBand } from "@/components/sections/TaglineBand";
import { TeamSection } from "@/components/sections/TeamSection";
import { JsonLd } from "@/components/seo/JsonLd";
import { site } from "@/content/site";
import { services } from "@/content/services";
import { team } from "@/content/team";
import { pad } from "@/lib/accent";
import { isTodo } from "@/lib/todo";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

/**
 * Home (brief §8.1). Work, Toolbelt and Testimonials stay hidden until real content exists.
 * Hero → intro/phrases → team follow the GSAP Field rhythm (preview, DECISIONS 2026-10-08);
 * the manifesto lines now play in the phrase stage, replacing the marquee + manifesto blocks.
 */
export default function Home() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: site.name,
          alternateName: site.shortName,
          url: site.url,
          email: site.contact.email,
          telephone: `+${site.contact.whatsapp}`,
          ...(!isTodo(site.tagline) && { slogan: site.tagline }),
          ...(!isTodo(site.description) && { description: site.description }),
          member: team.map((member) => ({
            "@type": "Person",
            name: member.name,
            jobTitle: member.role,
            url: `${site.url}/team/${member.slug}`,
          })),
          sameAs: site.socials.map((social) => social.url),
        }}
      />
      {/* The hero is sticky inside this wrapper, so the intro panel slides over it. */}
      <div className="relative">
        <Hero />
        <FieldIntro
          label={site.sections.team.scrollLabel}
          intro={site.subheadline}
          phrases={site.sections.manifesto.lines}
          tags={services.map((service, index) => ({
            number: pad(index + 1),
            label: service.title,
          }))}
        />
      </div>
      <TeamSection />
      <Services />
      <TaglineBand
        words={site.tagline.split("|").map((word) => word.trim())}
        label={site.tagline}
      />
      <Process />
      <Contact />
    </>
  );
}
