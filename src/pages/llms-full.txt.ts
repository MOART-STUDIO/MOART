import { buildCatalogFacts, renderLlmsFullTxt } from "@/data/llms.js";

export async function GET() {
  const facts = await buildCatalogFacts();
  const body = renderLlmsFullTxt(facts);

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
