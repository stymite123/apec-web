import { ScrubWords } from "@/components/motion/ScrubWords";
import { site } from "@/content/site";

/** Manifesto (brief §8.1 #4): AI speed + human expertise, lit word by word on scroll. */
export function Manifesto() {
  return (
    <section aria-label="Manifesto" className="container-site py-32 md:py-44">
      <ScrubWords
        lines={site.sections.manifesto.lines}
        className="max-w-[18ch] font-display text-h2 font-semibold text-silver-100"
      />
    </section>
  );
}
