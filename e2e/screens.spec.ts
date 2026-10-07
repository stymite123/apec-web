import { test } from "@playwright/test";

/**
 * Full-page screenshots for the design side's visual review.
 * Opt-in: SCREENSHOTS=<folder name> pnpm exec playwright test e2e/screens.spec.ts
 * Output: docs/reviews/<folder>/<project>-<page>.png
 */
const folder = process.env.SCREENSHOTS;

// Chromium blanks full-page captures taller than 16,384 device pixels, so capture at 1x.
test.use({ deviceScaleFactor: 1 });

const pages = [
  { name: "home", path: "/" },
  { name: "member", path: "/team/mustafa-ishaq" },
  { name: "404", path: "/this-peak-does-not-exist" },
];

for (const target of pages) {
  test(`screenshot ${target.name}`, async ({ page }, testInfo) => {
    test.skip(!folder, "set SCREENSHOTS=<folder> to capture");
    test.skip(testInfo.project.name === "reduced-motion", "same layout as desktop");

    await page.goto(target.path);
    await page.evaluate(() => document.fonts.ready);
    // Scroll through once so scroll-triggered reveals have played before capture.
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 400) {
        window.scrollTo(0, y);
        await new Promise((resolve) => setTimeout(resolve, 60));
      }
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(1200);
    await page.screenshot({
      path: `docs/reviews/${folder}/${testInfo.project.name}-${target.name}.png`,
      fullPage: true,
    });
  });
}
