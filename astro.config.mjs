import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },
  base: process.env.BASE ?? "/MOART",
  site: process.env.SITE ?? "https://andreanicky0509.github.io/MOART/",
  integrations: [sitemap()],
});
