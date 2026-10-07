import { site } from "@/content/site";

/** WhatsApp click-to-chat link with an optional pre-filled message (brief §13). */
export const whatsappHref = (message?: string) =>
  `https://wa.me/${site.contact.whatsapp}${message ? `?text=${encodeURIComponent(message)}` : ""}`;
