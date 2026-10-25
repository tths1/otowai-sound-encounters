import { getUser } from "@netlify/identity";
import type { Config, Context } from "@netlify/functions";

const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const PROMPT_VERSION = "mapping-v1";
const MAX_SOURCE_LENGTH = 240;
const PUBLIC_AI_ENABLED = process.env.PUBLIC_AI_ENABLED === "true";
const PUBLIC_WINDOW_MS = 60_000;
const PUBLIC_MAX_REQUESTS = 5;
const requestBuckets = new Map<string, { startedAt: number; count: number }>();

function publicRequestAllowed(req: Request) {
  const now = Date.now();
  const address = req.headers.get("x-nf-client-connection-ip") || req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const current = requestBuckets.get(address);
  if (!current || now - current.startedAt >= PUBLIC_WINDOW_MS) {
    requestBuckets.set(address, { startedAt: now, count: 1 });
    if (requestBuckets.size > 1000) {
      for (const [key, bucket] of requestBuckets) {
        if (now - bucket.startedAt >= PUBLIC_WINDOW_MS) requestBuckets.delete(key);
      }
    }
    return true;
  }
  if (current.count >= PUBLIC_MAX_REQUESTS) return false;
  current.count += 1;
  return true;
}

const outputSchema = {
  type: "OBJECT",
  properties: {
    source: { type: "STRING" },
    pinyin: { type: "STRING" },
    kana: { type: "STRING" },
    romaji: { type: "STRING" },
    segments: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          source: { type: "STRING" },
          pinyin: { type: "STRING" },
          kana: { type: "STRING" },
          reason: { type: "STRING" },
        },
        required: ["source", "pinyin", "kana", "reason"],
      },
    },
    alternatives: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          kana: { type: "STRING" },
          romaji: { type: "STRING" },
          reason: { type: "STRING" },
        },
        required: ["kana", "romaji", "reason"],
      },
    },
    explanation: { type: "STRING" },
    confidence: { type: "NUMBER" },
    warnings: { type: "ARRAY", items: { type: "STRING" } },
  },
  required: [
    "source",
    "pinyin",
    "kana",
    "romaji",
    "segments",
    "alternatives",
    "explanation",
    "confidence",
    "warnings",
  ],
};

function promptFor(source: string, context: string) {
  return `你是“音逢”的中日谐音映射生成器。

请根据中文原文生成适合展示的日语假名谐音。这里是声音联想，不是翻译。

硬性要求：
1. 必须区分发音相似、真实日语词义和文化解释；
2. 不得声称生成结果是真实、标准或自然的日语表达；
3. 不确定时写入 warnings；
4. 保留中文原意，不要为了押音擅自改义；
5. 只返回符合 JSON Schema 的 JSON；
6. 生成一个主候选，最多三个备选，并逐段解释对应关系；
7. confidence 必须是 0 到 1 的保守估计。

中文原文：${source}
补充语境：${context || "无"}`;
}

function validateDraft(value: unknown, source: string) {
  if (!value || typeof value !== "object") throw new Error("模型返回格式无效");
  const draft = value as Record<string, unknown>;
  const requiredStrings = ["source", "pinyin", "kana", "romaji", "explanation"];
  for (const key of requiredStrings) {
    if (typeof draft[key] !== "string") throw new Error(`缺少字段: ${key}`);
  }
  if (draft.source !== source) throw new Error("模型篡改了原文");
  if (typeof draft.confidence !== "number" || draft.confidence < 0 || draft.confidence > 1) {
    throw new Error("confidence 必须在 0 到 1 之间");
  }
  if (!Array.isArray(draft.segments) || !Array.isArray(draft.alternatives) || !Array.isArray(draft.warnings)) {
    throw new Error("模型返回的数组字段无效");
  }
  if (draft.alternatives.length > 3) throw new Error("备选结果超过限制");
  return { ...draft, model: MODEL, promptVersion: PROMPT_VERSION, status: "pending_review" };
}

export default async (req: Request, _context: Context) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: { Allow: "POST" } });
  }

  if (PUBLIC_AI_ENABLED) {
    if (!publicRequestAllowed(req)) {
      return new Response("Too many AI requests", { status: 429, headers: { "Retry-After": "60" } });
    }
  } else {
    const user = await getUser();
    if (!user) return new Response("Unauthorized", { status: 401 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return new Response("GEMINI_API_KEY is not configured", { status: 503 });

  let body: { source?: unknown; context?: unknown };
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const source = typeof body.source === "string" ? body.source.trim() : "";
  const context = typeof body.context === "string" ? body.context.trim() : "";
  if (!source || source.length > MAX_SOURCE_LENGTH || context.length > MAX_SOURCE_LENGTH) {
    return new Response("Invalid source or context", { status: 400 });
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: promptFor(source, context) }] }],
        generationConfig: {
          temperature: 0.35,
          responseMimeType: "application/json",
          responseSchema: outputSchema,
        },
      }),
    },
  );

  if (!response.ok) {
    const detail = await response.text();
    console.error("Gemini mapping request failed", response.status, detail.slice(0, 500));
    return new Response("AI mapping request failed", { status: response.status === 429 ? 429 : 502 });
  }

  const payload = await response.json() as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const text = payload.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) return new Response("AI returned no mapping", { status: 502 });

  try {
    const draft = validateDraft(JSON.parse(text), source);
    return Response.json(draft, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Invalid Gemini mapping draft", error);
    return new Response("AI mapping draft failed validation", { status: 502 });
  }
};

export const config: Config = {
  path: "/api/ai/mapping",
  method: "POST",
};
