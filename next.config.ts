import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // WebP only: AVIF is smaller but much slower to decode, which showed as scroll jank.
    formats: ["image/webp"],
    // 85 for the team portraits (large, black-and-white, detail matters).
    qualities: [75, 85],
  },
  /**
   * The home page is Codex's single-file build (public/home.html, approved 2026-10-30).
   * `beforeFiles` runs ahead of the app routes, so `/` serves that page while the rest
   * of the app (member pages, sitemap, robots, share images) keeps working.
   */
  async rewrites() {
    return {
      beforeFiles: [{ source: "/", destination: "/home.html" }],
      afterFiles: [],
      fallback: [],
    };
  },
};

export default nextConfig;
