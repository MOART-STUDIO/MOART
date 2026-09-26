/**
 * Escribe `sitemap.xml` como archivo estático real al terminar el build.
 *
 * Por qué un plugin y no `src/pages/sitemap.xml.ts`: en salida estática Astro
 * descarta los headers de la respuesta, así que el content-type pasa a depender
 * del servidor, que es justo lo que Google Search Console rechazaba. Al
 * escribir un `.xml` físico, el hosting lo sirve como `application/xml` por
 * extensión, sin depender de ninguna cabecera.
 */
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, relative } from "node:path";
import { buildSitemapEntries, renderSitemap } from "../src/data/sitemap.mjs";

/** @param {{ contentDir: string }} options */
export function sitemapFile({ contentDir }) {
  /** Se captura en `config:setup` porque `build:done` ya no incluye la config. */
  let site = "http://localhost:4321";
  let base = "/";

  return {
    name: "moart-sitemap-file",
    hooks: {
      "astro:config:setup": ({ config }) => {
        // Refleja los overrides de CLI (`--site`, `--base`) del despliegue.
        site = config.site ? String(config.site) : site;
        base = config.base ?? "/";
      },
      "astro:build:done": ({ pages, dir, logger }) => {
        const entries = buildSitemapEntries({
          site,
          base,
          pages: pages.map((page) => page.pathname),
          contentDir,
        });

        const target = join(fileURLToPath(dir), "sitemap.xml");
        writeFileSync(target, renderSitemap(entries), "utf8");

        logger.info(
          `sitemap.xml: ${entries.length} URLs -> ${relative(process.cwd(), target)}`,
        );
      },
    },
  };
}
