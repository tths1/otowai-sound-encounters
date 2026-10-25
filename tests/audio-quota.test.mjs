import test from 'node:test';
import assert from 'node:assert/strict';
import {reserveAudioQuota} from '../netlify/functions/lib/audio-quota.mjs';
function store(){let entry=null,n=0;return {
 async getWithMetadata(){return structuredClone(entry);},
 async setJSON(key,data,opts){if(opts.onlyIfNew&&entry || opts.onlyIfMatch&&opts.onlyIfMatch!==entry?.etag)return {modified:false};entry={data,etag:String(++n)};return {modified:true};}
};}
test('global daily cap is 1000 and duplicate retries do not consume another slot',async()=>{
 const s=store(),now=Date.UTC(2026,9,17,10);
 for(let i=0;i<1000;i++)assert.equal(await reserveAudioQuota(s,`r${i}`,`v${i}`,now),null);
 assert.equal(await reserveAudioQuota(s,'r0','v0',now),null);
 assert.equal(await reserveAudioQuota(s,'overflow','other',now),'AUDIO_DAILY_LIMIT');
 assert.equal(await reserveAudioQuota(s,'tomorrow','other',now+86400000),null);
});
test('simultaneous submissions cannot exceed rolling per-client cap',async()=>{
 const s=store();const results=await Promise.all(Array.from({length:10},(_,i)=>reserveAudioQuota(s,`r${i}`,'one-ip',100000)));
 assert.equal(results.filter(x=>x===null).length,3);
 assert.equal(await reserveAudioQuota(s,'later','one-ip',160001),null);
});
