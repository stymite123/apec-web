import type { MetadataRoute } from "next";

import { site } from "@/content/site";
import { team } from "@/content/team";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    { url: site.url, lastModified, changeFrequency: "monthly", priority: 1 },
    ...team.map((member) => ({
      url: `${site.url}/team/${member.slug}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
