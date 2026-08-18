import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  base: process.env.BASE ?? "/MOART",
  site: process.env.SITE ?? "https://andreanicky0509.github.io/MOART/",
  integrations: [sitemap()],
});
