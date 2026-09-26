import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

const SITE = process.env.SITE ?? "https://moarthouse.com/";
const BASE = process.env.BASE ?? "/";

export default defineConfig({
  site: SITE,
  base: BASE,
  trailingSlash: "never",
  vite: {
    plugins: [tailwindcss()],
  },
});
