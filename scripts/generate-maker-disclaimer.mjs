import {access,readFile,writeFile,unlink} from 'node:fs/promises';
import {randomUUID,createHash} from 'node:crypto';
import {loadLocalAudioSettings,createLocalAudioBackend} from './local-audio-backend.mjs';

if(process.env.ALLOW_PAID_MAKER_DISCLAIMER!=='true')throw Error('Paid maker disclaimer generation requires approval');
const output='static-site/maker-disclaimer.mp3';
const jobFile='outputs/maker-disclaimer-job.json';
try{await access(output);console.log(JSON.stringify({status:'cached'}));process.exit(0);}catch{}
const settings=await loadLocalAudioSettings();
const handler=await createLocalAudioBackend(settings);
const text='可以生成像这样的声音，用途由使用者自行决定';
let job;
try {
 job=JSON.parse(await readFile(jobFile,'utf8'));
 if(job.text!==text || !job.requestId || !job.visitor)throw Error('stale');
} catch {
 job={requestId:randomUUID(),visitor:randomUUID(),text,createdAt:new Date().toISOString()};
 await writeFile(jobFile,JSON.stringify(job,null,2)+'\n');
}
const {requestId,visitor}=job;
const request=body=>new Request('http://127.0.0.1:4174/api/audio',{method:'POST',headers:{'Content-Type':'application/json','X-Audio-Visitor':visitor},body:JSON.stringify(body)});
const deadline=Date.now()+300000;
let action='create';
while(Date.now()<deadline){
 const response=await handler(request(action==='create'?{action,requestId,text,language:'ja-JP',voice:'default',speed:1}:{action:'query',requestId}));
 if(response.ok&&response.headers.get('content-type')?.startsWith('audio/')){
  const bytes=new Uint8Array(await response.arrayBuffer());
  await writeFile(output,bytes);
  await unlink(jobFile).catch(()=>{});
  console.log(JSON.stringify({status:'saved',bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')}));
  process.exit(0);
 }
 const data=await response.json();
 console.log(JSON.stringify({status:response.status,code:data.code}));
 if(response.status!==202)throw Error(`audio generation stopped: ${data.code}`);
 action='query';
 await new Promise(resolve=>setTimeout(resolve,5000));
}
throw Error('audio generation timed out; no automatic resubmission');
