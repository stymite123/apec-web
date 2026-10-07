import { MailIcon, MessageCircleIcon } from "lucide-react";

import { Copy } from "@/components/dev/Todo";
import { SplitReveal } from "@/components/motion/SplitReveal";
import { buttonVariants } from "@/components/ui/button";
import { site } from "@/content/site";
import { whatsappHref } from "@/lib/contact";
import { shouldRender } from "@/lib/todo";
import { cn } from "@/lib/utils";

/**
 * Contact (brief §8.1 #11). v1 = email + WhatsApp buttons (DECISIONS 2026-10-08).
 * Burgundy glow is one of the brief's allowed burgundy moments.
 */
export function Contact() {
  const copy = site.sections.contact;
  const { email, phone } = site.contact;

  return (
    <section
      id={copy.id}
      aria-labelledby={`${copy.id}-title`}
      className="relative isolate overflow-hidden border-t border-steel-800"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-[-40%] left-[-10%] -z-10 aspect-square w-[70vw] rounded-full bg-(image:--glow-wine) blur-2xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-[-30%] right-[-10%] -z-10 aspect-square w-[60vw] rounded-full bg-(image:--glow-navy) blur-2xl"
      />
      <div className="container-site py-32">
        <p className="label-mono text-steel-400">{copy.eyebrow}</p>
        <SplitReveal
          id={`${copy.id}-title`}
          className="mt-4 max-w-[16ch] font-display text-h2 font-semibold text-silver-100"
        >
          {copy.title}
        </SplitReveal>
        {copy.intro && shouldRender(copy.intro) && (
          <p className="mt-6 max-w-xl text-lg text-steel-300">
            <Copy value={copy.intro} />
          </p>
        )}
        <div className="mt-10 flex flex-wrap gap-3">
          <a
            href={`mailto:${email}`}
            className={cn(buttonVariants({ size: "lg" }), "h-12 rounded-full px-6 text-base")}
          >
            <MailIcon aria-hidden />
            {copy.emailLabel}
          </a>
          <a
            href={whatsappHref(copy.whatsappMessage)}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "h-12 rounded-full px-6 text-base",
            )}
          >
            <MessageCircleIcon aria-hidden />
            {copy.whatsappLabel}
          </a>
        </div>
        <dl className="mt-12 grid gap-6 text-steel-300 sm:grid-cols-2 md:max-w-2xl">
          <div>
            <dt className="label-mono text-steel-400">{copy.emailTerm}</dt>
            <dd className="mt-2 break-all">
              <a href={`mailto:${email}`} className="hover:text-silver-100">
                {email}
              </a>
            </dd>
          </div>
          <div>
            <dt className="label-mono text-steel-400">{copy.phoneTerm}</dt>
            <dd className="mt-2">
              <a href={`tel:+${site.contact.whatsapp}`} className="hover:text-silver-100">
                {phone}
              </a>
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
