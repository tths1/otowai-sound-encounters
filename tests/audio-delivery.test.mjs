import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
test('audio configuration is disabled by default and never bundled',()=>{
  const env=readFileSync('.env.example','utf8');
  assert.match(env,/AI_AUDIO_ENABLED=false/);
  assert.match(env,/AI_AUDIO_TIMEOUT_MS=/);
  assert.ok(existsSync('dist/client/audio-provider.js'));
  assert.equal(existsSync('dist/client/.env'),false);
  const page=readFileSync('dist/client/index.html','utf8');
  assert.ok(page.indexOf('/audio-provider.js')<page.indexOf('/app.js'));
  for(const path of ['dist/client/app.js','dist/client/audio-provider.js']) assert.doesNotMatch(readFileSync(path,'utf8'),/APIZ_API_KEY|AI_AUDIO_KEY|AI_AUDIO_URL/);
});
