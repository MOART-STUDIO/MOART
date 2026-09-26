import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

const SITE = process.env.SITE ?? "https://moarthouse.com/";
const BASE = process.env.BASE ?? "/";

/** Rutas que nunca deben entrar al sitemap. */
const EXCLUDED = [
  "/404",
  "/cart",
  "/robots.txt",
  "/llms.txt",
  "/llms-full.txt",
];

/** Último `lastmod` real de cada producto, tomado del mtime de su markdown. */
const productLastmod = new Map();
try {
  const dir = join(process.cwd(), "src", "content", "products");
  for (const file of readdirSync(dir)) {
    if (!/\.mdx?$/.test(file)) continue;
    const slug = file.replace(/\.mdx?$/, "");
    productLastmod.set(
      `/products/${slug}`,
      statSync(join(dir, file)).mtime,
    );
  }
} catch {
  // Si no hay contenido, el sitemap se genera sin lastmod por producto.
}

/** Prioridad y frecuencia de recrawl según el tipo de página. */
function pageSignals(pathname) {
  const path = pathname.replace(BASE, "/").replace(/^\/+/, "/");

  if (EXCLUDED.some((prefix) => path.startsWith(prefix))) return null;

  if (path === "/") return { priority: 1.0, changefreq: "weekly" };
  if (path === "/catalog") return { priority: 0.9, changefreq: "weekly" };
  if (/^\/catalog\/\d+\/?$/.test(path)) {
    return { priority: 0.4, changefreq: "weekly" };
  }
  if (path.startsWith("/products/")) {
    return { priority: 0.8, changefreq: "monthly" };
  }
  if (path === "/about") return { priority: 0.6, changefreq: "yearly" };
  return { priority: 0.5, changefreq: "monthly" };
}

export default defineConfig({
  site: SITE,
  base: BASE,
  trailingSlash: "never",
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [
    sitemap({
      filter: (page) => pageSignals(new URL(page).pathname) !== null,
      serialize(item) {
        const { pathname } = new URL(item.url);
        const signals = pageSignals(pathname);
        if (!signals) return undefined;

        const lastmod =
          productLastmod.get(pathname.replace(/\/$/, "")) ??
          productLastmod.get(`${pathname.replace(/\/$/, "")}/`);

        return {
          ...item,
          lastmod: lastmod ?? undefined,
          ...signals,
        };
      },
    }),
  ],
});
