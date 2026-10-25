// One-off approved experiment; never changes the website's voice presets.
// Run: ALLOW_PAID_EXTREME_TEST=true node --env-file=.env.local scripts/check-extreme-voices-live.mjs
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {createHash,randomUUID} from 'node:crypto';
import {loadLocalAudioSettings} from './local-audio-backend.mjs';
import {createApizAudioHandler} from '../netlify/functions/lib/apiz-audio.mjs';
import {downloadAudio} from '../netlify/functions/lib/audio-download.mjs';
import {getStore} from '../netlify/functions/node_modules/@netlify/blobs/dist/main.js';

if(process.env.ALLOW_PAID_EXTREME_TEST!=='true')throw Error('Paid voice sample requires approval');
const mildLowOnly=process.argv.includes('--mild-low');
if(mildLowOnly && process.argv.includes('--retry-low-once'))throw Error('Cannot combine different experiments');
const profiles=mildLowOnly ? [
 {name:'mild-low',voice:'Japanese_GentleButler',pitch:-4},
] : [
 {name:'extreme-low',voice:'Japanese_GentleButler',pitch:-12,modify:{pitch:-100,intensity:-100,timbre:-100}},
 {name:'extreme-high',voice:'Japanese_CalmLady',pitch:12,modify:{pitch:100,intensity:100,timbre:100}},
];
// Read the actual intermediary's schema, not just MiniMax's direct API docs.
const schemaResponse=await fetch('https://api.apiz.ai/api/v3/models/minimax%2Ft2a',{signal:AbortSignal.timeout(20000)});
if(!schemaResponse.ok)throw Error('Cannot verify provider parameter schema');
const properties=(await schemaResponse.json()).data?.params_schema?.properties;
for(const profile of profiles){
 const pitch=properties?.voice_setting?.properties?.pitch;
 if(!pitch || profile.pitch<pitch.minimum || profile.pitch>pitch.maximum)throw Error('Voice pitch outside documented range');
 for(const [key,value] of Object.entries(profile.modify || {})){
  const rule=properties?.voice_modify?.properties?.[key];
  if(!rule || value<rule.minimum || value>rule.maximum)throw Error('Voice effect outside documented range');
 }
}
const settings=await loadLocalAudioSettings();
const store=getStore({name:'otowai-audio-jobs',consistency:'strong',siteID:settings.siteID,token:settings.token});
const digest=value=>createHash('sha256').update(`${settings.env.APIZ_API_KEY}:${value}`).digest('hex');
const dir=new URL(mildLowOnly ? '../outputs/mild-voice-tests/' : '../outputs/extreme-voice-tests/',import.meta.url);
await mkdir(dir,{recursive:true});
const stateFile=new URL('jobs.json',dir);
const retryLowOnly=process.argv.includes('--retry-low-once');
let state;
try{state=JSON.parse(await readFile(stateFile,'utf8'));}catch(error){if(error.code!=='ENOENT')throw error;}
if(retryLowOnly && !state?.voices?.['extreme-low'])throw Error('Low retry requires an existing journal and low attempt');
state ||= {text:'こんにちは。今日はいい天気ですね。',visitor:randomUUID(),profiles,voices:{}};
if(JSON.stringify(state.profiles)!==JSON.stringify(profiles))throw Error('Saved experiment parameters differ; refusing reuse');
const save=()=>writeFile(stateFile,JSON.stringify(state,null,2));
// A separately approved retry preserves the uncertain attempt for audit.
// Re-running this flag can never allocate a second retry.
if(retryLowOnly){
 const old=state.voices['extreme-low'];
 if(!old.retryOf && (!old.uncertain || old.saved))throw Error('No uncertain low attempt eligible for the approved retry');
 if(old?.uncertain && !old.retryOf){
  state.previousAttempts ||= [];
  state.previousAttempts.push({profile:'extreme-low',...old});
  state.voices['extreme-low']={requestId:randomUUID(),action:'create',retryOf:old.requestId};
  await save();
 }
}
for(const profile of profiles.filter(profile=>!retryLowOnly || profile.name==='extreme-low')){
 const job=state.voices[profile.name] ||= {requestId:randomUUID(),action:'create'};
 await save();
 if(job.saved){console.log(JSON.stringify({profile:profile.name,status:'cached',bytes:job.bytes}));continue;}
 if(job.uncertain){console.log(JSON.stringify({profile:profile.name,status:'submission-uncertain',resubmitted:false}));continue;}
 const handler=createApizAudioHandler({
  env:settings.env,store,quotaClient:digest('local-preview'),
  authorize:async()=>`visitor:${digest(state.visitor)}`,
  // Local experiment: give each network operation its own deadline rather than
  // spending the function's short runtime budget on remote Blob bookkeeping.
  download:(url)=>downloadAudio(url,AbortSignal.timeout(30000)),
  fetch:async(url,init)=>{
   if(url==='https://api.apiz.ai/api/v3/tasks/create'){
    const body=JSON.parse(init.body);
    body.params.voice_setting={voice_id:profile.voice,speed:1,vol:1,pitch:profile.pitch,emotion:'calm'};
    if(profile.modify)body.params.voice_modify=profile.modify;
    else delete body.params.voice_modify;
    init={...init,body:JSON.stringify(body)};
   }
   const response=await fetch(url,{...init,signal:AbortSignal.timeout(60000)});
   if(url==='https://api.apiz.ai/api/v3/tasks/create'){
    const envelope=await response.clone().json().catch(()=>null);
    job.providerAcknowledged=!!envelope?.data?.task_id;
    if(job.providerAcknowledged)job.providerTaskId=envelope.data.task_id;
    await save();
   }
   return response;
  },
 });
 const deadline=Date.now()+300000;
 while(Date.now()<deadline){
  const body=job.action==='create'
   ?{action:'create',requestId:job.requestId,text:state.text,language:'ja-JP',voice:profile.voice,speed:1}
   :{action:'query',requestId:job.requestId};
  if(job.action==='create'){job.uncertain=true;await save();}
  const response=await handler(new Request('http://127.0.0.1:4174/api/audio',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}));
  if(response.ok && response.headers.get('content-type')?.startsWith('audio/')){
   const bytes=new Uint8Array(await response.arrayBuffer());
   await writeFile(new URL(`${profile.name}.mp3`,dir),bytes);
   Object.assign(job,{saved:true,uncertain:false,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')});
   await save();console.log(JSON.stringify({profile:profile.name,status:'saved',bytes:bytes.length}));break;
  }
  const data=await response.json();
  console.log(JSON.stringify({profile:profile.name,status:response.status,code:data.code}));
  if(response.status!==202)throw Error(`Stopped: ${data.code}; no automatic paid resubmission`);
  job.action='query';job.uncertain=false;await save();
  await new Promise(r=>setTimeout(r,5000));
 }
 if(!job.saved)throw Error('Still pending; rerun only to query saved task');
}
console.log(JSON.stringify({saved:Object.values(state.voices).filter(j=>j.saved).length,uncertain:Object.values(state.voices).filter(j=>j.uncertain).length,clientSideAudioModification:false}));
