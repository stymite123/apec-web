import { site } from "@/content/site";
import { team } from "@/content/team";
import { collectTodos } from "@/lib/todo";

/** Placeholders that live outside src/content (assets, temporary code). */
const TEMPORARY_ASSETS = [
  "TODO: TemporaryApexMark is a rough trace — replace with the designer's SVG logo (brief §6.1)",
];

let reported = false;

/**
 * Logs every TODO hidden by the production build (brief §11).
 * Runs only during `next build`; each build worker may log once.
 * Server-only: imports all content.
 */
export function reportTodosAtBuild() {
  if (reported || process.env.NEXT_PHASE !== "phase-production-build") return;
  reported = true;

  const items = [
    ...collectTodos(site, "site"),
    ...team.flatMap((member) => collectTodos(member, `team.${member.slug}`)),
    ...TEMPORARY_ASSETS.map((text) => ({ path: "assets", text })),
  ];
  if (items.length === 0) return;

  // Collapse list entries: team.x.skills[0].level, [1].level … → skills[*].level ×n
  const grouped = new Map<string, number>();
  for (const item of items) {
    const key = `${item.path.replace(/\[\d+\]/g, "[*]")}: ${item.text}`;
    grouped.set(key, (grouped.get(key) ?? 0) + 1);
  }
  const lines = [...grouped].map(([key, count]) => `  - ${key}${count > 1 ? ` (×${count})` : ""}`);

  console.warn(
    `\n⚠ ${items.length} TODO item(s) are hidden in this production build:\n${lines.join("\n")}\n`,
  );
}
