// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

// Update this to your production domain once it's live.
// It powers canonical URLs, the sitemap, and the RSS feed.
const SITE = "https://ai-launchpad.example.com";

// https://astro.build/config
export default defineConfig({
  site: SITE,
  integrations: [sitemap()],
});
