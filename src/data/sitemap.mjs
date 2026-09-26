/**
 * Lógica del sitemap, sin dependencias de Astro.
 *
 * Es un `.mjs` a propósito: la consumen tanto las páginas de Astro como el
 * plugin `integrations/sitemap-file.mjs`, que corre en Node puro al final del
 * build. Así hay una sola fuente de verdad y el XML nunca se desincroniza
 * entre `public/` y `dist/`.
 */
import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";

/** Piezas por página del catálogo. Compartido con `catalog/[...page].astro`. */
export const CATALOG_PAGE_SIZE = 48;

/** Rutas que nunca se incluyen: privadas, de utilidad interna o el propio sitemap. */
export const SITEMAP_EXCLUDED = [
  "/cart",
  "/404",
  "/robots.txt",
  "/sitemap.xml",
  "/llms.txt",
  "/llms-full.txt",
];

/** `priority` y `changefreq` según el tipo de ruta. */
function signalsFor(path) {
  if (SITEMAP_EXCLUDED.some((excluded) => path === excluded || path.startsWith(`${excluded}/`))) {
    return null;
  }
  if (path === "/") return { priority: 1.0, changefreq: "weekly" };
  if (path === "/catalog") return { priority: 0.9, changefreq: "weekly" };
  if (/^\/catalog\/\d+\/?$/.test(path)) return { priority: 0.4, changefreq: "weekly" };
  if (path === "/about") return { priority: 0.6, changefreq: "yearly" };
  if (path.startsWith("/products/")) return { priority: 0.8, changefreq: "monthly" };
  return null;
}

/** `lastmod` real de cada producto, tomado del mtime de su markdown. */
function productLastmods(contentDir) {
  const map = new Map();
  let files = [];
  try {
    files = readdirSync(contentDir);
  } catch {
    return map;
  }
  for (const file of files) {
    if (!/\.mdx?$/.test(file)) continue;
    const slug = file.replace(/\.mdx?$/, "");
    try {
      map.set(`/products/${slug}`, statSync(join(contentDir, file)).mtime);
    } catch {
      // Si el archivo desaparece entre readdir y stat, se omite su lastmod.
    }
  }
  return map;
}

/** Quita el `base` del despliegue de una ruta de salida de Astro. */
function stripBase(path, base) {
  if (!base || base === "/") return path;
  const normalized = base.replace(/\/$/, "");
  if (path === normalized) return "/";
  return path.startsWith(`${normalized}/`) ? path.slice(normalized.length) : path;
}

/**
 * Normaliza una ruta de salida de Astro a la forma `/catalog/2`.
 * Astro entrega `pathname` sin slash inicial y `build:done` puede incluir
 * el `base` del despliegue.
 */
function normalizePath(raw, base) {
  let path = raw.startsWith("/") ? raw : `/${raw}`;
  path = stripBase(path, base);
  if (path.length > 1) path = path.replace(/\/+$/, "");
  return path || "/";
}

/**
 * Construye la lista de URLs a partir de las páginas realmente generadas por
 * Astro, más los productos leídos del contenido.
 *
 * @param {object} options
 * @param {string} options.site  Origen absoluto del sitio, p. ej. `https://moarthouse.com`.
 * @param {string} options.base  Path base del despliegue, p. ej. `/` o `/moart`.
 * @param {string[]} options.pages  Rutas generadas (con base incluida).
 * @param {string} options.contentDir  Carpeta de la colección de productos.
 */
export function buildSitemapEntries({ site, base = "/", pages, contentDir }) {
  const origin = new URL(site).origin;
  const prefix = base && base !== "/" ? base.replace(/\/$/, "") : "";
  const lastmods = productLastmods(contentDir);

  const url = (path) => `${origin}${prefix}${path === "/" ? "" : path}`;

  const entries = [];
  const seen = new Set();

  for (const raw of pages) {
    const path = normalizePath(raw, base);
    const signals = signalsFor(path);
    if (!signals || seen.has(path)) continue;
    seen.add(path);
    entries.push({
      loc: url(path),
      lastmod: lastmods.get(path)?.toISOString(),
      priority: signals.priority,
      changefreq: signals.changefreq,
    });
  }

  return entries.sort((a, b) => {
    if (b.priority !== a.priority) return b.priority - a.priority;
    return a.loc.localeCompare(b.loc);
  });
}

function escapeXml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** Serializa las entradas a un `urlset` sin BOM y con salto de línea final. */
export function renderSitemap(entries) {
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
