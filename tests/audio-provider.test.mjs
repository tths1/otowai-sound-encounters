import test from 'node:test';
import assert from 'node:assert/strict';
await import('../static-site/audio-provider.js');
const {createAudioProvider, createAudioSession, playbackRate} = globalThis.OtowaiAudio;
test('provider validates input before network and rejects non audio/empty', async () => {
  let calls = 0;
  const provider = createAudioProvider({fetch: async () => {calls++; return new Response('{}', {headers:{'content-type':'application/json'}});}});
  await assert.rejects(provider.generateAudio({text:''}));
  assert.equal(calls, 0);
  await assert.rejects(provider.generateAudio({text:'あ'}), {code:'AUDIO_INVALID_RESPONSE'});
  await assert.rejects(createAudioProvider({fetch:async()=>new Response('',{headers:{'content-type':'audio/mpeg'}})}).generateAudio({text:'あ'}));
});
test('provider sends normalized request and retains original blob', async () => {
  let sent;
  const provider = createAudioProvider({fetch:async (url, init)=>{sent=JSON.parse(init.body); assert.equal(url,'/api/audio'); return new Response('audio',{headers:{'content-type':'audio/mpeg'}});}});
  const result = await provider.generateAudio({text:'あ'});
  assert.equal(sent.language,'ja-JP'); assert.equal(result.provider,'ai');
  assert.equal(await result.blob.text(),'audio');
});
test('public requests include a visitor token and quota exhaustion stops polling',async()=>{
 let calls=0;
 const provider=createAudioProvider({fetch:async(url,init)=>{
   calls++;assert.match(init.headers['X-Audio-Visitor'],/^[a-f0-9-]{36}$/);
   return Response.json({code:'AUDIO_DAILY_LIMIT'},{status:429});
 },sleep:async()=>{throw Error('must not poll exhausted quota');}});
 await assert.rejects(provider.generateAudio({text:'こんにちは'}),{code:'AUDIO_DAILY_LIMIT'});
 assert.equal(calls,1);
});
test('session caches generation, matches duration, and cleans URLs', async () => {
  let generated=0, revoked=0, paused=0;
  const audio={duration:10, playbackRate:1, play:async()=>{}, pause:()=>paused++, removeAttribute(){},load(){}};
  const session=createAudioSession({text:'あ'}, {provider:{generateAudio:async()=>{generated++; return {blob:new Blob(['audio'],{type:'audio/mpeg'})};}},makeAudio:()=>audio,url:{createObjectURL:()=> 'blob:test',revokeObjectURL:()=>revoked++}});
  await session.play(5,1.2); assert.equal(audio.playbackRate,2.4);
  await session.generate(); assert.equal(generated,1);
  session.dispose(); assert.equal(revoked,1); assert.ok(paused);
  await assert.rejects(session.generate());
});
test('playback rate is safe for invalid durations', () => {
  for (const n of [0,NaN,Infinity,-1]) assert.equal(playbackRate(n,5,1),1);
  assert.equal(playbackRate(100,1,1),4);
});
test('late generation after disposal cannot create a URL',async()=>{
  let resolve, urls=0;
  const session=createAudioSession({text:'あ'},{provider:{generateAudio:()=>new Promise(r=>resolve=r)},url:{createObjectURL:()=>{urls++;},revokeObjectURL(){}}});
  const pending=session.generate(); session.dispose(); resolve({blob:new Blob(['a'])});
  await assert.rejects(pending); assert.equal(urls,0);
});
test('async jobs poll every five seconds and never recreate a pending task',async()=>{
  const requests=[],delays=[];
  const provider=createAudioProvider({sleep:async ms=>delays.push(ms),fetch:async (_url,init)=>{
    requests.push(JSON.parse(init.body));
    if(requests.length<3)return Response.json({status:'processing'},{status:202});
    return new Response('audio',{headers:{'content-type':'audio/mpeg'}});
  }});
  assert.equal(await (await provider.generateAudio({text:'あ'})).blob.text(),'audio');
  assert.deepEqual(requests.map(r=>r.action),['create','query','query']);
  assert.equal(new Set(requests.map(r=>r.requestId)).size,1);
  assert.deepEqual(delays,[5000,5000]);
});
test('429 retries same request ID; uncertain submission retry reuses ID',async()=>{
  const requests=[];let first=true;
  const provider=createAudioProvider({sleep:async()=>{},fetch:async(_url,init)=>{
    requests.push(JSON.parse(init.body));
    if(first){first=false;return new Response('',{status:429});}
    return new Response('',{status:502});
  }});
  await assert.rejects(provider.generateAudio({text:'あ'}));
  await assert.rejects(provider.generateAudio({text:'あ'}));
  assert.equal(requests.length,3);
  assert.equal(new Set(requests.map(r=>r.requestId)).size,1);
});
test('cancel during pending wait never sends another query',async()=>{
  let calls=0;const abort=new AbortController();
  const provider=createAudioProvider({fetch:async()=>{calls++;abort.abort();return Response.json({status:'processing'},{status:202});}});
  await assert.rejects(provider.generateAudio({text:'あ'},abort.signal));
  assert.equal(calls,1);
});
test('deadline expiry is distinguished from user cancellation',async()=>{
  const provider=createAudioProvider({timeoutMs:5,fetch:async()=>Response.json({status:'processing'},{status:202})});
  await assert.rejects(provider.generateAudio({text:'あ'}),{code:'AUDIO_TIMEOUT'});
});
test('local preview error is actionable and does not expose upstream details',async()=>{
 const provider=createAudioProvider({fetch:async()=>Response.json({error:'LOCAL_PREVIEW_ONLY',message:'secret upstream details'},{status:503})});
 await assert.rejects(provider.generateAudio({text:'あ'}),error=>error.code==='LOCAL_PREVIEW_ONLY' && /本地预览/.test(error.userMessage) && !error.userMessage.includes('secret'));
});
test('progress reflects submission, synthesis and download, not made-up percentages',async()=>{
 let calls=0;const stages=[];
 const provider=createAudioProvider({onProgress:(_message,stage)=>stages.push(stage),sleep:async()=>{},fetch:async()=>++calls===1?Response.json({status:'processing'},{status:202}):new Response('audio',{headers:{'content-type':'audio/mpeg'}})});
 await provider.generateAudio({text:'あ'});
 assert.deepEqual(stages,['submitting','synthesizing','downloading']);
});
test('session exposes the same cached player for native seeking without regeneration',async()=>{
 let calls=0;const audio={duration:3,play:async()=>{},pause(){},removeAttribute(){},load(){}};
 const session=createAudioSession({text:'あ'},{provider:{generateAudio:async()=>{calls++;return {blob:new Blob(['audio'])};}},makeAudio:()=>audio,url:{createObjectURL:()=> 'blob:test',revokeObjectURL(){}}});
 assert.equal(session.getAudioElement(),null);
 await session.generate();assert.equal(session.getAudioElement(),audio);
 audio.currentTime=2;await session.download();assert.equal(calls,1);assert.equal(audio.currentTime,2);
 session.dispose();assert.equal(session.getAudioElement(),null);
});
test('terminal task failure retains its safe code and never creates another task automatically',async()=>{
 const requests=[];
 const provider=createAudioProvider({sleep:async()=>{},fetch:async(_url,init)=>{
  requests.push(JSON.parse(init.body));
  return requests.length===1?Response.json({status:'processing'},{status:202}):Response.json({code:'AUDIO_TASK_FAILED',message:'secret upstream detail'},{status:502});
 }});
 await assert.rejects(provider.generateAudio({text:'あ'}),error=>error.code==='AUDIO_TASK_FAILED'&&!error.userMessage.includes('secret'));
 assert.deepEqual(requests.map(r=>r.action),['create','query']);
});
