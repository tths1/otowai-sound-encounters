// Authorized batch: deployed service keeps its key private and enforces existing quotas.
import fs from 'node:fs/promises';
import vm from 'node:vm';
import {createHash,randomUUID} from 'node:crypto';
if(process.env.ALLOW_PAID_COLLECTION!=='true')throw Error('Paid batch approval required');
const source=await fs.readFile('static-site/app.js','utf8'),context={};
vm.runInNewContext(source.slice(0,source.indexOf('const DEFAULT_PHONETIC_ROWS'))+'this.items=entries;',context);
const dir='static-site/collection-audio';await fs.mkdir(dir,{recursive:true});
let state;try{state=JSON.parse(await fs.readFile('review/collection-audio-jobs.json','utf8'));}catch{state={visitor:randomUUID(),jobs:{}};}
const save=()=>fs.writeFile('review/collection-audio-jobs.json',JSON.stringify(state,null,2));
await save();
const pause=ms=>new Promise(r=>setTimeout(r,ms));
const manifest={version:1,voice:'Japanese_CalmLady',language:'Japanese',speed:1,entries:{}};
for(const [index,entry] of context.items.entries()){
 const text=entry.kana.replace(/\s+/g,'');
 const id=createHash('sha256').update(JSON.stringify({text,voice:manifest.voice,language:'Japanese',speed:1,model:'speech-2.8-hd'})).digest('hex').slice(0,24);
 const path=dir+'/'+id+'.mp3';
 let exists=false;try{exists=(await fs.stat(path)).size>100;}catch{}
 if(!exists){
  const job=state.jobs[id] ||= {requestId:randomUUID(),action:'create'};await save();
  const deadline=Date.now()+600000;
  while(Date.now()<deadline){
   const payload=job.action==='create'?{action:'create',requestId:job.requestId,text,language:'ja-JP',speed:1,voice:'default'}:{action:'query',requestId:job.requestId};
   const response=await fetch('https://otowai-sound-encounters.netlify.app/api/audio',{method:'POST',headers:{'Content-Type':'application/json','X-Audio-Visitor':state.visitor},body:JSON.stringify(payload),signal:AbortSignal.timeout(60000)});
   if(response.status===200 && response.headers.get('content-type')?.includes('audio/mpeg')){
    const bytes=Buffer.from(await response.arrayBuffer());if(bytes.length<100)throw Error('Empty audio');
    await fs.writeFile(path,bytes);job.saved=true;await save();exists=true;break;
   }
   const data=await response.json();
   if(response.status===202){job.action='query';await save();await pause(5000);continue;}
   if(data.code==='AUDIO_TIMEOUT'){await pause(5000);continue;}
   if(response.status===429 && data.code!=='AUDIO_DAILY_LIMIT'){await pause(10000);continue;}
   // One explicit recovery only; retain the ambiguous ID for billing review.
   if(data.code==='AUDIO_SUBMISSION_UNCERTAIN' && process.env.ALLOW_ONE_UNCERTAIN_RETRY==='true' && !job.ambiguousRequestId){
    job.ambiguousRequestId=job.requestId;job.requestId=randomUUID();job.action='create';await save();continue;
   }
   throw Error('Entry '+(index+1)+' stopped: '+(data.code||response.status)+'; request ID retained');
  }
  if(!exists)throw Error('Timed out; rerun to resume');
 }
 manifest.entries[entry.kana]='/collection-audio/'+id+'.mp3';
 await fs.writeFile(dir+'/manifest.json',JSON.stringify(manifest,null,2));
 console.log('Saved '+(index+1)+'/'+context.items.length+': '+entry.chinese);
}
console.log('COMPLETE: all collection recordings saved.');
