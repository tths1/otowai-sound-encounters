// Explicit opt-in, at most three paid submissions; reruns resume saved IDs.
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {createHash,randomUUID} from 'node:crypto';
import {loadLocalAudioSettings,createLocalAudioBackend} from './local-audio-backend.mjs';
if(process.env.ALLOW_PAID_VOICE_TEST!=='true')throw Error('Paid voice test approval required');
const dir=new URL('../outputs/voice-tests/',import.meta.url);
await mkdir(dir,{recursive:true});
const stateFile=new URL('jobs.json',dir);
let state;
try{state=JSON.parse(await readFile(stateFile,'utf8'));}catch(error){if(error.code!=='ENOENT')throw error;}
state ||= {visitor:randomUUID(),text:'こんにちは。今日はいい天気ですね。',voices:{}};
const save=()=>writeFile(stateFile,JSON.stringify(state,null,2));
const settings=await loadLocalAudioSettings();
if(settings.env.AI_AUDIO_VOICE_ID!=='Japanese_CalmLady')throw Error('Default voice changed: review before testing');
for(const voice of ['Japanese_CalmLady','Japanese_KindLady','Japanese_GentleButler']){
 const job=state.voices[voice] ||= {requestId:randomUUID(),action:'create'};
 await save();
 if(job.saved){console.log(JSON.stringify({voice,status:'cached',bytes:job.bytes}));continue;}
 if(job.uncertain)throw Error('Submission result uncertain; no automatic paid retry');
 const handler=await createLocalAudioBackend({...settings,env:{...settings.env,AI_AUDIO_VOICE_ID:voice}});
 const deadline=Date.now()+300000;
 while(Date.now()<deadline){
  const body=job.action==='create'?{action:'create',requestId:job.requestId,text:state.text,language:'ja-JP',voice:'default',speed:1}:{action:'query',requestId:job.requestId};
  if(job.action==='create'){job.uncertain=true;await save();}
  const r=await handler(new Request('http://127.0.0.1:4174/api/audio',{method:'POST',headers:{'Content-Type':'application/json','X-Audio-Visitor':state.visitor},body:JSON.stringify(body)}));
  if(r.ok&&r.headers.get('content-type')?.startsWith('audio/')){
   const bytes=new Uint8Array(await r.arrayBuffer());
   await writeFile(new URL(`${voice}.mp3`,dir),bytes);
   Object.assign(job,{saved:true,uncertain:false,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')});
   await save();console.log(JSON.stringify({voice,status:'saved',bytes:bytes.length}));break;
  }
  const data=await r.json();console.log(JSON.stringify({voice,status:r.status,code:data.code}));
  if(r.status!==202)throw Error('Stopped: '+data.code+'; paid submission will not repeat automatically');
  job.action='query';job.uncertain=false;await save();
  await new Promise(r=>setTimeout(r,5000));
 }
 if(!job.saved)throw Error('Task pending; rerun to query the same ID');
}
console.log('All three voice samples saved. No pitch/speed post-processing.');
