import { test } from "@playwright/test";

/**
 * Full-page screenshots for the design side's visual review.
 * Opt-in: SCREENSHOTS=<folder name> pnpm exec playwright test e2e/screens.spec.ts
 * Output: docs/reviews/<folder>/<project>-<page>.png
 */
const folder = process.env.SCREENSHOTS;

const pages = [
  { name: "home", path: "/" },
  { name: "404", path: "/this-peak-does-not-exist" },
];

for (const target of pages) {
  test(`screenshot ${target.name}`, async ({ page }, testInfo) => {
    test.skip(!folder, "set SCREENSHOTS=<folder> to capture");
    test.skip(testInfo.project.name === "reduced-motion", "same layout as desktop");

    await page.goto(target.path);
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({
      path: `docs/reviews/${folder}/${testInfo.project.name}-${target.name}.png`,
      fullPage: true,
    });
  });
}
