import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
const url=new URL('../scripts/local-audio-backend.mjs',import.meta.url);
const {loadLocalAudioSettings}=existsSync(url)?await import(url):{};
test('local audio loads only production speech configuration for the intended site',async()=>{
 assert.equal(typeof loadLocalAudioSettings,'function');
 const requested=[];
 const settings=await loadLocalAudioSettings({
  readFile:async p=>JSON.stringify(String(p).includes('state.json')?{siteId:'site'}:{userId:'owner',users:{owner:{auth:{token:'private-token'}}}}),
  fetch:async(url,options)=>{
   requested.push(url);assert.equal(options.headers.Authorization,'Bearer private-token');
   if(url.endsWith('/sites/site'))return Response.json({name:'otowai-sound-encounters',account_id:'account'});
   const key=new URL(url).pathname.split('/').pop();
   return Response.json({key,values:[{context:'deploy-preview',value:'wrong-preview'},{context:'all',value:'fallback'},{context:'production',value:key==='APIZ_API_KEY'?'sk-testonlynotreal':key==='AI_AUDIO_ENABLED'?'true':key==='AI_AUDIO_VOICE_ID'?'Japanese_CalmLady':'20000'}]});
  }
 });
 assert.equal(settings.env.APIZ_API_KEY,'sk-testonlynotreal');
 assert.equal(settings.env.AI_AUDIO_VOICE_ID,'Japanese_CalmLady');
 assert.equal(settings.env.AI_AUDIO_ENABLED,'true');
 assert.equal(requested.length,5);
 assert.ok(requested.every(url=>!url.includes('GEMINI')));
});
test('masked Netlify secrets fail closed before any synthesis can start',async()=>{
 assert.equal(typeof loadLocalAudioSettings,'function');
 await assert.rejects(()=>loadLocalAudioSettings({
  localApiKey:'',
  readFile:async p=>JSON.stringify(String(p).includes('state.json')?{siteId:'site'}:{userId:'owner',users:{owner:{auth:{token:'private'}}}}),
  fetch:async url=>url.endsWith('/sites/site')?Response.json({name:'otowai-sound-encounters',account_id:'account'}):Response.json({values:[{context:'production',value:url.includes('AI_AUDIO_ENABLED')?'true':'[REDACTED_SECRET]'}]})
 }),/secret.*hidden|local.*key/i);
});
test('local audio refuses a different site before reading any secrets',async()=>{
 assert.equal(typeof loadLocalAudioSettings,'function');
 let calls=0;
 await assert.rejects(()=>loadLocalAudioSettings({
  readFile:async p=>JSON.stringify(String(p).includes('state.json')?{siteId:'other'}:{userId:'owner',users:{owner:{auth:{token:'private'}}}}),
  fetch:async()=>{calls++;return Response.json({name:'unrelated-site'});}
 }),/site/i);
 assert.equal(calls,1);
});
