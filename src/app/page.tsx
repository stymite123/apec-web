import type { Metadata } from "next";

import { Contact } from "@/components/sections/Contact";
import { Hero } from "@/components/sections/Hero";
import { Process } from "@/components/sections/Process";
import { Services } from "@/components/sections/Services";
import { SkyStage } from "@/components/sections/SkyStage";
import { TeamSection } from "@/components/sections/TeamSection";
import { JsonLd } from "@/components/seo/JsonLd";
import { site } from "@/content/site";
import { services } from "@/content/services";
import { team } from "@/content/team";
import { isTodo } from "@/lib/todo";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

/**
 * Home (brief §8.1). Field + Climb combined (DECISIONS 2026-10-15), one journey through
 * the day: night hero → dawn manifesto → dark studio (the five) → daylight services →
 * graphite workshop (process) → night summit contact. Work, Toolbelt and Testimonials stay hidden until real content exists.
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
      {/* The hero is sticky inside this wrapper, so the dawn panel slides over it. */}
      <div className="relative">
        <Hero />
        <SkyStage
          phrases={site.sections.manifesto.lines}
          cards={services.map((service) => ({ slug: service.slug, label: service.short }))}
        />
      </div>
      <TeamSection />
      <Services />
      <Process />
      <Contact />
    </>
  );
}
