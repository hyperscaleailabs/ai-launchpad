// Smoke-tests the built site and captures evidence that it runs:
//   - hits each key route and records the HTTP status
//   - saves a full-page screenshot of each route (desktop + mobile home)
//   - writes a JSON + Markdown summary
// Fails (exit 1) if any route does not return HTTP 200, so CI catches a
// broken site rather than silently producing screenshots of error pages.
import { chromium, devices } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";

const BASE = process.env.PREVIEW_URL ?? "http://localhost:4321";
const OUT = "evidence";
// Allow pointing at a pre-installed Chromium (e.g. in sandboxes where the
// version Playwright downloads differs). Unset in normal CI.
const executablePath = process.env.PLAYWRIGHT_EXECUTABLE_PATH || undefined;
const launchOpts = executablePath ? { executablePath } : {};

const routes = [
  { name: "home", path: "/" },
  { name: "offerings", path: "/offerings/" },
  { name: "about", path: "/about/" },
  { name: "blog", path: "/blog/" },
  { name: "blog-post", path: "/blog/welcome-to-ai-launchpad/" },
];

async function main() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch(launchOpts);
  const results = [];

  // Desktop screenshots + status checks.
  const desktop = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  for (const route of routes) {
    const page = await desktop.newPage();
    const response = await page.goto(BASE + route.path, {
      waitUntil: "networkidle",
      timeout: 30000,
    });
    const status = response?.status() ?? 0;
    const title = await page.title();
    const file = `${OUT}/${route.name}.png`;
    await page.screenshot({ path: file, fullPage: true });
    results.push({ ...route, status, title, screenshot: file });
    console.log(`${status === 200 ? "✓" : "✗"} ${status} ${route.path} — "${title}"`);
    await page.close();
  }
  await desktop.close();

  // One mobile screenshot of the home page as responsiveness evidence.
  const mobile = await browser.newContext({ ...devices["iPhone 13"] });
  const mPage = await mobile.newPage();
  await mPage.goto(BASE + "/", { waitUntil: "networkidle", timeout: 30000 });
  await mPage.screenshot({ path: `${OUT}/home-mobile.png`, fullPage: true });
  await mobile.close();
  await browser.close();

  // Write machine- and human-readable summaries.
  const summary = {
    baseUrl: BASE,
    capturedAt: new Date().toISOString(),
    routes: results,
  };
  await writeFile(`${OUT}/summary.json`, JSON.stringify(summary, null, 2));

  const md = [
    "# Website evidence",
    "",
    `Captured ${summary.capturedAt} against \`${BASE}\`.`,
    "",
    "| Route | Status | Title | Screenshot |",
    "| --- | --- | --- | --- |",
    ...results.map(
      (r) => `| \`${r.path}\` | ${r.status} | ${r.title} | ${r.name}.png |`,
    ),
    "| `/` (mobile) | — | — | home-mobile.png |",
    "",
  ].join("\n");
  await writeFile(`${OUT}/summary.md`, md);

  const failures = results.filter((r) => r.status !== 200);
  if (failures.length > 0) {
    console.error(`\n${failures.length} route(s) did not return HTTP 200.`);
    process.exit(1);
  }
  console.log(`\nAll ${results.length} routes returned HTTP 200. Evidence in ./${OUT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
