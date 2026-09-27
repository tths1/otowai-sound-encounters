import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

async function read(relativePath) {
  return readFile(new URL(relativePath, root), "utf8");
}

test("public page exposes the core sound-exploration journey", async () => {
  const html = await read("static-site/index.html");

  assert.match(html, /音逢/);
  assert.match(html, /空耳制造器/);
  assert.match(html, /id="maker"/);
  assert.match(html, /id="collection"/);
  assert.match(html, /id="project"/);
  assert.match(html, /深色模式/);
});

test("static build keeps public assets and private editor entry", async () => {
  const build = await read("scripts/build-static.mjs");

  assert.match(build, /static-site\/style\.css/);
  assert.match(build, /static-site\/admin/);
  assert.match(build, /a505d9e6bc9ff5393d5a4e4e7bf7fbc4\.txt/);
});

test("generator implementation keeps phonetic rather than semantic boundaries", async () => {
  const script = await read("static-site/app.js");

  assert.match(script, /pinyin/i);
  assert.match(script, /SpeechSynthesisUtterance/);
  assert.match(script, /localStorage/);
  assert.doesNotMatch(script, /translation API/i);
});
