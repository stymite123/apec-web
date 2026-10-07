import { expect, test, type Page } from "@playwright/test";

function collectErrors(page: Page) {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  return errors;
}

test("home renders the headline and the five, with no TODO text", async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto("/");

  const h1 = page.getByRole("heading", { level: 1 });
  await expect(h1).toHaveCount(1);
  await expect(h1).toHaveText(/Five specialists\.\s+One\s+apex\./);
  await expect(page.locator("#team ol > li")).toHaveCount(5);
  for (const id of ["services", "process", "contact"]) {
    await expect(page.locator(`#${id}-title`)).toBeAttached();
  }

  await expect(page.locator("body")).not.toContainText("TODO:");
  await expect(page.locator("[data-todo]")).toHaveCount(0);
  expect(errors).toEqual([]);
});

test("skip link moves focus to the main content", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "mobile-390", "keyboard check runs on desktop widths");
  await page.goto("/");

  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#content")).toBeFocused();
});

test("primary nav links jump to their sections", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "mobile-390", "desktop navigation only");
  await page.goto("/");

  await page
    .getByRole("navigation", { name: "Primary" })
    .getByRole("link", { name: "Services" })
    .click();
  await expect(page).toHaveURL(/#services$/);
  await expect(page.locator("#services-title")).toBeInViewport();
});

test("mobile menu opens, keeps focus inside and closes with Escape", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-390", "mobile navigation only");
  await page.goto("/");

  const trigger = page.getByRole("button", { name: "Open menu" });
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Menu" });
  await expect(dialog).toBeVisible();

  for (let i = 0; i < 10; i++) await page.keyboard.press("Tab");
  expect(await dialog.evaluate((el) => el.contains(document.activeElement))).toBe(true);

  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("mobile menu links navigate and close the menu", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-390", "mobile navigation only");
  await page.goto("/");

  await page.getByRole("button", { name: "Open menu" }).click();
  await page.getByRole("dialog", { name: "Menu" }).getByRole("link", { name: "Process" }).click();
  await expect(page.getByRole("dialog", { name: "Menu" })).toBeHidden();
  await expect(page).toHaveURL(/#process$/);
  await expect(page.locator("#process-title")).toBeInViewport();
});

test("team cards open member pages with prev/next navigation", async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto("/");

  // Slides 2–5 sit off-screen inside the pinned horizontal track, so check links, then visit.
  const slideLinks = page.locator("#team ol > li a");
  await expect(slideLinks).toHaveCount(5);
  await expect(slideLinks.nth(1)).toHaveAttribute("href", "/team/mustafa-ishaq");
  await page.goto("/team/mustafa-ishaq");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Mustafa Ishaq");
  await expect(page).toHaveTitle("Mustafa Ishaq — AI Agent Engineer | APEC Digital");
  await expect(page.getByText("Atlus Bank (USA)").first()).toBeVisible();
  await expect(page.getByRole("link", { name: "Work with Mustafa" }).first()).toHaveAttribute(
    "href",
    /^https:\/\/wa\.me\/923265698123\?text=/,
  );
  await expect(page.locator("body")).not.toContainText("TODO:");

  await page.getByRole("navigation", { name: "All five" }).getByRole("link").last().click();
  await expect(page).toHaveURL(/\/team\/hamad-alam$/);
  expect(errors).toEqual([]);
});

test("member pages for unknown slugs are 404", async ({ page }) => {
  const response = await page.goto("/team/not-a-member");
  expect(response?.status()).toBe(404);
});

test("unknown URLs show the 404 page", async ({ page }) => {
  const response = await page.goto("/this-peak-does-not-exist");
  expect(response?.status()).toBe(404);

  await expect(page.getByRole("heading", { level: 1 })).toHaveText("This peak doesn’t exist.");
  await expect(page).toHaveTitle(/Page not found/);
  await page.getByRole("link", { name: "Back to home" }).click();
  await expect(page).toHaveURL(/\/$/);
});

test("native scrolling and no WebGL on the home page", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "mobile-390", "checked on desktop widths");
  await page.goto("/");

  // DECISIONS 2026-10-08: no smooth-scroll library, no live 3D on load.
  await expect(page.locator("html")).not.toHaveClass(/\blenis\b/);
  await expect(page.locator("[data-hero] canvas")).toHaveCount(0);
  await expect(page.locator('[data-hero] img[src*="apex-mark-render"]')).toHaveCount(1);

  await page.mouse.move(720, 450);
  await page.mouse.wheel(0, 600);
  // Native wheel scrolling lands immediately (no eased catch-up).
  await expect
    .poll(() => page.evaluate(() => window.scrollY), { timeout: 1000 })
    .toBeGreaterThan(0);
});
