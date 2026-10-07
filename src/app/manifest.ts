import type { MetadataRoute } from "next";

import { site } from "@/content/site";
import { isTodo } from "@/lib/todo";

/** Icons use the default favicon until the designer's favicon set arrives (brief §6.1). */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.name,
    short_name: site.shortName,
    description: isTodo(site.description) ? undefined : site.description,
    start_url: "/",
    display: "standalone",
    background_color: site.themeColor,
    theme_color: site.themeColor,
    icons: [{ src: "/favicon.ico", sizes: "any", type: "image/x-icon" }],
  };
}
