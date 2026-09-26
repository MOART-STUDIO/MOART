import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { CATALOG_PAGE_SIZE, getProducts } from "@/data/products.js";
import { siteUrl } from "@/data/site.js";

/** Páginas que nunca deben entrar al sitemap. */
export const SITEMAP_EXCLUDED = ["/cart", "/404", "/robots.txt", "/sitemap.xml"];

/**
 * Páginas estáticas del sitio, sin contar productos ni paginación del catálogo.
 * Si añades una ruta nueva, añádela aquí.
 */
export const STATIC_PAGES: { path: string; priority: number; changefreq: string }[] = [
  { path: "/", priority: 1.0, changefreq: "weekly" },
  { path: "/catalog", priority: 0.9, changefreq: "weekly" },
  { path: "/about", priority: 0.6, changefreq: "yearly" },
];

type Signals = { priority: number; changefreq: string } | null;

/** Prioridad y frecuencia de recrawl según el tipo de ruta. */
function pageSignals(path: string): Signals {
  if (SITEMAP_EXCLUDED.some((prefix) => path.startsWith(prefix))) return null;
  if (/^\/catalog\/\d+\/?$/.test(path)) {
    return { priority: 0.4, changefreq: "weekly" };
  }
  if (path.startsWith("/products/")) {
    return { priority: 0.8, changefreq: "monthly" };
  }
  return null;
}

/** `lastmod` real de cada producto, tomado del mtime de su markdown. */
function productLastmod(): Map<string, Date> {
  const map = new Map<string, Date>();
  try {
    const dir = join(process.cwd(), "src", "content", "products");
    for (const file of readdirSync(dir)) {
      if (!/\.mdx?$/.test(file)) continue;
      map.set(`/products/${file.replace(/\.mdx?$/, "")}`, statSync(join(dir, file)).mtime);
    }
  } catch {
    // Sin contenido, el sitemap se genera sin lastmod por producto.
  }
  return map;
}

export interface SitemapEntry {
  loc: string;
  lastmod?: string;
  priority: number;
  changefreq: string;
}

/** Construye la lista completa de URLs del sitemap a partir del contenido real. */
export async function buildSitemapEntries(): Promise<SitemapEntry[]> {
  const products = await getProducts();
  const lastmods = productLastmod();
  const entries: SitemapEntry[] = [];

  for (const page of STATIC_PAGES) {
    if (SITEMAP_EXCLUDED.includes(page.path)) continue;
    entries.push({
      loc: siteUrl(page.path),
      priority: page.priority,
      changefreq: page.changefreq,
    });
  }

  const lastPage = Math.max(1, Math.ceil(products.length / CATALOG_PAGE_SIZE));
  for (let page = 2; page <= lastPage; page++) {
    const path = `/catalog/${page}`;
    const signals = pageSignals(path);
    if (!signals) continue;
    entries.push({
      loc: siteUrl(path),
      priority: signals.priority,
      changefreq: signals.changefreq,
    });
  }

  for (const product of products) {
    const path = `/products/${product.slug}`;
    const signals = pageSignals(path);
    if (!signals) continue;
    const lastmod = lastmods.get(path);
    entries.push({
      loc: siteUrl(path),
      lastmod: lastmod?.toISOString(),
      priority: signals.priority,
      changefreq: signals.changefreq,
    });
  }

  return entries;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function renderSitemap(entries: SitemapEntry[]): string {
  const urls = entries
    .map((entry) =>
      [
        "  <url>",
        `    <loc>${escapeXml(entry.loc)}</loc>`,
        entry.lastmod ? `    <lastmod>${entry.lastmod}</lastmod>` : null,
        `    <changefreq>${entry.changefreq}</changefreq>`,
        `    <priority>${entry.priority.toFixed(1)}</priority>`,
        "  </url>",
      ]
        .filter(Boolean)
        .join("\n"),
    )
    .join("\n");

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urls,
    "</urlset>",
    "",
  ].join("\n");
}
