import type { Metadata } from "next";

import { Contact } from "@/components/sections/Contact";
import { Hero } from "@/components/sections/Hero";
import { Manifesto } from "@/components/sections/Manifesto";
import { Marquee } from "@/components/sections/Marquee";
import { Process } from "@/components/sections/Process";
import { Services } from "@/components/sections/Services";
import { TeamSection } from "@/components/sections/TeamSection";
import { JsonLd } from "@/components/seo/JsonLd";
import { services } from "@/content/services";
import { site } from "@/content/site";
import { team } from "@/content/team";
import { isTodo } from "@/lib/todo";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

/** Home (brief §8.1). Work, Toolbelt and Testimonials stay hidden until real content exists. */
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
      <Hero />
      <Marquee items={services.map((service) => service.title)} />
      <Manifesto />
      <TeamSection />
      <Services />
      <Process />
      <Contact />
    </>
  );
}
