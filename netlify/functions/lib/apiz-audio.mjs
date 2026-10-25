import {createHash} from 'node:crypto';
import {downloadAudio} from './audio-download.mjs';
import {reserveAudioQuota} from './audio-quota.mjs';

const BASE = 'https://api.apiz.ai';
const MAX_AUDIO = 4 * 1024 * 1024;
const JAPANESE_VOICES = new Set(['Japanese_CalmLady','Japanese_GentleButler','Japanese_CalmLady_ExtremeHigh','Japanese_GentleButler_MildLow']);
const json = (status, code, extra={}) => Response.json({code,...extra},{status,headers:{'Cache-Control':'no-store',...(status===429?{'Retry-After':'5'}:{})}});
const pending = () => json(202,'AUDIO_PENDING',{status:'processing',retryAfterMs:5000});
const hash = text => createHash('sha256').update(text).digest('hex');
const validId = id => typeof id==='string' && /^[a-f0-9-]{36}$/.test(id);

/** Each request does one short upstream operation. Blobs hold job IDs and MP3s,
 * not API keys or the original input text.
 * Slot claims are shared across instances; uncertain jobs keep their slot until
 * their provider status is reconciled, never silently expire and overlap work. */
export function createApizAudioHandler({env={},store,authorize,quotaClient,fetch:fetcher=globalThis.fetch,now=Date.now,checkAudioUrl,download=downloadAudio}={}) {
  const apiKey = env.APIZ_API_KEY;
  const namespace = hash(apiKey || 'disabled').slice(0,24);
  const taskKey = id => `${namespace}/tasks/${id}`;
  const audioKey = id => `${namespace}/audio/${id}`;
  const slotKey = n => `${namespace}/slots/${n}`;
  const write = (key,data,entry) => store.setJSON(key,data,entry?{onlyIfMatch:entry.etag}:{onlyIfNew:true});
  async function reserve(id) {
    for(let slot=0;slot<6;slot++) {
      const old=await store.getWithMetadata(slotKey(slot),{type:'json'});
      if(old?.data.requestId) continue;
      if((await write(slotKey(slot),{requestId:id},old)).modified) return slot;
    }
    return null;
  }
  async function release(slot,id) {
    if(slot===null || slot===undefined)return;
    const old=await store.getWithMetadata(slotKey(slot),{type:'json'});
    if(old?.data.requestId===id)await write(slotKey(slot),{requestId:null},old);
  }
  async function post(path,body,signal) {
    return fetcher(BASE+path,{method:'POST',redirect:'error',headers:{Authorization:`Bearer ${apiKey}`,'Content-Type':'application/json'},body:JSON.stringify(body),signal});
  }
  const mp3Response = bytes => new Response(bytes,{headers:{'Content-Type':'audio/mpeg','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
  async function audio(id,url,signal) {
    const saved=await store.getWithMetadata(audioKey(id),{type:'arrayBuffer'});
    if(saved) return mp3Response(saved.data);
    // The production downloader pins validated public DNS, follows no redirects,
    // and never sends the API key to the audio host.
    const response=checkAudioUrl
      ? await fetcher(await checkAudioUrl(url),{signal,redirect:'error'})
      : await download(url,signal);
    if(!response.ok || !/^audio\/(mpeg|mp3)(?:;|$)/i.test(response.headers.get('content-type')||''))throw Error('Invalid audio');
    const bytes=await response.arrayBuffer();
    if(!bytes.byteLength || bytes.byteLength>MAX_AUDIO)throw Error('Invalid audio');
    // Do not report success until the MP3 is durable; subsequent queries never
    // depend on the provider's expiring URL. The store is private to the backend.
    await store.set(audioKey(id),bytes,{onlyIfNew:true,metadata:{mimeType:'audio/mpeg',savedAt:new Date(now()).toISOString()}});
    return mp3Response(bytes);
  }
  async function complete(id,entry,data,signal) {
    const url=data.output?.audio_url || data.output?.url;
    const saved=await write(taskKey(id),{...entry.data,status:'completed',taskId:data.task_id||entry.data.taskId||null,url:typeof url==='string'?url:null},entry);
    if(!saved.modified)return pending();
    await release(entry.data.slot,id);
    return audio(id,url,signal);
  }
  return async request => {
    if(request.method!=='POST')return new Response('Method not allowed',{status:405,headers:{Allow:'POST'}});
    const origin=request.headers.get('origin');
    if(origin && origin!==new URL(request.url).origin || request.headers.get('sec-fetch-site')==='cross-site')return json(403,'AUDIO_FORBIDDEN');
    if(!/^application\/json(?:;|$)/i.test(request.headers.get('content-type')||''))return json(415,'AUDIO_JSON_REQUIRED');
    if(env.AI_AUDIO_ENABLED!=='true' || !apiKey)return json(503,'AUDIO_PROVIDER_NOT_CONFIGURED');
    const owner=await authorize?.(request);
    if(!owner)return json(403,'AUDIO_VISITOR_REQUIRED');
    let body;
    try {
      const raw=await request.text();if(raw.length>16000)throw Error();body=JSON.parse(raw);
      if(!validId(body.requestId) || !['create','query'].includes(body.action))throw Error();
      if(body.action==='create' && (typeof body.text!=='string' || !body.text.trim() || [...body.text].length>200 || body.language!=='ja-JP'))throw Error();
      if(body.action==='create' && body.voice!==undefined && body.voice!=='default' && !JAPANESE_VOICES.has(body.voice))throw Error();
    } catch{return json(400,'AUDIO_INVALID_INPUT');}
    const id=body.requestId, key=taskKey(id);
    const controller=new AbortController();
    const timeout=Math.min(25000,Math.max(1000,Number(env.AI_AUDIO_TIMEOUT_MS)||20000));
    const timer=setTimeout(()=>controller.abort(),timeout);
    try {
      let entry=await store.getWithMetadata(key,{type:'json'});
      if(entry && entry.data.owner!==owner)return json(403,'AUDIO_FORBIDDEN');
      if(body.action==='query') {
        if(!entry)return json(404,'AUDIO_NOT_FOUND');
        const job=entry.data;
        if(job.status==='completed') {
          await release(job.slot,id);
          return await audio(id,job.url,controller.signal);
        }
        if(job.status==='failed') {
          await release(job.slot,id);
          return json(502,'AUDIO_TASK_FAILED');
        }
        if(!job.taskId)return json(409,'AUDIO_SUBMISSION_UNCERTAIN');
        // Client timeout does not imply the provider cancelled the paid task.
        // Keep the reservation; later queries can still reconcile completion.
        const response=await post('/api/v3/tasks/query',{task_id:job.taskId},controller.signal);
        if(response.status===429)return json(429,'AUDIO_RATE_LIMIT');
        if(!response.ok)return json(502,'AUDIO_QUERY_FAILED');
        const data=(await response.json()).data;
        if(data?.status==='failed') {
          await write(key,{...job,status:'failed'},entry);await release(job.slot,id);
          return json(502,'AUDIO_TASK_FAILED');
        }
        if(data?.status==='completed') {
          return await complete(id,entry,data,controller.signal);
        }
        if(!['pending','processing'].includes(data?.status))return json(502,'AUDIO_INVALID_RESPONSE');
        return pending();
      }
      const digest=hash(body.text);
      const voiceId=body.voice===undefined || body.voice==='default'
        ? env.AI_AUDIO_VOICE_ID || 'Chinese (Mandarin)_Crisp_Girl' : body.voice;
      if(entry && entry.data.digest!==digest)return json(409,'AUDIO_REQUEST_CONFLICT');
      // Legacy jobs have no recorded voice. They remain queryable, but may not
      // be relabelled as an explicitly selected voice.
      if(entry && (entry.data.voiceId ? entry.data.voiceId!==voiceId : body.voice!==undefined && body.voice!=='default'))return json(409,'AUDIO_REQUEST_CONFLICT');
      if(entry && !['retryable'].includes(entry.data.status)) {
        if(entry.data.status==='pending' || entry.data.status==='completed')return pending();
        return json(409,'AUDIO_SUBMISSION_UNCERTAIN');
      }
      const job={owner,digest,voiceId,status:'submitting',createdAt:now()};
      const claim=await write(key,job,entry);
      if(!claim.modified)return json(409,'AUDIO_REQUEST_IN_PROGRESS');
      entry={data:job,etag:claim.etag};
      const slot=await reserve(id);
      if(slot===null){await write(key,{...job,status:'retryable'},entry);return json(429,'AUDIO_BUSY');}
      // A task record must be durable before making the non-idempotent paid call.
      const reserved=await write(key,{...job,slot},entry);
      if(!reserved.modified){await release(slot,id);return json(409,'AUDIO_REQUEST_IN_PROGRESS');}
      entry={data:{...job,slot},etag:reserved.etag};
      const limit=await reserveAudioQuota(store,id,quotaClient || owner,now());
      if(limit) {
        await write(key,{...entry.data,status:'retryable'},entry);
        await release(slot,id);
        return json(429,limit);
      }
      const response=await post('/api/v3/tasks/create',{
        model:'minimax/t2a',params:{text:body.text,
          voice_id:voiceId==='Japanese_CalmLady_ExtremeHigh' ? 'Japanese_CalmLady' : voiceId==='Japanese_GentleButler_MildLow' ? 'Japanese_GentleButler' : voiceId,
          ...(voiceId==='Japanese_CalmLady_ExtremeHigh' ? {
            voice_setting:{voice_id:'Japanese_CalmLady',speed:1,vol:1,pitch:12,emotion:'calm'},
            voice_modify:{pitch:100,intensity:100,timbre:100},
          } : voiceId==='Japanese_GentleButler_MildLow' ? {
            voice_setting:{voice_id:'Japanese_GentleButler',speed:1,vol:1,pitch:-4,emotion:'calm'},
          } : {}),
          language_boost:'Japanese',
          model:'speech-2.8-hd',speed:1,emotion:'calm',output_format:'url',continuous_sound:true},
      },controller.signal);
      if(response.status===429) {
        await write(key,{...entry.data,status:'retryable'},entry);await release(slot,id);
        return json(429,'AUDIO_RATE_LIMIT');
      }
      // Never auto-resubmit network/5xx/invalid replies: the paid task may exist.
      if(!response.ok){console.info('audio-create-http',response.status);return json(502,'AUDIO_SUBMISSION_UNCERTAIN');}
      const envelope=await response.json();
      console.info('audio-create-shape',JSON.stringify({keys:Object.keys(envelope||{}),dataKeys:Object.keys(envelope?.data||{})}));
      const data=envelope.data;
      if(data?.status==='completed')return await complete(id,entry,data,controller.signal);
      if(data?.status==='failed') {
        await write(key,{...entry.data,status:'failed'},entry);await release(slot,id);
        return json(502,'AUDIO_TASK_FAILED');
      }
      if(typeof data?.task_id!=='string' || !data.task_id)return json(502,'AUDIO_SUBMISSION_UNCERTAIN');
      await write(key,{...entry.data,status:'pending',taskId:data.task_id},entry);
      return pending();
    } catch {return json(controller.signal.aborted?504:502,controller.signal.aborted?'AUDIO_TIMEOUT':'AUDIO_UPSTREAM_ERROR');}
    finally {clearTimeout(timer);}
  };
}
