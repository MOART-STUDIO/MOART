import { BASE_PATH, siteUrl } from "@/data/site.js";

/** Páginas privadas o sin valor de búsqueda. */
const DISALLOWED = ["/cart", "/404", "/api/"];

/** `Disallow` admite rutas, no URLs absolutas: se antepone el base del despliegue. */
const disallowPath = (path: string) => `${BASE_PATH}${path}`;

const lines = (robots: string[], allowAi: boolean) => {
  const block = [
    ...robots.map((rule) => `User-agent: ${rule}`),
    "Allow: /",
    ...DISALLOWED.map((path) => `Disallow: ${disallowPath(path)}`),
    ...(allowAi ? [] : ["Disallow: /"]),
    "",
    `Sitemap: ${siteUrl("/sitemap.xml")}`,
  ];
  return block.join("\n");
};

export function GET() {
  const body = [
    lines(["*"], true),
    lines(["GPTBot"], true),
    lines(["OAI-SearchBot", "ChatGPT-User"], true),
    lines(["ClaudeBot", "Claude-User", "Claude-SearchBot"], true),
    lines(["PerplexityBot", "Perplexity-User"], true),
    lines(["Google-Extended"], true),
    lines(["Applebot-Extended", "Applebot"], true),
    lines(["CCBot"], true),
    lines(["Bingbot"], true),
    lines(["Amazonbot", "meta-externalagent", "cohere-ai", "Diffbot"], true),
    "",
  ].join("\n\n");

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
