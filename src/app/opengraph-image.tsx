import { ImageResponse } from "next/og";

import { site } from "@/content/site";
import { ogColors, ogSize } from "@/lib/og";

export const alt = `${site.name} — ${site.headline.lead} ${site.headline.accent} ${site.headline.tail}`;
export const size = ogSize;
export const contentType = "image/png";

/** Home share image: text only (the temporary logo is not used in exported assets). */
export default function OpengraphImage() {
  const { lead, accent, tail } = site.headline;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 80,
        background: `radial-gradient(circle at 85% 15%, ${ogColors.navy800}, ${ogColors.void} 60%)`,
        color: ogColors.silver100,
      }}
    >
      <div style={{ display: "flex", fontSize: 28, letterSpacing: 6, color: ogColors.steel400 }}>
        {site.name.toUpperCase()}
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          fontSize: 112,
          fontWeight: 700,
          lineHeight: 0.95,
          letterSpacing: -4,
        }}
      >
        <span>{lead}</span>
        <span style={{ display: "flex", gap: 28 }}>
          <span style={{ color: ogColors.brand300, fontStyle: "italic" }}>{accent}</span>
          <span>{tail}</span>
        </span>
      </div>
      <div style={{ display: "flex", fontSize: 28, color: ogColors.steel400 }}>
        {site.tagline} · {site.location}
      </div>
    </div>,
    size,
  );
}
