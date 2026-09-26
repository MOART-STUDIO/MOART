import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";
import { sitemapFile } from "./integrations/sitemap-file.mjs";

const SITE = process.env.SITE ?? "https://moarthouse.com/";
const BASE = process.env.BASE ?? "/";

export default defineConfig({
  site: SITE,
  base: BASE,
  trailingSlash: "never",
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [
    sitemapFile({
      contentDir: fileURLToPath(new URL("./src/content/products", import.meta.url)),
    }),
  ],
});
