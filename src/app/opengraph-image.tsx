import { ImageResponse } from "next/og";

import { site } from "@/content/site";
import { ogColors, ogSize } from "@/lib/og";

export const alt = `${site.name} — ${site.headline.lines.join(" ")}`;
export const size = ogSize;
export const contentType = "image/png";

/** Home share image: text only (the temporary logo is not used in exported assets). */
export default function OpengraphImage() {
  const { lines, accent } = site.headline;
  const last = lines.at(-1) ?? "";
  const [before, after] = [
    last.slice(0, last.indexOf(accent)),
    last.slice(last.indexOf(accent) + accent.length),
  ];

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 80,
        background: `radial-gradient(circle at 85% 15%, ${ogColors.night700}, ${ogColors.night950} 60%)`,
        color: ogColors.star,
      }}
    >
      <div style={{ display: "flex", fontSize: 28, letterSpacing: 6, color: ogColors.night300 }}>
        {site.name.toUpperCase()}
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          fontSize: 96,
          fontWeight: 700,
          lineHeight: 0.95,
          letterSpacing: -4,
        }}
      >
        {lines.slice(0, -1).map((line) => (
          <span key={line}>{line}</span>
        ))}
        <span style={{ display: "flex", whiteSpace: "pre" }}>
          {before}
          <span style={{ color: ogColors.apricot, fontStyle: "italic" }}>{accent}</span>
          {after}
        </span>
      </div>
      <div style={{ display: "flex", fontSize: 28, color: ogColors.night300 }}>
        {site.tagline} · {site.location}
      </div>
    </div>,
    size,
  );
}
