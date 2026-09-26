import { buildSitemapEntries, renderSitemap } from "@/data/sitemap.js";

export async function GET() {
  const entries = await buildSitemapEntries();
  const body = renderSitemap(entries);

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
