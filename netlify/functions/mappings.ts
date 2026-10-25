import { getStore } from "@netlify/blobs";
import { getUser } from "@netlify/identity";
import type { Config, Context } from "@netlify/functions";

const STORE_NAME = "otowai-settings";
const STORE_KEY = "mappings";

export default async (req: Request, _context: Context) => {
  const store = getStore({ name: STORE_NAME, consistency: "strong" });

  if (req.method === "GET") {
    const mappings = await store.get(STORE_KEY, { type: "json" });
    return Response.json(mappings ?? { phoneticRows: null, updatedAt: null }, {
      headers: { "Cache-Control": "no-store" },
    });
  }

  if (req.method === "PUT") {
    const user = await getUser();
    if (!user) return new Response("Unauthorized", { status: 401 });
    if (!user.appMetadata?.roles?.includes("admin")) return new Response("Forbidden", { status: 403 });

    const body = await req.json();
    if (!body || !Array.isArray(body.phoneticRows) || body.phoneticRows.length > 3000) {
      return new Response("Invalid mappings", { status: 400 });
    }
    if (body.dictionaryBaseline !== undefined) {
      if (!Array.isArray(body.dictionaryBaseline) || body.dictionaryBaseline.length > 3000) return new Response("Invalid dictionary baseline", { status: 400 });
      for (const row of body.dictionaryBaseline) {
        if (!row || typeof row.chars !== 'string' || row.chars.length > 10000 || typeof row.romaji !== 'string' || row.romaji.length > 100) return new Response("Invalid dictionary baseline", { status: 400 });
      }
    }
    const payload = {
      phoneticRows: body.phoneticRows,
      ...(body.dictionaryBaseline ? {dictionaryBaseline:body.dictionaryBaseline} : {}),
      updatedAt: new Date().toISOString(),
    };
    await store.setJSON(STORE_KEY, payload);
    return Response.json(payload);
  }

  return new Response("Method not allowed", { status: 405, headers: { Allow: "GET, PUT" } });
};

export const config: Config = {
  path: "/api/mappings",
  method: ["GET", "PUT"],
};
