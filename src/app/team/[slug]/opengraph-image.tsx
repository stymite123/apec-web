import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { ImageResponse } from "next/og";

import { site } from "@/content/site";
import { getMember, team } from "@/content/team";
import { ogAccent, ogColors, ogSize } from "@/lib/og";
import { isTodo } from "@/lib/todo";

export const size = ogSize;
export const contentType = "image/png";
export const alt = "Team member at APEC Digital";

export function generateStaticParams() {
  return team.map((member) => ({ slug: member.slug }));
}

/** Member share image (brief §8.2): portrait + name + role + accent. */
export default async function OpengraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const member = getMember((await params).slug);
  if (!member) return new Response("Not found", { status: 404 });

  const portrait = member.portrait
    ? `data:image/jpeg;base64,${(await readFile(join(process.cwd(), "public", member.portrait.src))).toString("base64")}`
    : null;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        background: ogColors.night950,
        color: ogColors.star,
      }}
    >
      <div style={{ display: "flex", width: 470, height: "100%", position: "relative" }}>
        {portrait && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={portrait}
            alt=""
            width={470}
            height={630}
            style={{ width: 470, height: 630, objectFit: "cover", objectPosition: "top" }}
          />
        )}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 6,
            background: ogAccent[member.accent],
          }}
        />
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 64,
          flex: 1,
        }}
      >
        <div style={{ display: "flex", fontSize: 24, letterSpacing: 5, color: ogColors.night300 }}>
          {`0${member.order} / 0${team.length} — ${site.name.toUpperCase()}`}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              display: "flex",
              fontSize: 84,
              fontWeight: 700,
              lineHeight: 0.95,
              letterSpacing: -3,
            }}
          >
            {member.name}
          </div>
          <div style={{ display: "flex", fontSize: 36, color: ogColors.brand300 }}>
            {member.role}
          </div>
        </div>
        <div style={{ display: "flex", fontSize: 26, color: ogColors.night300 }}>
          {isTodo(member.headline) ? site.tagline : member.headline}
        </div>
      </div>
    </div>,
    size,
  );
}
