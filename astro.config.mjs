import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },
  base: process.env.BASE ?? "/",
  site: process.env.SITE ?? "https://moarthouse.com/",
  integrations: [sitemap()],
});
