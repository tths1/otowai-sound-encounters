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

    const body = await req.json();
    if (!body || !Array.isArray(body.phoneticRows) || body.phoneticRows.length > 3000) {
      return new Response("Invalid mappings", { status: 400 });
    }
    const payload = {
      phoneticRows: body.phoneticRows,
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
