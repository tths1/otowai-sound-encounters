import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

async function read(relativePath) {
  return readFile(new URL(relativePath, root), "utf8");
}

test("AI mapping specification defines a reviewable lifecycle", async () => {
  const spec = await read("docs/ai-mapping-spec.md");

  assert.match(spec, /draft_ai_generated/);
  assert.match(spec, /pending_review/);
  assert.match(spec, /published/);
  assert.match(spec, /不得直接覆盖已发布映射/);
});

test("mapping fixture covers normal, ambiguous, and invalid inputs", async () => {
  const cases = JSON.parse(await read("tests/fixtures/mapping-cases.json"));
  const tags = new Set(cases.flatMap((item) => item.tags));

  assert.ok(cases.length >= 10);
  assert.ok(tags.has("多音字"));
  assert.ok(tags.has("同音字"));
  assert.ok(tags.has("长句"));
  assert.ok(tags.has("边界条件"));
  assert.equal(cases.find((item) => item.id === "empty-input").mustReject, true);
});
