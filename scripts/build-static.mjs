import { access, cp, mkdir, rm } from "node:fs/promises";

await rm("dist", { recursive: true, force: true });
await mkdir("dist/client", { recursive: true });
await mkdir("dist/server", { recursive: true });
await cp("static-site/index.html", "dist/client/index.html");
await cp("static-site/app.js", "dist/client/app.js");
await cp("static-site/audio-provider.js", "dist/client/audio-provider.js");
await cp("static-site/collection-audio.js", "dist/client/collection-audio.js");
await cp("static-site/collection-audio", "dist/client/collection-audio", { recursive: true });
await cp("static-site/rules-backup.js", "dist/client/rules-backup.js");
await cp("static-site/pinyin-data.js", "dist/client/pinyin-data.js");
await cp("static-site/reading-dictionary.js", "dist/client/reading-dictionary.js");
await cp("static-site/pinyin-data-LICENSE.txt", "dist/client/pinyin-data-LICENSE.txt");
await cp("static-site/style.css", "dist/client/style.css");
await cp("static-site/admin", "dist/client/admin", { recursive: true });
await cp("static-site/a505d9e6bc9ff5393d5a4e4e7bf7fbc4.txt", "dist/client/a505d9e6bc9ff5393d5a4e4e7bf7fbc4.txt");
await cp("public/favicon.svg", "dist/client/favicon.svg");
await cp("public/og.png", "dist/client/og.png");
await cp("scripts/worker-static.js", "dist/server/index.js");
try {
  await access("static-site/maker-disclaimer.mp3");
  await cp("static-site/maker-disclaimer.mp3", "dist/client/maker-disclaimer.mp3");
} catch {
  // The generated tip audio is optional until the provider task completes.
}
