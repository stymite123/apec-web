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
  await expect(page.locator("#team li")).toHaveCount(5);

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

test("unknown URLs show the 404 page", async ({ page }) => {
  const response = await page.goto("/this-peak-does-not-exist");
  expect(response?.status()).toBe(404);

  await expect(page.getByRole("heading", { level: 1 })).toHaveText("This peak doesn’t exist.");
  await expect(page).toHaveTitle(/Page not found/);
  await page.getByRole("link", { name: "Back to home" }).click();
  await expect(page).toHaveURL(/\/$/);
});

test("smooth scrolling follows the reduced-motion preference", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "mobile-390", "checked on desktop widths");
  await page.goto("/");

  await expect(page.locator("html")).toHaveClass(/\blenis\b/);

  // Lenis adds `lenis-smooth` to <html> only while a smoothed scroll is running.
  await page.evaluate(() => {
    const root = document.documentElement;
    root.dataset.sawSmooth = "false";
    new MutationObserver(() => {
      if (root.classList.contains("lenis-smooth")) root.dataset.sawSmooth = "true";
    }).observe(root, { attributes: true, attributeFilter: ["class"] });
  });
  await page.mouse.move(720, 450);
  await page.mouse.wheel(0, 600);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
  await page.waitForTimeout(800);

  const sawSmooth = await page.evaluate(() => document.documentElement.dataset.sawSmooth);
  expect(sawSmooth).toBe(testInfo.project.name === "reduced-motion" ? "false" : "true");
});
