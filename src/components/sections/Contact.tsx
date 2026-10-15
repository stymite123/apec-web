import { MailIcon, MessageCircleIcon } from "lucide-react";
import Image from "next/image";

import { Copy } from "@/components/dev/Todo";
import { Magnetic } from "@/components/motion/Magnetic";
import { ShapeLink } from "@/components/ui/shape-link";
import { site } from "@/content/site";
import { whatsappHref } from "@/lib/contact";
import { shouldRender } from "@/lib/todo";

/**
 * Night again, at the top: the summit with the flag planted. Contact (brief §8.1 #11)
 * is email + WhatsApp (DECISIONS 2026-10-08). The details sit on a ticket stub.
 */
export function Contact() {
  const copy = site.sections.contact;
  const { email, phone, whatsapp } = site.contact;

  return (
    <section
      id={copy.id}
      data-theme="night"
      aria-labelledby={`${copy.id}-title`}
      className="relative isolate overflow-hidden bg-night-900 defer-render [--defer-h:900px]"
    >
      <div aria-hidden className="absolute inset-0 -z-10">
        <Image src="/art/night-sky.webp" alt="" fill className="object-cover" />
      </div>
      <div
        aria-hidden
        className="absolute right-0 bottom-0 -z-10 h-[42%] w-full opacity-70 md:top-0 md:h-auto md:w-[75%] md:opacity-100"
      >
        <Image
          src="/art/night-summit.webp"
          alt=""
          fill
          className="object-cover object-[100%_100%]"
        />
      </div>

      <div className="container-site flex min-h-[100svh] flex-col justify-center gap-10 py-32">
        <h2
          id={`${copy.id}-title`}
          className="max-w-[11ch] type-display text-display leading-[0.84] text-star"
        >
          {copy.title}
        </h2>
        {copy.intro && shouldRender(copy.intro) && (
          <p className="max-w-[40ch] text-lead text-night-300">
            <Copy value={copy.intro} />
          </p>
        )}
        <div className="flex flex-wrap items-center gap-5">
          <Magnetic>
            <ShapeLink href={`mailto:${email}`}>
              <MailIcon aria-hidden className="size-4.5" />
              {copy.emailLabel}
            </ShapeLink>
          </Magnetic>
          <Magnetic>
            <ShapeLink
              href={whatsappHref(copy.whatsappMessage)}
              external
              variant="outline"
              fill="var(--color-star)"
            >
              <MessageCircleIcon aria-hidden className="size-4.5" />
              {copy.whatsappLabel}
            </ShapeLink>
          </Magnetic>
        </div>

        {/* Ticket stub: notched sides, perforation between the two halves. */}
        <dl className="ticket grid w-fit max-w-full rounded-[10px] bg-star text-night-950 sm:grid-cols-[auto_auto]">
          <div className="px-8 py-4">
            <dt className="type-ui text-[13px] text-night-700">{copy.emailTerm}</dt>
            <dd className="mt-1 text-[17px] font-semibold break-all">
              <a href={`mailto:${email}`} className="hover:underline">
                {email}
              </a>
            </dd>
          </div>
          <div className="border-dashed border-night-300 px-8 py-4 max-sm:border-t-2 sm:border-l-2">
            <dt className="type-ui text-[13px] text-night-700">{copy.phoneTerm}</dt>
            <dd className="mt-1 text-[17px] font-semibold">
              <a href={`tel:+${whatsapp}`} className="hover:underline">
                {phone}
              </a>
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
