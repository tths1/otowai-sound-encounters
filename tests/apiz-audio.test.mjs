import test from 'node:test';
import assert from 'node:assert/strict';
import {createApizAudioHandler} from '../netlify/functions/lib/apiz-audio.mjs';
await import('../static-site/audio-provider.js');

// In-memory implementation of the real store's atomic conditional-write contract.
function memoryStore() {
  const entries=new Map(); let revision=0;
  return {
    async getWithMetadata(key){return entries.has(key)?structuredClone(entries.get(key)):null;},
    async set(key,data,options={}) {
      if(options.onlyIfNew && entries.has(key))return {modified:false};
      const etag=String(++revision);entries.set(key,{data:structuredClone(data),etag,metadata:options.metadata||{}});return {modified:true,etag};
    },
    async setJSON(key,data,condition={}) {
      const old=entries.get(key);
      if (condition.onlyIfNew && old || condition.onlyIfMatch && old?.etag!==condition.onlyIfMatch) return {modified:false};
      const etag=String(++revision);entries.set(key,{data:structuredClone(data),etag});return {modified:true,etag};
    },
  };
}
const env={AI_AUDIO_ENABLED:'true',APIZ_API_KEY:'test-only-key'};
const req=body=>new Request('https://site.test/api/audio',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
const create=id=>({action:'create',requestId:id,text:'に はお',language:'ja-JP',speed:1});
const id=n=>`00000000-0000-4000-8000-${String(n).padStart(12,'0')}`;
function setup(fetch,extra={}) {return createApizAudioHandler({env,store:memoryStore(),authorize:async()=> 'owner',fetch,...extra});}
test('selected Japanese voice reaches provider and cannot change on the same task ID',async()=>{
 const calls=[];
 const handler=setup(async(_url,init)=>{calls.push(JSON.parse(init.body));return Response.json({data:{task_id:'voice-task',status:'pending'}});},{env:{...env,AI_AUDIO_VOICE_ID:'Japanese_CalmLady'}});
 const male={...create(id(301)),voice:'Japanese_GentleButler'};
 assert.equal((await handler(req(male))).status,202);
 assert.equal(calls[0].params.voice_id,'Japanese_GentleButler');
 assert.equal(calls[0].params.language_boost,'Japanese');
 assert.equal(calls[0].params.speed,1);
 assert.equal((await handler(req({...male,voice:'Japanese_CalmLady'}))).status,409);
 assert.equal((await handler(req(male))).status,202);
 assert.equal(calls.length,1);
 assert.equal((await handler(req({...create(id(302)),voice:'default'}))).status,202);
 assert.equal(calls[1].params.voice_id,'Japanese_CalmLady');
 assert.equal((await handler(req({...create(id(302)),voice:'Japanese_CalmLady'}))).status,202);
 assert.equal(calls.length,2);
});
test('unselected or malformed voices are rejected before any paid submission',async()=>{
 let calls=0;
 const handler=setup(async()=>{calls++;return Response.json({data:{task_id:'t'}});});
 for(const voice of ['Japanese_KindLady','arbitrary',null,123,{}]){
  assert.equal((await handler(req({...create(id(303)),voice}))).status,400);
 }
 assert.equal(calls,0);
});
test('extreme high preset sends verified effects without changing normal voice or task identity',async()=>{
 const calls=[];
 const handler=setup(async(_url,init)=>{calls.push(JSON.parse(init.body));return Response.json({data:{task_id:'high-task',status:'pending'}});});
 const high={...create(id(305)),voice:'Japanese_CalmLady_ExtremeHigh'};
 assert.equal((await handler(req(high))).status,202);
 assert.equal(calls[0].params.voice_id,'Japanese_CalmLady');
 assert.equal(calls[0].params.speed,1);
 assert.deepEqual(calls[0].params.voice_setting,{voice_id:'Japanese_CalmLady',speed:1,vol:1,pitch:12,emotion:'calm'});
 assert.deepEqual(calls[0].params.voice_modify,{pitch:100,intensity:100,timbre:100});
 assert.equal((await handler(req({...high,voice:'Japanese_CalmLady'}))).status,409);
 const normal={...create(id(306)),voice:'Japanese_CalmLady'};
 assert.equal((await handler(req(normal))).status,202);
 assert.equal(calls[1].params.voice_setting,undefined);
 assert.equal(calls[1].params.voice_modify,undefined);
 assert.equal((await handler(req({...normal,voice:high.voice}))).status,409);
 assert.equal(calls.length,2);
});
test('mild low uses approved pitch without extreme effects and has independent task identity',async()=>{
 const calls=[];
 const handler=setup(async(_url,init)=>{calls.push(JSON.parse(init.body));return Response.json({data:{task_id:'low-task',status:'pending'}});});
 const low={...create(id(307)),voice:'Japanese_GentleButler_MildLow'};
 assert.equal((await handler(req(low))).status,202);
 assert.equal(calls[0].params.voice_id,'Japanese_GentleButler');
 assert.equal(calls[0].params.speed,1);
 assert.equal(calls[0].params.language_boost,'Japanese');
 assert.deepEqual(calls[0].params.voice_setting,{voice_id:'Japanese_GentleButler',speed:1,vol:1,pitch:-4,emotion:'calm'});
 assert.equal(calls[0].params.voice_modify,undefined);
 assert.equal((await handler(req({...low,voice:'Japanese_GentleButler'}))).status,409);
 assert.equal((await handler(req(low))).status,202);
 assert.equal(calls.length,1);
});
test('disabled or non-admin never starts a paid request',async()=>{
  const fetch=()=>{throw Error('must not call');};
  assert.equal((await setup(fetch,{env:{}})(req(create(id(1))))).status,503);
  assert.equal((await setup(fetch,{authorize:async()=>null})(req(create(id(1))))).status,403);
});
test('creates exact documented female payload only once for repeated request IDs',async()=>{
  const calls=[];
  const handler=setup(async(url,init)=>{calls.push({url,init});return Response.json({data:{task_id:'task1',status:'pending'}});});
  const first=await handler(req(create(id(1))));
  assert.equal(first.status,202);
  assert.equal((await handler(req(create(id(1))))).status,202);
  assert.equal(calls.length,1);
  assert.equal(calls[0].url,'https://api.apiz.ai/api/v3/tasks/create');
  assert.equal(calls[0].init.headers.Authorization,'Bearer test-only-key');
  assert.deepEqual(JSON.parse(calls[0].init.body),{model:'minimax/t2a',params:{text:'に はお',voice_id:'Chinese (Mandarin)_Crisp_Girl',language_boost:'Japanese',model:'speech-2.8-hd',speed:1,emotion:'calm',output_format:'url',continuous_sound:true}});
  assert.doesNotMatch(await first.text(),/test-only-key|task1/);
});
test('six shared reservations across visitors; seventh does not reach provider',async()=>{
  const store=memoryStore();let calls=0;
  const fetch=async()=>{calls++;return Response.json({data:{task_id:'t'+calls,status:'pending'}});};
  const handlers=Array.from({length:7},(_,i)=>setup(fetch,{store,authorize:async()=>`visitor-${i}`}));
  const results=await Promise.all(handlers.map((h,i)=>h(req(create(id(i+1))))));
  assert.equal(results.filter(r=>r.status===202).length,6);
  assert.equal(results.filter(r=>r.status===429).length,1);assert.equal(calls,6);
});
test('200 character cap is enforced before any upstream call',async()=>{
 let calls=0;const handler=setup(async()=>{calls++;return Response.json({data:{task_id:'t'}});});
 assert.equal((await handler(req({...create(id(98)),text:'あ'.repeat(201)}))).status,400);
 assert.equal(calls,0);
 assert.equal((await handler(req({...create(id(99)),text:'あ'.repeat(200)}))).status,202);
});
test('shared rolling minute quota allows three, rejects fourth and resets after a minute',async()=>{
 let calls=0,time=1_000_000;const store=memoryStore();
 const fetch=async()=>{calls++;return Response.json({data:{task_id:'t'}});};
 const handler=()=>setup(fetch,{store,now:()=>time});
 for(let n=1;n<=3;n++)assert.equal((await handler()(req(create(id(n))))).status,202);
 assert.equal((await handler()(req(create(id(1))))).status,202);
 const fourth=await handler()(req(create(id(4))));assert.equal(fourth.status,429);
 assert.equal((await fourth.json()).code,'AUDIO_VISITOR_LIMIT');assert.equal(calls,3);
 time+=60001;assert.equal((await handler()(req(create(id(4))))).status,202);assert.equal(calls,4);
});
test('query pending then completion downloads MP3 without forwarding credentials',async()=>{
  let phase=0;
  const handler=setup(async(url,init)=>{
    if(url.endsWith('/create'))return Response.json({data:{task_id:'t1'}});
    if(url.endsWith('/query'))return Response.json({data:++phase===1?{status:'processing'}:{status:'completed',output:{audio_url:'https://cdn.example.test/a.mp3'}}});
    assert.equal(init.headers?.Authorization,undefined);
    return new Response('mp3',{headers:{'content-type':'audio/mpeg'}});
  },{checkAudioUrl:async url=>url});
  await handler(req(create(id(1))));
  assert.equal((await handler(req({action:'query',requestId:id(1)}))).status,202);
  const res=await handler(req({action:'query',requestId:id(1)}));
  assert.equal(res.status,200);assert.equal(await res.text(),'mp3');
});
test('uncertain submission is not retried, explicit 429 is retryable',async()=>{
  let calls=0;
  const handler=setup(async()=>{calls++;throw Error('secret upstream body');});
  assert.equal((await handler(req(create(id(1))))).status,502);
  assert.equal((await handler(req(create(id(1))))).status,409);
  assert.equal(calls,1);
  let limited=0;
  const retry=setup(async()=>++limited===1?new Response('',{status:429}):Response.json({data:{task_id:'t1'}}));
  assert.equal((await retry(req(create(id(2))))).status,429);
  assert.equal((await retry(req(create(id(2))))).status,202);
});
test('foreign task access denied, failed upstream errors redacted',async()=>{
  const store=memoryStore();
  const fetch=async url=>Response.json({data:url.endsWith('/create')?{task_id:'t'}:{status:'failed',error:'secret'}});
  const handler=setup(fetch,{store});await handler(req(create(id(1))));
  assert.equal((await setup(fetch,{store,authorize:async()=> 'other'})(req({action:'query',requestId:id(1)}))).status,403);
  const failed=await handler(req({action:'query',requestId:id(1)}));
  assert.equal(failed.status,502);assert.doesNotMatch(await failed.text(),/secret/);
});
test('cross-site requests cannot spend an admin balance',async()=>{
  let calls=0;
  const handler=setup(async()=>{calls++;return Response.json({data:{task_id:'t'}});});
  const response=await handler(new Request('https://site.test/api/audio',{method:'POST',headers:{Origin:'https://attacker.test','Content-Type':'text/plain'},body:JSON.stringify(create(id(8)))}));
  assert.equal(response.status,403);assert.equal(calls,0);
});
test('browser provider completes real create/query handler protocol into a Blob',async()=>{
  const operations=[];
  const handler=setup(async(url,init)=>{
    operations.push(url);
    if(url.endsWith('/create'))return Response.json({data:{task_id:'e2e-task',status:'pending'}});
    if(url.endsWith('/query'))return Response.json({data:{status:'completed',output:{url:'https://cdn.example.test/audio.mp3'}}});
    assert.equal(init.headers?.Authorization,undefined);
    return new Response('test-mp3-bytes',{headers:{'content-type':'audio/mpeg'}});
  },{checkAudioUrl:async url=>url});
  const provider=globalThis.OtowaiAudio.createAudioProvider({sleep:async()=>{},fetch:(_url,init)=>handler(new Request('https://site.test/api/audio',init))});
  const result=await provider.generateAudio({text:'に はお'});
  assert.equal(await result.blob.text(),'test-mp3-bytes');
  assert.equal(result.mimeType,'audio/mpeg');
  assert.deepEqual(operations,['https://api.apiz.ai/api/v3/tasks/create','https://api.apiz.ai/api/v3/tasks/query','https://cdn.example.test/audio.mp3']);
});
test('immediate completion persists audio; a fresh handler serves it after URL expiry',async()=>{
  const store=memoryStore();let calls=0;
  const fetch=async url=>{
    calls++;
    if(url.endsWith('/create'))return Response.json({data:{status:'completed',output:{audio_url:'https://cdn.example.test/instant.mp3'}}});
    assert.equal(url,'https://cdn.example.test/instant.mp3');
    return new Response('durable-mp3',{headers:{'content-type':'audio/mpeg'}});
  };
  const first=await setup(fetch,{store,checkAudioUrl:async url=>url})(req(create(id(99))));
  assert.equal(first.status,200);assert.equal(await first.text(),'durable-mp3');assert.equal(calls,2);
  const offline=setup(()=>{throw Error('temporary URL expired');},{store});
  const cached=await offline(req({action:'query',requestId:id(99)}));
  assert.equal(cached.status,200);assert.equal(await cached.text(),'durable-mp3');
});
test('storage failure does not report durable success or submit a second paid job',async()=>{
  const store=memoryStore();let creates=0,saves=0;
  const save=store.set;
  store.set=async(...args)=>{if(!saves++)throw Error('temporary storage failure');return save(...args);};
  const handler=setup(async url=>{
    if(url.endsWith('/create')){creates++;return Response.json({data:{task_id:'t',status:'completed',output:{url:'https://cdn.example.test/file.mp3'}}});}
    return new Response('mp3',{headers:{'content-type':'audio/mpeg'}});
  },{store,checkAudioUrl:async url=>url});
  assert.equal((await handler(req(create(id(98))))).status,502);
  assert.equal((await handler(req({action:'query',requestId:id(98)}))).status,200);
  assert.equal(creates,1);assert.equal(saves,2);
});
test('retry after transient terminal-slot release failure restores all six slots',async()=>{
  const store=memoryStore();let releaseFails=true,creates=0,time=100000;
  const set=store.setJSON;
  store.setJSON=async(key,data,condition)=>{
    if(key.includes('/slots/') && data.requestId===null && releaseFails){releaseFails=false;throw Error('storage unavailable');}
    return set(key,data,condition);
  };
  const handler=setup(async url=>{
    if(url.endsWith('/create'))return Response.json({data:++creates===1?{status:'completed',output:{url:'https://cdn.example.test/a.mp3'}}:{task_id:'task'+creates,status:'pending'}});
    return new Response('mp3',{headers:{'content-type':'audio/mpeg'}});
  },{store,checkAudioUrl:async url=>url,now:()=>time});
  assert.equal((await handler(req(create(id(201))))).status,502);
  assert.equal((await handler(req({action:'query',requestId:id(201)}))).status,200);
  for(let i=202;i<208;i++){time+=60001;assert.equal((await handler(req(create(id(i))))).status,202);}
});
