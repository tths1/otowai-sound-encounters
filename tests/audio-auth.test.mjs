import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {getUser} from '../netlify/functions/node_modules/@netlify/identity/dist/main.js';
import {createHash} from 'node:crypto';
import {createApizAudioHandler} from '../netlify/functions/lib/apiz-audio.mjs';

test('audio route accepts anonymous visitor token but requires trusted platform IP', async()=>{
  const source=readFileSync(new URL('../netlify/functions/audio.ts',import.meta.url),'utf8')
    .replace(/^import .*;\n/gm,'').replace('export default','globalThis.handler =').replace(': Request','')
    .replace(/export const config[^\n]*/,'');
  const context=vm.createContext({Response,process:{env:{AI_AUDIO_ENABLED:'true',APIZ_API_KEY:'test-only'}},
    getStore:()=>({}),getUser,createHash,createApizAudioHandler});
  vm.runInContext(source,context);
  const previous=globalThis.netlifyIdentityContext;
  try {
    for(const [roles,status] of [[['admin'],400],[[],400]]) {
      globalThis.netlifyIdentityContext={user:{sub:'test-admin',app_metadata:{roles}}};
      const response=await context.handler(new Request('https://example.com/api/audio',{
        method:'POST',headers:{'Content-Type':'application/json','X-Audio-Visitor':'00000000-0000-4000-8000-000000000001'},body:'{}'}),{ip:'203.0.113.10'});
      assert.equal(response.status,status);
    }
    globalThis.netlifyIdentityContext=undefined;
    const request=()=>new Request('https://example.com/api/audio',{method:'POST',headers:{'Content-Type':'application/json','X-Audio-Visitor':'00000000-0000-4000-8000-000000000001'},body:'{}'});
    assert.equal((await context.handler(request(),{ip:'203.0.113.10'})).status,400);
    assert.equal((await context.handler(request(),{})).status,503);
  } finally {globalThis.netlifyIdentityContext=previous;}
});
