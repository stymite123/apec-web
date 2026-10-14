import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // WebP only: AVIF is smaller but much slower to decode, which showed as scroll jank.
    formats: ["image/webp"],
    // 85 for the team portraits (large, black-and-white, detail matters).
    qualities: [75, 85],
  },
};

export default nextConfig;
