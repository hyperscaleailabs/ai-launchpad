// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

// Production URL — powers canonical URLs, the sitemap, and the RSS feed.
// Default is the Vercel project subdomain. If Vercel assigns a different
// name (e.g. the slug is taken), update this to match, or swap in a custom
// domain later.
const SITE = "https://ai-launchpad.vercel.app";

// https://astro.build/config
export default defineConfig({
  site: SITE,
  integrations: [sitemap()],
});
