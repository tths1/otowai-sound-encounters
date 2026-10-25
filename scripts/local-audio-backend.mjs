// Credentials stay in this local Node process, never in static assets or logs.
import {readFile} from 'node:fs/promises';
import {homedir} from 'node:os';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {createApizAudioHandler} from '../netlify/functions/lib/apiz-audio.mjs';

export async function loadLocalAudioSettings(options={}) {
 const read=options.readFile||readFile;
 const fetcher=options.fetch||globalThis.fetch;
 const config=JSON.parse(await read(join(homedir(),'Library/Preferences/netlify/config.json'),'utf8'));
 const token=config.users?.[config.userId]?.auth?.token;
 if(!token)throw Error('Local Netlify sign-in required');
 const {siteId:siteID}=JSON.parse(await read(new URL('../.netlify/state.json',import.meta.url),'utf8'));
 async function get(path){
  const response=await fetcher(`https://api.netlify.com/api/v1${path}`,{headers:{Authorization:`Bearer ${token}`},signal:AbortSignal.timeout(20000)});
  if(!response.ok)throw Error(`Netlify configuration unavailable (${response.status})`);
  return response.json();
 }
 const site=await get(`/sites/${siteID}`);
 if(site.name!=='otowai-sound-encounters')throw Error('Unexpected Netlify site');
 const env={};
 await Promise.all(['APIZ_API_KEY','AI_AUDIO_ENABLED','AI_AUDIO_TIMEOUT_MS','AI_AUDIO_VOICE_ID'].map(async key=>{
  const item=await get(`/accounts/${site.account_id}/env/${key}?site_id=${siteID}`);
  env[key]=(item.values?.find(v=>v.context==='production')||item.values?.find(v=>v.context==='all'))?.value;
 }));
 const localApiKey=options.localApiKey ?? process.env.APIZ_API_KEY;
 if(localApiKey)env.APIZ_API_KEY=localApiKey.trim();
 if(env.AI_AUDIO_ENABLED!=='true'||!env.APIZ_API_KEY)throw Error('Production speech is not enabled');
 if(!/^sk-[A-Za-z0-9_-]{8,}$/.test(env.APIZ_API_KEY))throw Error('Netlify secret is hidden; a local API key is required');
 return {siteID,token,env};
}

export async function createLocalAudioBackend(settings) {
 const {getStore}=await import('../netlify/functions/node_modules/@netlify/blobs/dist/main.js');
 const digest=value=>createHash('sha256').update(`${settings.env.APIZ_API_KEY}:${value}`).digest('hex');
 return createApizAudioHandler({
  env:settings.env,
  store:getStore({name:'otowai-audio-jobs',consistency:'strong',siteID:settings.siteID,token:settings.token}),
  quotaClient:digest('local-preview'),
  authorize:async request=>{
   const visitor=request.headers.get('X-Audio-Visitor');
   return /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(visitor||'')?`visitor:${digest(visitor)}`:null;
  },
 });
}
