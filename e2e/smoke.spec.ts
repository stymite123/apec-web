import { expect, test, type Page } from "@playwright/test";

/**
 * `/` serves Codex's single-file build (public/home.html, live since 2026-10-30), not
 * the Next home page, so these tests describe that page. The Next app still owns the
 * member pages, the 404 and the metadata routes, which are covered further down.
 */

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
  await expect(h1).toContainText("Agency for");
  await expect(h1).toContainText("Creatives");
  await expect(page.locator("#team .member")).toHaveCount(5);
  for (const id of ["team", "services", "process", "contact"]) {
    await expect(page.locator(`#${id}`)).toBeAttached();
  }

  await expect(page.locator("body")).not.toContainText("TODO:");

  // No sideways scrolling at any width or motion setting.
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
  expect(errors).toEqual([]);
});

test("the headline and description are in the markup, not built by script", async ({ request }) => {
  // Without this the page is a set of empty boxes until the bundle has run, and a
  // crawler sees nothing at all (DECISIONS 2026-11-02). Checked on the served HTML
  // rather than in a browser, which is what a crawler reads.
  const body = await (await request.get("/")).text();
  expect(body).toContain("Agency for");
  expect(body).toContain("<em>Creatives</em>");
  expect(body).toContain("Five specialists, one standard.");
});

test("nothing heavy is inlined, and the page itself stays small", async ({ page }) => {
  // The build ships 15.5 MB of base64 in one document; optimize-home.mjs takes it out
  // so the assets can be cached and the document can paint (DECISIONS 2026-11-02).
  const response = await page.goto("/");
  const body = (await response!.body()).toString("latin1");
  expect(body).not.toMatch(/base64,[A-Za-z0-9+/=]{200,}/);
  expect(body.length).toBeLessThan(200_000);
});

test("portrait videos and CV PDFs are not fetched until they are asked for", async ({ page }) => {
  const fetched: string[] = [];
  page.on("requestfinished", (r) => fetched.push(r.url()));
  await page.goto("/", { waitUntil: "load" });
  expect(fetched.filter((u) => u.endsWith(".mp4") || u.endsWith(".pdf"))).toEqual([]);
});

test("skip link moves focus past the introduction", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-1440", "keyboard check runs at desktop width");
  await page.goto("/");

  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip introduction" })).toBeFocused();
  await page.keyboard.press("Enter");
  // The page handles its own in-page links and scrolls without changing the hash.
  await expect(page.locator("#team")).toBeInViewport();
});

test("primary nav links jump to their sections", async ({ page }, testInfo) => {
  // The nav island is hidden outright under reduced motion (the stylesheet collapses
  // the whole introduction there), so this is a desktop, full-motion feature.
  test.skip(testInfo.project.name !== "desktop-1440", "desktop, full motion only");
  await page.goto("/");

  // The nav fades in partway through the introduction.
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.3));
  await page.waitForTimeout(600);
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "Services" })
    .click();
  await expect(page.locator("#services")).toBeInViewport();
});

test("tapping a portrait opens that person's portfolio, and closing it returns", async ({
  page,
}) => {
  const errors = collectErrors(page);
  await page.goto("/");
  await page.locator("#team").scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);

  await page.locator(".member").first().click();
  const dialog = page.locator("#portfolio");
  await expect(dialog).toHaveAttribute("open", "");
  await expect(page.locator("#profile-name")).toContainText("Huzaifa");

  await page.locator("#profile-close").click();
  await expect(dialog).not.toHaveAttribute("open", "");
  expect(errors).toEqual([]);
});

test("a second tap does not open a second portfolio", async ({ page }) => {
  await page.goto("/");
  await page.locator("#team").scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);

  // Two taps in the same task, which is what a double tap produces: the second used
  // to rebuild the profile and start its video under the first (DECISIONS 2026-11-02).
  await page.locator(".member").first().evaluate((el: HTMLElement) => {
    el.click();
    el.click();
  });
  await page.waitForTimeout(600);

  await expect(page.locator("#profile-name")).toContainText("Huzaifa");
  await expect(page.locator("#portfolio video")).toHaveCount(1);
});

test("the choice to pause the portrait video is remembered", async ({ page }) => {
  await page.goto("/");
  await page.locator("#team").scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);

  await page.locator(".member").first().click();
  const toggle = page.locator("#motion-toggle");
  // Reduced motion starts paused and full motion starts playing, so assert on the
  // flip rather than on a fixed label: either way the choice must survive a reopen.
  const started = await toggle.textContent();
  await toggle.click();
  const chosen = await toggle.textContent();
  expect(chosen).not.toBe(started);

  await page.locator("#profile-close").click();
  // Closing restores the scroll position, so let the row settle before tapping again.
  await expect(page.locator("#portfolio")).not.toHaveAttribute("open", "");
  await page.waitForTimeout(800);
  await page.locator(".member").first().click();
  await expect(toggle).toHaveText(chosen!);
});

test("controls are big enough to tap and text is big enough to read", async ({ page }) => {
  await page.goto("/");
  await page.locator("#contact").scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);

  const problems = await page.evaluate(() => {
    const small: string[] = [];
    for (const el of document.querySelectorAll<HTMLElement>("a, button")) {
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) continue;
      // elementFromPoint only answers for the visible viewport, so the extended-hit-area
      // check below is only meaningful for what is actually on screen.
      if (r.top < 8 || r.bottom > window.innerHeight - 8) continue;
      // Where the box must stay small for the design, the hit area is extended with
      // a pseudo-element, so check what a tap at the edges actually lands on.
      const reaches = (dy: number) =>
        document.elementFromPoint(r.left + r.width / 2, dy)?.closest("a, button") === el;
      const tall = r.height >= 44 || (reaches(r.top - 5) && reaches(r.bottom + 5));
      if (!tall) small.push(`${el.tagName}.${el.className} ${Math.round(r.height)}px`);
    }

    const tiny: string[] = [];
    for (const el of document.querySelectorAll<HTMLElement>("body *")) {
      if (![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent!.trim())) continue;
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) continue;
      const size = parseFloat(getComputedStyle(el).fontSize);
      if (size < 11) tiny.push(`${size}px ${el.tagName}.${el.className}`);
    }
    return { small, tiny };
  });

  expect(problems.small).toEqual([]);
  expect(problems.tiny).toEqual([]);
});

test("each of the five has a member page; member pages keep prev/next navigation", async ({
  page,
}) => {
  const errors = collectErrors(page);
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
