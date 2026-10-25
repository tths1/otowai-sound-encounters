import test from 'node:test';
import assert from 'node:assert/strict';
import {createAudioHandler} from '../netlify/functions/lib/audio-core.mjs';
const request=(body={text:'あ'},method='POST')=>new Request('https://example.test/api/audio',{method,...(method==='POST'?{body:JSON.stringify(body)}:{})});
const env={AI_AUDIO_ENABLED:'true',AI_AUDIO_URL:'https://api.example.test/tts',AI_AUDIO_KEY:'secret'};
test('method, validation and configuration checks',async()=>{
  const handler=createAudioHandler({env:{}});
  assert.equal((await handler(request(null,'GET'))).status,405);
  assert.equal((await handler(request({text:''}))).status,400);
  assert.equal((await handler(request())).status,503);
  assert.equal((await createAudioHandler({env})(request())).status,503);
});
test('adapter output is validated and upstream errors are redacted',async()=>{
  for (const response of [new Response('secret',{status:401}),new Response('secret',{headers:{'content-type':'application/json'}}),new Response('',{headers:{'content-type':'audio/mpeg'}})]) {
    const res=await createAudioHandler({env,adapter:async()=>response})(request());
    assert.equal(res.status,502); assert.doesNotMatch(await res.text(),/secret/);
  }
});
test('audio passthrough and bounded timeout',async()=>{
  const res=await createAudioHandler({env,adapter:async()=>new Response('sound',{headers:{'content-type':'audio/mpeg'}})})(request());
  assert.equal(res.status,200); assert.equal(await res.text(),'sound');
  const timeout=await createAudioHandler({env,timeoutMs:5,adapter:()=>new Promise(()=>{})})(request());
  assert.equal(timeout.status,504);
});
